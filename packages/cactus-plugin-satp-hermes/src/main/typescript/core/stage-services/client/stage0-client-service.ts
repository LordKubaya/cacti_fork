import { bufArray2HexStr, getHash, sign } from "../../../gateway-utils";
import {
  MessageType,
  WrapAssertionClaim,
} from "../../../generated/proto/cacti/satp/v02/common/message_pb";
import {
  NewSessionRequest,
  NewSessionResponse,
  PreSATPTransferRequest,
} from "../../../generated/proto/cacti/satp/v02/stage_0_pb";
import { SATPBridgesManager } from "../../../gol/satp-bridges-manager";
import {
  MissingBridgeManagerError,
  SessionError,
} from "../../errors/satp-service-errors";
import { SATPSession } from "../../satp-session";
import {
  copySessionDataAttributes,
  getMessageHash,
  saveHash,
  saveSignature,
  SessionType,
} from "../../session-utils";
import { SupportedChain } from "../../types";
import { signatureVerifier } from "../data-verifier";
import { Asset } from "../satp-bridge/types/asset";
import {
  SATPService,
  SATPServiceType,
  ISATPClientServiceOptions,
  ISATPServiceOptions,
} from "../satp-service";
import { protoToAsset } from "../service-utils";

export class Stage0ClientService extends SATPService {
  public static readonly SATP_STAGE = "0";
  public static readonly SERVICE_TYPE = SATPServiceType.Client;
  public static readonly SATP_SERVICE_INTERNAL_NAME = `stage-${this.SATP_STAGE}-${SATPServiceType[this.SERVICE_TYPE].toLowerCase()}`;

  private bridgeManager: SATPBridgesManager;

  constructor(ops: ISATPClientServiceOptions) {
    const commonOptions: ISATPServiceOptions = {
      stage: Stage0ClientService.SATP_STAGE,
      loggerOptions: ops.loggerOptions,
      serviceName: ops.serviceName,
      signer: ops.signer,
      serviceType: Stage0ClientService.SERVICE_TYPE,
    };
    super(commonOptions);
    if (ops.bridgeManager == undefined) {
      throw new MissingBridgeManagerError(
        `${this.getServiceIdentifier()}#constructor`,
      );
    }
    this.bridgeManager = ops.bridgeManager;
  }

  public async newSessionRequest(
    session: SATPSession,
  ): Promise<NewSessionRequest> {
    const stepTag = `newSessionRequest()`;
    const fnTag = `${this.getServiceIdentifier()}#${stepTag}`;

    if (session == undefined) {
      throw new SessionError(fnTag);
    }

    session.verify(fnTag, SessionType.CLIENT);

    const sessionData = session.getClientSessionData();

    const newSessionRequestMessage = new NewSessionRequest();
    newSessionRequestMessage.sessionId = sessionData.id;
    newSessionRequestMessage.contextId = sessionData.transferContextId;
    newSessionRequestMessage.recipientGatewayNetworkId =
      sessionData.recipientGatewayNetworkId;
    newSessionRequestMessage.senderGatewayNetworkId =
      sessionData.senderGatewayNetworkId;
    const messageSignature = bufArray2HexStr(
      sign(this.Signer, JSON.stringify(newSessionRequestMessage)),
    );

    newSessionRequestMessage.clientSignature = messageSignature;

    saveSignature(
      sessionData,
      MessageType.NEW_SESSION_REQUEST,
      messageSignature,
    );

    saveHash(
      sessionData,
      MessageType.NEW_SESSION_REQUEST,
      getHash(newSessionRequestMessage),
    );

    this.Log.info(`${fnTag}, sending NewSessionRequest...`);

    return newSessionRequestMessage;
  }

  public async checkNewSessionResponse(
    response: NewSessionResponse,
    session: SATPSession,
    sessionIds: string[],
  ): Promise<SATPSession> {
    const stepTag = `checkNewSessionResponse()`;
    const fnTag = `${this.getServiceIdentifier()}#${stepTag}`;

    if (session == undefined) {
      throw new SessionError(fnTag);
    }

    session.verify(fnTag, SessionType.CLIENT);

    const sessionData = session.getClientSessionData();

    if (response.sessionId == "") {
      throw new Error(`${fnTag}, Session ID is missing`);
    }

    if (
      response.contextId == "" ||
      response.contextId != sessionData.transferContextId
    ) {
      throw new Error(`${fnTag}, Context ID is missing`);
    }

    if (response.serverSignature == "") {
      throw new Error(`${fnTag}, Server Signature is missing`);
    }

    if (
      response.recipientGatewayNetworkId == "" ||
      response.recipientGatewayNetworkId !=
        sessionData.recipientGatewayNetworkId
    ) {
      throw new Error();
    }

    if (
      response.senderGatewayNetworkId == "" ||
      response.senderGatewayNetworkId != sessionData.senderGatewayNetworkId
    ) {
      throw new Error();
    }

    if (
      request.hashPreviousMessage !=
      getMessageHash(sessionData, MessageType.NEW_SESSION_REQUEST)
    ) {
      throw new Error(`${fnTag}, Hash of previous message does not match`);
    }

    signatureVerifier(fnTag, this.Signer, response, sessionData);

    if (sessionData.id != response.sessionId) {
      if (!sessionIds.includes(response.sessionId)) {
        throw new Error(`${fnTag}, Session ID already used`);
      }

      session = new SATPSession({
        contextID: response.contextId,
        sessionID: response.sessionId,
        server: false,
        client: true,
      });

      copySessionDataAttributes(
        sessionData,
        session.getClientSessionData(),
        response.sessionId,
        response.contextId,
      );
    }
    return session;
  }

