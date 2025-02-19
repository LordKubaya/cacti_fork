// a helper class to manage connections to counterparty gateways
import {
  ILoggerOptions,
  JsObjectSigner,
  LogLevelDesc,
  Logger,
  LoggerProvider,
} from "@hyperledger/cactus-common";
import {
  GatewayIdentity,
  GatewayChannel,
  SATPServiceInstance,
} from "../core/types";
import {
  Client as ConnectClient,
  Transport as ConnectTransport,
} from "@connectrpc/connect";

import { Express } from "express";
import { stringify as safeStableStringify } from "safe-stable-stringify";

import { expressConnectMiddleware } from "@connectrpc/connect-express";

import { SatpStage0Service } from "../generated/proto/cacti/satp/v02/service/stage_0_pb";
import { SatpStage1Service } from "../generated/proto/cacti/satp/v02/service/stage_1_pb";
import { SatpStage2Service } from "../generated/proto/cacti/satp/v02/service/stage_2_pb";
import { SatpStage3Service } from "../generated/proto/cacti/satp/v02/service/stage_3_pb";
import { CrashRecoveryService } from "../generated/proto/cacti/satp/v02/service/crash_recovery_pb";

export interface IGatewayOrchestratorOptions {
  logLevel?: LogLevelDesc;
  localGateway: GatewayIdentity;
  counterPartyGateways?: GatewayIdentity[];
  signer: JsObjectSigner;
  enableCrashRecovery?: boolean;
}

//import { COREDispatcher, COREDispatcherOptions } from "../core/dispatcher";
import { createClient } from "@connectrpc/connect";
import { createGrpcWebTransport } from "@connectrpc/connect-node";
import {
  getGatewaySeeds,
  resolveGatewayID,
} from "../network-identification/resolve-gateway";
import { SATPHandler, Stage } from "../types/satp-protocol";
import { NetworkId } from "../network-identification/chainid-list";

export class GatewayOrchestrator {
  public readonly label = "GatewayOrchestrator";
  private expressServer: Express | undefined;
  protected localGateway: GatewayIdentity;
  private counterPartyGateways: Map<string, GatewayIdentity> = new Map();
  private handlers: Map<string, SATPHandler> = new Map();
  private crashEnabled: boolean = false;

  // TODO!: add logic to manage sessions (parallelization, user input, freeze, unfreeze, rollback, recovery)
  private channels: Map<string, GatewayChannel> = new Map();
  private readonly logger: Logger;

  constructor(options: IGatewayOrchestratorOptions) {
    // add checks
    this.localGateway = options.localGateway;
    const level = options.logLevel || "INFO";
    const logOptions: ILoggerOptions = {
      level: level,
      label: this.label,
    };

    this.logger = LoggerProvider.getOrCreate(logOptions);
    this.logger.info("Initializing Gateway Connection Manager");
    this.logger.info("Gateway Coordinator initialized");
    this.crashEnabled = options.enableCrashRecovery ?? false;
    this.logger.info(`Crash recovery set to: ${this.crashEnabled}`);
    const seedGateways = getGatewaySeeds(this.logger);
    this.logger.info(
      `Initializing gateway connection manager with ${seedGateways} seed gateways`,
    );

    const allCounterPartyGateways = seedGateways.concat(
      options.counterPartyGateways ?? [],
    );

    // populate counterPartyGateways
    this.counterPartyGateways = new Map(
      allCounterPartyGateways.map((gateway) => [gateway.id, gateway]),
    );

    this.logger.info(
      `Gateway Connection Manager bootstrapped with ${allCounterPartyGateways.length} gateways`,
    );

    this.channels.set(
      this.localGateway.id,
      this.createChannel(this.localGateway),
    );

    this.addGateways(allCounterPartyGateways);
    const numberGatewayChannels = this.connectToCounterPartyGateways();
    if (numberGatewayChannels > 0) {
      this.logger.info(
        `Gateway Connection Manager connected to ${numberGatewayChannels} gateways.`,
      );
      this.logger.info("Creating SATPManager");
    }
  }

  public get ourGateway(): GatewayIdentity {
    return this.localGateway;
  }

  public addGOLServer(server: Express): void {
    this.expressServer = server;
  }

  public startServices(): void {
    if (!this.expressServer) {
      throw new Error(`${this.label}#startServices() expressServer falsy.`);
    }

    for (const stage of this.handlers.keys()) {
      const handler = this.handlers.get(stage);
      if (!handler) {
        throw new Error(`Handler for stage ${stage} is undefined.`);
      }

      const httpPath = `/${handler.getStage()}`;
      this.logger.info(`Setting up routes for stage ${httpPath}`);

      if (typeof handler.setupRouter !== "function") {
        throw new Error(
          `Handler for stage ${stage} has an invalid setupRouter function.`,
        );
      }

      this.expressServer.use(
        expressConnectMiddleware({
          routes: handler.setupRouter.bind(handler),
          requestPathPrefix: httpPath,
        }),
      );
    }
  }

