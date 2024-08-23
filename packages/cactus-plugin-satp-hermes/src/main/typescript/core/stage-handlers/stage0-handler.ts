import { Logger, LoggerProvider } from "@hyperledger/cactus-common";
import { SATPSession } from "../satp-session";
import { Stage0ServerService } from "../stage-services/server/stage0-server-service";
import {
  SATPHandler,
  SATPHandlerOptions,
  SATPHandlerType,
} from "../../types/satp-protocol";
import { ConnectRouter, HandlerContext } from "@connectrpc/connect";
import { SatpStage0Service } from "../../generated/proto/cacti/satp/v02/stage_0_connect";
import {
  NewSessionRequest,
  NewSessionResponse,
  PreSATPTransferRequest,
  PreSATPTransferResponse,
} from "../../generated/proto/cacti/satp/v02/stage_0_pb";
import { Stage0ClientService } from "../stage-services/client/stage0-client-service";
import {
  FailedToCreateMessageError,
  FailedToProcessError,
  SessionNotFoundError,
} from "../errors/satp-handler-errors";

export class Stage0SATPHandler implements SATPHandler {
  public static readonly CLASS_NAME = SATPHandlerType.STAGE0;
  private sessions: Map<string, SATPSession>;
  private serverService: Stage0ServerService;
  private clientService: Stage0ClientService;
  private logger: Logger;
  private pubKeys: Map<string, string>;
  constructor(ops: SATPHandlerOptions) {
    this.sessions = ops.sessions;
    this.serverService = ops.serverService as Stage0ServerService;
    this.clientService = ops.clientService as Stage0ClientService;
    this.logger = LoggerProvider.getOrCreate(ops.loggerOptions);
    this.logger.trace(`Initialized ${Stage0SATPHandler.CLASS_NAME}`);
    this.pubKeys = ops.pubkeys;
  }
  getHandlerSessions(): string[] {
    return Array.from(this.sessions.keys());
  }

  getHandlerIdentifier(): SATPHandlerType {
    return Stage0SATPHandler.CLASS_NAME;
  }

  public get Log(): Logger {
    return this.logger;
  }

  private async NewSessionImplementation(
    req: NewSessionRequest,
    context: HandlerContext,
  ): Promise<NewSessionResponse> {
    const stepTag = `NewSessionImplementation()`;
    const fnTag = `${this.getHandlerIdentifier()}#${stepTag}`;
    try {
      this.Log.debug(`${fnTag}, New Session...`);
      this.Log.debug(`${fnTag}, Request: ${req}, Context: ${context}`);

      let session = this.sessions.get(req.sessionId);

      if (
        req.senderGatewayNetworkId == "" ||
        this.pubKeys.has(req.senderGatewayNetworkId)
      ) {
        throw new Error();
      }

      session = await this.serverService.checkNewSessionRequest(
        req,
        session,
        this.pubKeys.get(req.senderGatewayNetworkId)!,
      );

      this.sessions.set(session.getSessionId(), session);

      const message = await this.serverService.newSessionResponse(req, session);

      if (!message) {
        throw new FailedToCreateMessageError(fnTag, "NewSessionResponse");
      }

      this.Log.debug(`${fnTag}, Returning response: ${message}`);

      return message;
    } catch (error) {
      throw new FailedToCreateMessageError(fnTag, "NewSessionResponse");
    }
  }

  private async PreSATPTransferImplementation(
    req: PreSATPTransferRequest,
    context: HandlerContext,
  ): Promise<PreSATPTransferResponse> {
    const stepTag = `PreSATPTransferImplementation()`;
    const fnTag = `${this.getHandlerIdentifier()}#${stepTag}`;
    try {
      this.Log.debug(`${fnTag},  PreSATPTransfer...`);
      this.Log.debug(`${fnTag}, Request: ${req}, Context: ${context}`);

      const session = this.sessions.get(req.sessionId);

      if (!session) {
        throw new SessionNotFoundError(fnTag);
      }

      await this.serverService.checkPreSATPTransferRequest(req, session);

      const message = await this.serverService.preSATPTransferResponse(
        req,
        session,
      );

      if (!message) {
        throw new FailedToCreateMessageError(fnTag, "PreSATPTransferResponse");
      }

      this.Log.debug(`${fnTag}, Returning response: ${message}`);

      return message;
    } catch (error) {
      throw new FailedToCreateMessageError(fnTag, "NewSessionResponse");
    }
  }

  setupRouter(router: ConnectRouter): void {
    router.service(SatpStage0Service, {
      newSession: this.NewSessionImplementation,
      preSATPTransfer: this.PreSATPTransferImplementation,
    });
  }

  //client side

  public async NewSessionRequest(
    sessionId: string,
  ): Promise<NewSessionRequest> {
    const stepTag = `NewSessionRequest()`;
    const fnTag = `${this.getHandlerIdentifier()}#${stepTag}`;
    try {
      this.Log.debug(`${fnTag}, New Session Request...`);

      const session = this.sessions.get(sessionId);

      if (!session) {
        throw new Error(`${fnTag}, Session not found`);
      }

      const message = await this.clientService.newSessionRequest(session);

      if (!message) {
        throw new FailedToCreateMessageError(fnTag, "NewSessionRequest");
      }

      return message;
    } catch (error) {
      throw new FailedToProcessError(fnTag, "NewSessionRequest");
    }
  }

  public async PreSATPTransferRequest(
    response: NewSessionResponse,
    sessionId: string,
  ): Promise<PreSATPTransferRequest> {
    const stepTag = `PreSATPTransferRequest()`;
    const fnTag = `${this.getHandlerIdentifier()}#${stepTag}`;
    try {
      this.Log.debug(`${fnTag}, Pre SATP Transfer Request...`);

      const session = this.sessions.get(sessionId);

      if (!session) {
        throw new Error(`${fnTag}, Session not found`);
      }

      const newSession = await this.clientService.checkNewSessionResponse(
        response,
        session,
        Array.from(this.sessions.keys()),
      );

      if (newSession.getSessionId() != session.getSessionId()) {
        this.sessions.set(newSession.getSessionId(), newSession);
        this.sessions.delete(session.getSessionId());
      }

      const message = await this.clientService.preSATPTransferRequest(session);

      if (!message) {
        throw new FailedToCreateMessageError(fnTag, "PreSATPTransferRequest");
      }

      return message;
    } catch (error) {
      throw new FailedToProcessError(fnTag, "PreSATPTransferRequest");
    }
  }
}