  public async preSATPTransferRequest(
    session: SATPSession,
  ): Promise<PreSATPTransferRequest> {
    const stepTag = `preSATPTransferRequest()`;
    const fnTag = `${this.getServiceIdentifier()}#${stepTag}`;

    if (session == undefined) {
      throw new SessionError(fnTag);
    }

    session.verify(fnTag, SessionType.CLIENT);

    const sessionData = session.getClientSessionData();

    if (sessionData.receiverContractOntology == "") {
      throw new Error();
    }

    if (sessionData.sourceLedgerAssetId == "") {
      throw new Error();
    }

    if (sessionData.senderGatewayNetworkId == "") {
      throw new Error();
    }

    if (sessionData.senderAsset == undefined) {
      throw new Error();
    }

    if (sessionData.receiverAsset == undefined) {
      throw new Error();
    }

    await this.wrapToken(
      session,
      protoToAsset(
        sessionData.senderAsset,
        sessionData.senderGatewayNetworkId as SupportedChain,
      ),
    );

    const preSATPTransferRequest = new PreSATPTransferRequest();
    preSATPTransferRequest.sessionId = sessionData.id;
    preSATPTransferRequest.contextId = sessionData.transferContextId;
    preSATPTransferRequest.clientTransferNumber =
      sessionData.clientTransferNumber;
    preSATPTransferRequest.senderGatewayNetworkId =
      sessionData.senderGatewayNetworkId;
    preSATPTransferRequest.recipientGatewayNetworkId =
      sessionData.recipientGatewayNetworkId;
    preSATPTransferRequest.senderAsset = sessionData.senderAsset;
    preSATPTransferRequest.receiverAsset = sessionData.receiverAsset;
    preSATPTransferRequest.hashPreviousMessage = getMessageHash(
      sessionData,
      MessageType.NEW_SESSION_RESPONSE,
    );

    const messageSignature = bufArray2HexStr(
      sign(this.Signer, JSON.stringify(preSATPTransferRequest)),
    );

    preSATPTransferRequest.clientSignature = messageSignature;

    saveSignature(
      sessionData,
      MessageType.PRE_SATP_TRANSFER_REQUEST,
      messageSignature,
    );

    saveHash(
      sessionData,
      MessageType.PRE_SATP_TRANSFER_REQUEST,
      getHash(preSATPTransferRequest),
    );

    this.Log.info(`${fnTag}, sending PreSATPTransferRequest...`);

    return preSATPTransferRequest;
  }

  private async wrapToken(session: SATPSession, token: Asset): Promise<void> {
    const stepTag = `wrapToken()`;
    const fnTag = `${this.getServiceIdentifier()}#${stepTag}`;
    try {
      this.Log.info(`${fnTag}, Wrapping Asset...`);

      if (session == undefined) {
        throw new SessionError(fnTag);
      }

      session.verify(fnTag, SessionType.CLIENT);

      const sessionData = session.getClientSessionData();

      const assetId = token.tokenId;
      const amount = token.amount.toString();

      this.Log.debug(`${fnTag}, Wrap Asset ID: ${assetId} amount: ${amount}`);
      if (assetId == undefined) {
        throw new Error(`${fnTag}, Asset ID is missing`);
      }

      const bridge = this.bridgeManager.getBridge(
        sessionData.senderGatewayNetworkId,
      );

      sessionData.senderWrapAssertionClaim = new WrapAssertionClaim();
      sessionData.senderWrapAssertionClaim.receipt =
        await bridge.wrapAsset(token);

      sessionData.senderWrapAssertionClaim.signature = bufArray2HexStr(
        sign(this.Signer, sessionData.senderWrapAssertionClaim.receipt),
      );
    } catch (error) {
      throw new Error(`${fnTag}, Failed to process Wrap Asset ${error}`);
    }
  }
}