  public addHandlers(handlers: Map<string, SATPHandler>): void {
    this.handlers = handlers;
  }

  async startupGatewayOrchestrator(): Promise<void> {
    if (this.counterPartyGateways.values.length === 0) {
      this.logger.info("No gateways to connect to");
      return;
    } else {
      this.connectToCounterPartyGateways();
    }
  }

  public getGatewayIdentity(id: string): GatewayIdentity | undefined {
    if (this.localGateway.id === id) {
      return this.localGateway;
    } else {
      return this.counterPartyGateways.get(id);
    }
  }

  public getCounterPartyGateway(id: string): GatewayIdentity | undefined {
    return this.counterPartyGateways.get(id);
  }

  public getChannel(id: string): GatewayChannel {
    const channels = Array.from(this.channels.values());
    const channel = channels.find((channel) => {
      return channel.connectedDLTs
        .map((obj) => {
          return obj.id;
        })
        .includes(id);
    });
    if (!channel) {
      throw new Error(
        `No channel found for DLT ${id} \n available channels: ${safeStableStringify(channels)}`,
      );
    }
    return channel;
  }

  public getChannels(): Map<string, GatewayChannel> {
    return this.channels;
  }
  isSelfId(id: string): boolean {
    return id === this.localGateway.id;
  }
  getSelfId(): string {
    return this.localGateway.id;
  }

  isInCounterPartyGateways(id: string): boolean {
    return this.counterPartyGateways.has(id);
  }

  getCounterPartyGateways(): Map<string, GatewayIdentity> {
    return this.counterPartyGateways;
  }

  isInChannels(id: string): boolean {
    return this.channels.has(id);
  }

  // Find IDs in counterPartyGateways that do not have a corresponding channel
  findUnchanneledGateways(): string[] {
    return Array.from(this.counterPartyGateways.keys()).filter((id) => {
      return !this.isInChannels(id) && !this.isSelfId(id);
    });
  }

  // Filter IDs that are not present in counterPartyGateways or channels and not the self ID
  filterNewIds(ids: string[]): string[] {
    return ids.filter((id) => {
      return (
        // !this.isInCounterPartyGateways(id) &&
        !this.isInChannels(id) && !this.isSelfId(id)
      );
    });
  }

  connectToCounterPartyGateways(): number {
    const fnTag = `${this.label}#connectToCounterPartyGateways()`;
    if (!this.counterPartyGateways) {
      this.logger.info(`${fnTag}, No counterparty gateways to connect to`);
      return 0;
    }

    const idsToAdd = this.filterNewIds(
      Array.from(this.counterPartyGateways.keys()),
    );
    if (idsToAdd.length === 0) {
      this.logger.info(`${fnTag}, No new gateways to connect to`);
      return 0;
    }

    // get gateway identities from counterPartyGateways
    const gatewaysToAdd = idsToAdd.map(
      (id) => this.counterPartyGateways.get(id)!,
    );

    let connected = 0;
    try {
      for (const gateway of gatewaysToAdd) {
        const channel = this.createChannel(gateway);
        this.channels.set(gateway.id, channel);
        connected++;
      }
    } catch (ex) {
      this.logger.error(`${fnTag}, Failed to connect to gateway`);
      this.logger.error(ex);
    }
    return connected;
  }

  get connectedDLTs(): NetworkId[] {
    return this.localGateway.connectedDLTs;
  }

  createChannel(identity: GatewayIdentity): GatewayChannel {
    const clients = this.createConnectClients(identity);

    const channel: GatewayChannel = {
      fromGatewayID: this.localGateway.id,
      toGatewayID: identity.id,
      sessions: new Map(),
      clients: clients,
      connectedDLTs: identity.connectedDLTs,
    };
    this.logger.info(
      `Created channel to gateway ${identity.id} \n reachable DLTs: ${identity.connectedDLTs}`,
    );
    return channel;
  }

  protected getTargetChannel(id: string): GatewayChannel {
    const channel = this.channels.get(id);
    if (!channel) {
      throw new Error(`Channel with gateway id ${id} does not exist`);
    } else {
      return channel;
    }
  }

