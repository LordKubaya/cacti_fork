import { bufArray2HexStr, sign, verifySignature } from "../../../gateway-utils";
import {
  MessageType,
  WrapAssertionClaim,
} from "../../../generated/proto/cacti/satp/v02/common/message_pb";
import {
  NewSessionRequest,
  NewSessionResponse,
  PreSATPTransferRequest,
  PreSATPTransferResponse,
  STATUS,
} from "../../../generated/proto/cacti/satp/v02/stage_0_pb";
import { SATPBridgesManager } from "../../../gol/satp-bridges-manager";
import {
  MissingBridgeManagerError,
  SessionError,
  SignatureVerificationError,
} from "../../errors/satp-service-errors";
import { SATPSession } from "../../satp-session";
import {
  getMessageHash,
  saveHash,
  saveSignature,
  SessionType,
} from "../../session-utils";
import { Asset, createAssetId } from "../satp-bridge/types/asset";
import {
  SATPService,
  SATPServiceType,
  ISATPServerServiceOptions,
  ISATPServiceOptions,
} from "../satp-service";
import { compareProtoAsset, protoToAsset } from "../service-utils";

export class Stage0ServerService extends SATPService {
  public static readonly SATP_STAGE = "0";
  public static readonly SERVICE_TYPE = SATPServiceType.Server;
  public static readonly SATP_SERVICE_INTERNAL_NAME = `stage-${this.SATP_STAGE}-${SATPServiceType[this.SERVICE_TYPE].toLowerCase()}`;

  private bridgeManager: SATPBridgesManager;

  constructor(ops: ISATPServerServiceOptions) {
    // for now stage1serverservice does not have any different options than the SATPService class

    const commonOptions: ISATPServiceOptions = {
      stage: Stage0ServerService.SATP_STAGE,
      loggerOptions: ops.loggerOptions,
      serviceName: ops.serviceName,
      signer: ops.signer,
      serviceType: Stage0ServerService.SERVICE_TYPE,
    };
    super(commonOptions);
    if (ops.bridgeManager == undefined) {
      throw new MissingBridgeManagerError(
        `${this.getServiceIdentifier()}#constructor`,
      );
    }
    this.bridgeManager = ops.bridgeManager;
  }

  public async checkNewSessionRequest(
    request: NewSessionRequest,
    session: SATPSession | undefined,
    clientPubKey: string,
  ): Promise<SATPSession> {
    const stepTag = `checkNewSessionRequest()`;
    const fnTag = `${this.getServiceIdentifier()}#${stepTag}`;

    if (request == undefined) {
      throw new Error(`${fnTag}, Request is undefined`);
    }

    if (request.clientSignature == undefined) {
      throw new Error(`${fnTag}, Request client signature is undefined`);
    }

    if (request.sessionId == "") {
      throw new Error(`${fnTag}, Request session ID is undefined`);
    }

    if (request.senderGatewayNetworkId == "") {
      throw new Error();
    }

    if (request.recipientGatewayNetworkId == "") {
      throw new Error();
    }

    if (!verifySignature(this.Signer, request, clientPubKey)) {
      throw new SignatureVerificationError(fnTag);
    }

    if (session == undefined) {
      this.Log.debug(`${fnTag}, Session is undefined needs to be created`);
      session = new SATPSession({
        contextID: request.contextId,
        sessionID: request.sessionId,
        server: true,
        client: false,
      });
    } else if (session.getServerSessionData() == undefined) {
      this.Log.debug(`${fnTag}, Session does not have server session data`);
      session.createSessionData(
        SessionType.SERVER,
        request.sessionId,
        request.contextId,
      );
    } else {
      this.Log.debug(`${fnTag}, Session is already has a server session`);
      session = new SATPSession({
        contextID: request.contextId,
        server: true,
        client: false,
      });
      this.Log.debug(
        `${fnTag}, Session created with new sessionID ${session.getSessionId()}`,
      );
    }

    const newSessionData = session.getServerSessionData();

    newSessionData.clientGatewayPubkey = clientPubKey;

    saveSignature(
      newSessionData,
      MessageType.NEW_SESSION_REQUEST,
      request.clientSignature,
    );

    saveHash(newSessionData, MessageType.NEW_SESSION_REQUEST, fnTag);

    this.Log.info(`${fnTag}, NewSessionRequest passed all checks.`);
    return session;
  }

