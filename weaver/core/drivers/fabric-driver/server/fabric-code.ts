/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import * as grpc from '@grpc/grpc-js';
const crypto = require('node:crypto');
import { connect, Gateway, GrpcClient, Identity, Proposal, signers } from "@hyperledger/fabric-gateway";
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
const getNetworkGateway = async (networkName: string): Promise<Gateway> => {
  try {
    const config = getConfig();
    const userName = config.relay.name;
    const wallet = await getWallet(walletPath);

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
    const keyPath = process.env.SIGN_CERT_KEY_PATH!;
    if (!fs.existsSync(certPath) || !fs.existsSync(keyPath)) {
      throw new Error(`Missing cert or key files at ${certPath} or ${keyPath}`);
    }

    const identity: Identity = {
      mspId: process.env.MSP_ID!,
      credentials: fs.readFileSync(certPath),
    };

    const privateKeyPem = fs.readFileSync(keyPath);
    const privateKeyObject = crypto.createPrivateKey(privateKeyPem);
    const signer = signers.newPrivateKeySigner(privateKeyObject);

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
  logger.info('Running query on fabric network');

  const parsedAddress = parseAddress(query.getAddress());
  const chaincodeId = process.env.INTEROP_CHAINCODE || 'interop';
  const queryBase64 = Buffer.from(query.serializeBinary()).toString('base64');

  try {
    const gateway = await getNetworkGateway(networkName);
    const network = gateway.getNetwork(parsedAddress.channel);
    const contract = network.getContract(chaincodeId);

    const args = funcName === 'HandleExternalRequest'
      ? [queryBase64]
      : [queryBase64, dynamicArg ? dynamicArg.toString() : ''];

    const identities = query.getPolicyList();
    logger.debug(`Using endorsement policy: ${identities}`);

    const proposal = contract.newProposal(funcName, {
      arguments: args,
      // new SDK way to filter endorsing orgs
      endorsingOrganizations: identities.length > 0 ? identities : undefined,
    });

    const endorsedTxn = await proposal.endorse();
    const resultBytes = endorsedTxn.getResult();

    const viewPayload = new view_data.FabricView();
    const endorsedResponses: view_data.FabricView.EndorsedProposalResponse[] = [];

    const endorsedResp = new view_data.FabricView.EndorsedProposalResponse();
    endorsedResp.setPayload(
      proposalResponse.ProposalResponsePayload.deserializeBinary(resultBytes),
    );
    // optional: set dummy endorsement if needed (e.g., placeholder only)
    endorsedResponses.push(endorsedResp);

    viewPayload.setEndorsedProposalResponsesList(endorsedResponses);

    gateway.close();
    return viewPayload;
  } catch (error) {
    logger.error(`Failed to invoke Fabric query: ${error}`);
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
