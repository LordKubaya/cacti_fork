/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import * as grpc from '@grpc/grpc-js';
import { connect, Gateway, GrpcClient, Identity, signers } from "@hyperledger/fabric-gateway";
import { Endorser } from "fabric-common";
import * as path from "path";
import * as fs from "fs";
import query_pb from "@hyperledger/cacti-weaver-protos-js/common/query_pb";
import view_data from "@hyperledger/cacti-weaver-protos-js/fabric/view_data_pb";
import proposalResponse from "@hyperledger/cacti-weaver-protos-js/peer/proposal_response_pb";
import state_pb from "@hyperledger/cacti-weaver-protos-js/common/state_pb";
import { Certificate } from "@fidm/x509";
import { getConfig } from "./walletSetup";
import logger from "./logger";

const parseAddress = (address: string) => {
  const addressList = address.split("/");
  const fabricArgs = addressList[2].split(":");
  return {
    channel: fabricArgs[0],
    contract: fabricArgs[1],
    ccFunc: fabricArgs[2],
    args: fabricArgs.slice(3),
  };
};

// Get a handle to a network gateway using existing wallet credentials
export const getNetworkGateway = async (networkName: string): Promise<Gateway> => {
  try {
    const config = getConfig();
    const userName = config.relay.name;

    // Load TLS cert
    const tlsCertPath = process.env.PEER_TLS_CERT_PATH!;
    if (!fs.existsSync(tlsCertPath)) {
      throw new Error(`TLS cert not found at ${tlsCertPath}`);
    }
    const tlsCert = fs.readFileSync(tlsCertPath);
    const grpcCredentials = grpc.credentials.createSsl(Buffer.from(tlsCert));

    // gRPC connection
    const peerEndpoint = process.env.PEER_ENDPOINT!;
    const client: GrpcClient = new grpc.Client(peerEndpoint, grpcCredentials, {
      'grpc.ssl_target_name_override': process.env.PEER_HOST_ALIAS,
    }
    ) as unknown as GrpcClient;

    // Load identity
    const certPath = process.env.CERT_PATH!;
    const keyPath = process.env.PRIVATE_KEY_PATH!;
    if (!fs.existsSync(certPath) || !fs.existsSync(keyPath)) {
      throw new Error(`Missing cert or key files at ${certPath} or ${keyPath}`);
    }

    const identity: Identity = {
      mspId: process.env.MSP_ID!,
      credentials: fs.readFileSync(certPath),
    };

    const privateKeyPem = fs.readFileSync(keyPath);
    const signer = signers.newPrivateKeySigner(privateKeyPem);

    // Connect using new Gateway SDK
    const gateway = connect({
      client,
      identity,
      signer,
    });

    logger.debug(`Connected to gateway for network: ${networkName}`);
    return gateway;
  } catch (error) {
    logger.error(`Failed to instantiate network (channel): ${error}`);
    throw error;
  }
};