  public async checkPreSATPTransferRequest(
    request: PreSATPTransferRequest,
    session: SATPSession,
  ): Promise<void> {
    const stepTag = `checkPreSATPTransferRequest()`;
    const fnTag = `${this.getServiceIdentifier()}#${stepTag}`;

    if (session == undefined) {
      throw new SessionError(fnTag);
    }

    session.verify(fnTag, SessionType.SERVER);

    const sessionData = session.getServerSessionData();

    if (request.sessionId != sessionData.id) {
      throw new Error(`${fnTag}, Session ID does not match`);
    }

    if (request.senderGatewayNetworkId != sessionData.senderGatewayNetworkId) {
      throw new Error(`${fnTag}, Sender Gateway Network ID does not match`);
    }

    if (
      request.recipientGatewayNetworkId != sessionData.recipientGatewayNetworkId
    ) {
      throw new Error(`${fnTag}, Recipient Gateway Network ID does not match`);
    }

    if (request.senderAsset == undefined) {
      throw new Error(`${fnTag}, Sender Asset is missing`);
    }

    if (request.receiverAsset == undefined) {
      throw new Error(`${fnTag}, Receiver Asset is missing`);
    }

    if (
      request.hashPreviousMessage !=
      getMessageHash(sessionData, MessageType.NEW_SESSION_REQUEST)
    ) {
      throw new Error(`${fnTag}, Hash of previous message does not match`);
    }

    if (request.clientSignature == "") {
      throw new Error(`${fnTag}, Client Signature is missing`);
    }

    if (
      !verifySignature(this.Signer, request, sessionData.clientGatewayPubkey)
    ) {
      throw new Error(`${fnTag}, Client Signature is invalid`);
    }

    if (!compareProtoAsset(request.senderAsset, sessionData.senderAsset!)) {
      throw new Error(`${fnTag}, Sender Asset does not match`);
    }

    if (!compareProtoAsset(request.receiverAsset, sessionData.receiverAsset!)) {
      throw new Error(`${fnTag}, Receiver Asset does not match`);
    }

    if (request.wrapAssertionClaim == undefined) {
      throw new Error(`${fnTag}, Wrap Assertion Claim is missing`);
    }

    if (request.clientTransferNumber != "") {
      this.Log.info(
        `${fnTag}, Optional variable loaded: clientTransferNumber...`,
      );
      sessionData.clientTransferNumber = request.clientTransferNumber;
    }

    saveSignature(
      sessionData,
      MessageType.PRE_SATP_TRANSFER_REQUEST,
      request.clientSignature,
    );

    saveHash(sessionData, MessageType.PRE_SATP_TRANSFER_REQUEST, fnTag);

    this.Log.info(`${fnTag}, PreSATPTransferRequest passed all checks.`);
  }

  public async newSessionResponse(
    request: NewSessionRequest,
    session: SATPSession,
  ): Promise<NewSessionResponse> {
    const stepTag = `newSessionResponse()`;
    const fnTag = `${this.getServiceIdentifier()}#${stepTag}`;

    if (session == undefined) {
      throw new SessionError(fnTag);
    }
    const sessionData = session.getServerSessionData();

    const newSessionResponse = new NewSessionResponse();

    if (sessionData.id != request.sessionId) {
      newSessionResponse.status = STATUS.STATUS_REJECTED;
    } else {
      newSessionResponse.status = STATUS.STATUS_ACCEPTED;
    }
    newSessionResponse.sessionId = sessionData.id;
    newSessionResponse.contextId = sessionData.transferContextId;
    newSessionResponse.recipientGatewayNetworkId =
      sessionData.recipientGatewayNetworkId;
    newSessionResponse.senderGatewayNetworkId =
      sessionData.senderGatewayNetworkId;

    newSessionResponse.hashPreviousMessage = getMessageHash(
      sessionData,
      MessageType.NEW_SESSION_REQUEST,
    );

    const messageSignature = bufArray2HexStr(
      sign(this.Signer, JSON.stringify(newSessionResponse)),
    );

    newSessionResponse.serverSignature = messageSignature;

    saveSignature(
      sessionData,
      MessageType.NEW_SESSION_REQUEST,
      messageSignature,
    );

    saveHash(sessionData, MessageType.NEW_SESSION_REQUEST, fnTag);

    this.Log.info(`${fnTag}, sending NewSessionRequest...`);

    return newSessionResponse;
  }