  private createConnectClients(
    identity: GatewayIdentity,
  ): Map<string, ConnectClient<SATPServiceInstance>> {
    // one function for each client type; aggregate in array
    this.logger.debug(
      `Creating clients for gateway ${safeStableStringify(identity)}`,
    );
    const transport0 = createGrpcWebTransport({
      baseUrl:
        identity.address +
        ":" +
        identity.gatewayServerPort +
        `/${Stage.STAGE0}`,
      httpVersion: "1.1",
    });

    this.logger.debug(
      "Transport:" +
        identity.address +
        ":" +
        identity.gatewayServerPort +
        `/${Stage.STAGE0}`,
    );

    const transport1 = createGrpcWebTransport({
      baseUrl:
        identity.address +
        ":" +
        identity.gatewayServerPort +
        `/${Stage.STAGE1}`,
      httpVersion: "1.1",
    });

    const transport2 = createGrpcWebTransport({
      baseUrl:
        identity.address +
        ":" +
        identity.gatewayServerPort +
        `/${Stage.STAGE2}`,
      httpVersion: "1.1",
    });

    const transport3 = createGrpcWebTransport({
      baseUrl:
        identity.address +
        ":" +
        identity.gatewayServerPort +
        `/${Stage.STAGE3}`,
      httpVersion: "1.1",
    });

    const transportCrash = createGrpcWebTransport({
      baseUrl:
        identity.address + ":" + identity.gatewayServerPort + `/${"crash"}`,
      httpVersion: "1.1",
    });

    const clients: Map<string, ConnectClient<SATPServiceInstance>> = new Map();

    clients.set("0", this.createStage0ServiceClient(transport0));
    clients.set("1", this.createStage1ServiceClient(transport1));
    clients.set("2", this.createStage2ServiceClient(transport2));
    clients.set("3", this.createStage3ServiceClient(transport3));

    if (this.crashEnabled) {
      clients.set("crash", this.createCrashServiceClient(transportCrash));
    }
    // todo perform healthcheck on startup; should be in stage 0
    return clients;
  }

  private createStage0ServiceClient(
    transport: ConnectTransport,
  ): ConnectClient<typeof SatpStage0Service> {
    this.logger.debug(
      "Creating stage 0 service client, with transport: ",
      transport,
    );
    const client = createClient(SatpStage0Service, transport);
    return client;
  }

  private createStage1ServiceClient(
    transport: ConnectTransport,
  ): ConnectClient<typeof SatpStage1Service> {
    this.logger.debug(
      "Creating stage 1 service client, with transport: ",
      transport,
    );
    const client = createClient(SatpStage1Service, transport);
    return client;
  }

  private createStage2ServiceClient(
    transport: ConnectTransport,
  ): ConnectClient<typeof SatpStage2Service> {
    this.logger.debug(
      "Creating stage 2 service client, with transport: ",
      transport,
    );
    const client = createClient(SatpStage2Service, transport);
    return client;
  }

  private createStage3ServiceClient(
    transport: ConnectTransport,
  ): ConnectClient<typeof SatpStage3Service> {
    this.logger.debug(
      "Creating stage 3 service client, with transport: ",
      transport,
    );
    const client = createClient(SatpStage3Service, transport);
    return client;
  }

  private createCrashServiceClient(
    transport: ConnectTransport,
  ): ConnectClient<typeof CrashRecoveryService> {
    this.logger.debug(
      "Creating crash-manager client, with transport: ",
      transport,
    );
    const client = createClient(CrashRecoveryService, transport);
    return client;
  }

  public async resolveAndAddGateways(IDs: string[]): Promise<number> {
    const fnTag = `${this.label}#addGateways()`;
    this.logger.trace(`Entering ${fnTag}`);
    this.logger.info("Connecting to gateway");
    const gatewaysToAdd: GatewayIdentity[] = [];
    const thisID = this.localGateway!.id;
    const otherIDs = IDs.filter((id) => id !== thisID);

    for (const id of otherIDs) {
      gatewaysToAdd.push(await resolveGatewayID(this.logger, id));
    }

    this.addGateways(gatewaysToAdd);
    return gatewaysToAdd.length;
  }

  public addGateways(gateways: GatewayIdentity[]): string[] {
    const fnTag = `${this.label}#addGateways()`;
    this.logger.trace(`Entering ${fnTag}`);
    this.logger.info("Connecting to gateway");
    const addedIDs: string[] = [];
    // gateways tha are not self
    const otherGateways = gateways.filter(
      (gateway) => gateway.id !== this.localGateway.id,
    );

    // gateways that are not already connected
    const uniqueGateways = otherGateways.filter(
      (gateway) => !this.counterPartyGateways.has(gateway.id),
    );

    for (const gateway of uniqueGateways) {
      this.counterPartyGateways.set(gateway.id, gateway);
      addedIDs.push(gateway.id);
    }
    this.logger.debug(`Added ${addedIDs.length} gateways: ${addedIDs}`);
    return addedIDs;
  }

  alreadyConnected(ID: string): boolean {
    return this.channels.has(ID);
  }

  async disconnectAll(): Promise<number> {
    const fnTag = `${this.label}#disconnectAll()`;

    let counter = 0;
    this.channels.forEach(async (channel) => {
      this.logger.info(`${fnTag}, Disconnecting from ${channel.toGatewayID}`);
      // ! todo implement disconnect
      this.logger.error("Not implemented");
      counter++;
    });
    this.channels.clear();
    return counter;
  }

  /*
  BOL TO GOL translation
  */
  async handleTransferRequest(): Promise<void> {
    // add checks
    this.logger.info("Handling transfer request");
    // ! todo implement transfer request
    this.logger.error("Not implemented");
  }

  async handleGetRoutes(): Promise<void> {
    // add checks
    this.logger.info("Handling transfer request");
    // ! todo implement transfer request
    this.logger.error("Not implemented");
  }
}