// Main invoke function wtih logic to handle policy and turn response from chaincode into a view.
// 1. Prepare credentials/gateway for communicating with fabric network
// 2. Prepare info required for invoke (address/policy)
// 3. Set the endorser list for the transaction, this enforces that the list provided will endorse the proposed transaction
// 4. Prepare the view and return.
async function invoke(
  query: query_pb.Query,
  networkName: string,
  funcName: string,
  dynamicArg?: Buffer,
): Promise<view_data.FabricView> {
  logger.info("Running query on fabric network");
  try {
    // 1. Prepare credentials/gateway for communicating with fabric network
    const gateway = await getNetworkGateway(networkName);

    // 2. Prepare info required for query (address/policy)
    const parsedAddress = parseAddress(query.getAddress());
    // Get the network (channel) our contract is deployed to.
    logger.debug(`Channel: ${parsedAddress.channel}`);
    const network = await gateway.getNetwork(parsedAddress.channel);
    const currentChannel = network.getChannel();
    const endorsers = currentChannel.getEndorsers();
    logger.info(`policy: ${query.getPolicyList()}`);
    const chaincodeId = process.env.INTEROP_CHAINCODE
      ? process.env.INTEROP_CHAINCODE
      : "interop";

    // LOGIC for getting identities from the provided policy. If none can be found it will default to all.
    const identities = query.getPolicyList();

    logger.debug(
      `Message: ${query.getAddress() + query.getNonce()} ${identities}`,
    );
    const cert = Certificate.fromPEM(Buffer.from(query.getCertificate()));
    const orgName = cert.issuer.organizationName;
    logger.info(
      `CC ARGS:
            ${parsedAddress.ccFunc},
            ${parsedAddress.args},
            ${query.getRequestingNetwork()},
            ${query.getRequestingOrg() ? query.getRequestingOrg() : orgName},
            ${query.getCertificate()},
            ${query.getRequestorSignature()},
            ${query.getAddress() + query.getNonce()}`,
    );
    const b64QueryBytes = Buffer.from(query.serializeBinary()).toString(
      "base64",
    );

    const idx = gateway.identityContext.calculateTransactionId();
    const queryProposal = currentChannel.newQuery(chaincodeId);
    let request;
    if (funcName == "HandleExternalRequest") {
      request = {
        fcn: funcName,
        args: [b64QueryBytes],
        generateTransactionId: false,
      };
    } else {
      request = {
        fcn: funcName,
        args: [b64QueryBytes, dynamicArg ? dynamicArg.toString() : ""],
        generateTransactionId: false,
      };
    }
    queryProposal.build(idx, request);
    queryProposal.sign(idx);
    // 3. Set the endorser list for the transaction, this enforces that the list provided will endorse the proposed transaction
    let proposalRequest;
    if (identities.length > 0) {
      const endorserList = endorsers.filter((endorser: Endorser) => {
        //@ts-expect-error: should expect string
        const cert = Certificate.fromPEM(endorser.options.pem);
        const orgName = cert.issuer.organizationName;
        return (
          identities.includes(endorser.mspid) || identities.includes(orgName)
        );
      });
      logger.debug(`Set endorserList: ${endorserList}`);
      proposalRequest = {
        targets: endorserList,
        requestTimeout: 30000,
      };
    } else {
      // When no identities provided it will default to all peers
      logger.debug(`Set endorsers: ${endorsers}`);
      proposalRequest = {
        targets: endorsers,
        requestTimeout: 30000,
      };
    }

    // submit query transaction and get result from chaincode
    const proposalResponseResult = await queryProposal.send(proposalRequest);
    //logger.debug(`${JSON.stringify(proposalResponseResult, null, 2)}`)

    // 4. Prepare the view and return.
    const viewPayload = new view_data.FabricView();
    const endorsedProposalResponses: view_data.FabricView.EndorsedProposalResponse[] =
      [];

    let endorsementCounter = 0;
    proposalResponseResult.responses.forEach((response) => {
      const endorsement = new proposalResponse.Endorsement();
      endorsement.setSignature(response.endorsement.signature);
      endorsement.setEndorser(response.endorsement.endorser);

      // Create EndorsedProposalResponse
      const endorsedProposalResponse =
        new view_data.FabricView.EndorsedProposalResponse();
      endorsedProposalResponse.setPayload(
        proposalResponse.ProposalResponsePayload.deserializeBinary(
          response.payload,
        ),
      );
      endorsedProposalResponse.setEndorsement(endorsement);

      // Add to list of endorsedProposalResponses
      endorsedProposalResponses.push(endorsedProposalResponse);

      logger.info(
        `InteropPayload: ${endorsementCounter}, ${Buffer.from(response.response.payload).toString("base64")}`,
      );
      logger.info(
        `Endorsement: ${endorsementCounter}, ${Buffer.from(endorsement.serializeBinary()).toString("base64")}`,
      );
      endorsementCounter++;
    });
    viewPayload.setEndorsedProposalResponsesList(endorsedProposalResponses);
    // Disconnect from the gateway.
    gateway.disconnect();
    return viewPayload;
  } catch (error) {
    logger.error(`Failed to submit transaction: ${error}`);
    throw error;
  }
}

// Package view and send to relay
function packageFabricView(
  query: query_pb.Query,
  viewData: view_data.FabricView,
) {
  const meta = new state_pb.Meta();
  meta.setTimestamp(new Date().toISOString());
  meta.setProofType("Notarization");
  meta.setSerializationFormat("STRING");
  meta.setProtocol(state_pb.Meta.Protocol.FABRIC);
  const view = new state_pb.View();
  view.setMeta(meta);
  view.setData(viewData ? viewData.serializeBinary() : Buffer.from(""));
  const viewPayload = new state_pb.ViewPayload();
  viewPayload.setView(view);
  viewPayload.setRequestId(query.getRequestId());
  return viewPayload;
}

export { getNetworkGateway, invoke, packageFabricView };