  public async preSATPTransferResponse(
    request: PreSATPTransferRequest,
    session: SATPSession,
  ): Promise<PreSATPTransferResponse> {
    const stepTag = `preSATPTransferResponse()`;
    const fnTag = `${this.getServiceIdentifier()}#${stepTag}`;

    if (session == undefined) {
      throw new SessionError(fnTag);
    }

    session.verify(fnTag, SessionType.SERVER);

    const sessionData = session.getServerSessionData();

    const preSATPTransferResponse = new PreSATPTransferResponse();

    preSATPTransferResponse.sessionId = sessionData.id;
    preSATPTransferResponse.contextId = sessionData.transferContextId;

    preSATPTransferResponse.hashPreviousMessage = getMessageHash(
      sessionData,
      MessageType.PRE_SATP_TRANSFER_REQUEST,
    );

    if (request.receiverAsset == undefined) {
      throw new Error(`${fnTag}, Receiver Asset is missing`);
    }

    sessionData.receiverAsset!.tokenId = createAssetId(
      request.contextId,
      request.receiverAsset.tokenType,
      sessionData.senderGatewayNetworkId,
    );

    await this.wrapToken(
      session,
      protoToAsset(
        request.receiverAsset,
        sessionData.recipientGatewayNetworkId,
      ),
    );

    preSATPTransferResponse.wrapAssertionClaim =
      sessionData.receiverWrapAssertionClaim;
    preSATPTransferResponse.recipientTokenId =
      sessionData.receiverAsset!.tokenId;

    const messageSignature = bufArray2HexStr(
      sign(this.Signer, JSON.stringify(preSATPTransferResponse)),
    );

    preSATPTransferResponse.serverSignature = messageSignature;

    saveSignature(
      sessionData,
      MessageType.PRE_SATP_TRANSFER_REQUEST,
      messageSignature,
    );

    saveHash(sessionData, MessageType.PRE_SATP_TRANSFER_REQUEST, fnTag);

    this.Log.info(`${fnTag}, sending PreSATPTransferResponse...`);

    return preSATPTransferResponse;
  }

  async wrapToken(session: SATPSession, token: Asset): Promise<void> {
    const stepTag = `wrapToken()`;
    const fnTag = `${this.getServiceIdentifier()}#${stepTag}`;
    try {
      this.Log.info(`${fnTag}, Wrapping Asset...`);

      if (session == undefined) {
        throw new SessionError(fnTag);
      }

      session.verify(fnTag, SessionType.CLIENT);

      const sessionData = session.getClientSessionData();

      const assetId = sessionData?.transferInitClaims?.digitalAssetId;
      const amount = sessionData?.transferInitClaims?.amountFromOriginator;

      this.Log.debug(`${fnTag}, Wrap Asset ID: ${assetId} amount: ${amount}`);
      if (assetId == undefined) {
        throw new Error(`${fnTag}, Asset ID is missing`);
      }

      const bridge = this.bridgeManager.getBridge(
        sessionData.senderGatewayNetworkId,
      );

      sessionData.receiverWrapAssertionClaim = new WrapAssertionClaim();
      sessionData.receiverWrapAssertionClaim.receipt =
        await bridge.wrapAsset(token);

      sessionData.receiverWrapAssertionClaim.signature = bufArray2HexStr(
        sign(this.Signer, sessionData.receiverWrapAssertionClaim.receipt),
      );
    } catch (error) {
      throw new Error(`${fnTag}, Failed to process Wrap Asset ${error}`);
    }
  }
}
