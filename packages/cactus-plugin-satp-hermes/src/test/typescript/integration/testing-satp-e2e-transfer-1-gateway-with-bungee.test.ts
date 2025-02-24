import "jest-extended";
import { LogLevelDesc, LoggerProvider } from "@hyperledger/cactus-common";
import { FabricContractInvocationType } from "@hyperledger/cactus-plugin-ledger-connector-fabric";
import {
  pruneDockerAllIfGithubAction,
  Containers,
} from "@hyperledger/cactus-test-tooling";
import {
  EthContractInvocationType,
  Web3SigningCredentialType,
} from "@hyperledger/cactus-plugin-ledger-connector-besu";
import {
  SATPGatewayConfig,
  SATPGateway,
  PluginFactorySATPGateway,
} from "../../../main/typescript";
import { Address, GatewayIdentity } from "../../../main/typescript/core/types";
import {
  IPluginFactoryOptions,
  LedgerType,
  PluginImportType,
} from "@hyperledger/cactus-core-api";
import { ClaimFormat } from "../../../main/typescript/generated/proto/cacti/satp/v02/common/message_pb";
import {
  BesuTestEnvironment,
  FabricTestEnvironment,
  getTransactRequest,
} from "../test-utils";
import {
  SATP_ARCHITECTURE_VERSION,
  SATP_CORE_VERSION,
  SATP_CRASH_VERSION,
} from "../../../main/typescript/core/constants";
import {
  knexClientConnection,
  knexSourceRemoteConnection,
} from "../knex.config";
import { knex } from "knex";
import * as fs from "fs";

const logLevel: LogLevelDesc = "DEBUG";
const log = LoggerProvider.getOrCreate({
  level: logLevel,
  label: "SATP - Hermes",
});

let besuEnv: BesuTestEnvironment;
let fabricEnv: FabricTestEnvironment;
const bridge_id =
  "x509::/OU=org2/OU=client/OU=department1/CN=bridge::/C=UK/ST=Hampshire/L=Hursley/O=org2.example.com/CN=ca.org2.example.com";
let startTestTime: number;
afterAll(async () => {
  await besuEnv.tearDown();
  await fabricEnv.tearDown();

  await pruneDockerAllIfGithubAction({ logLevel })
    .then(() => {
      log.info("Pruning throw OK");
    })
    .catch(async () => {
      await Containers.logDiagnostics({ logLevel });
      fail("Pruning didn't throw OK");
    });
});

beforeAll(async () => {
  pruneDockerAllIfGithubAction({ logLevel })
    .then(() => {
      log.info("Pruning throw OK");
    })
    .catch(async () => {
      await Containers.logDiagnostics({ logLevel });
      fail("Pruning didn't throw OK");
    });

  {
    startTestTime = new Date().getTime();
    const satpContractName = "satp-contract";

    const startTime = new Date().getTime();
    fabricEnv = await FabricTestEnvironment.setupTestEnvironment(
      satpContractName,
      bridge_id,
      logLevel,
    );
    const endTime = new Date().getTime();
    writeToCSV(
      "/home/kubaya/Desktop/tests/1-gateway-fabric-deploy-ledger-time",
      "Duration (ms)\n",
      `${endTime - startTime}`,
    );
    log.info("Fabric Ledger started successfully");

    const startTime1 = new Date().getTime();
    await fabricEnv.deployAndSetupContracts(ClaimFormat.BUNGEE);
    const endTime1 = new Date().getTime();
    writeToCSV(
      "/home/kubaya/Desktop/tests/1-gateway-fabric-deploy-contracts-time",
      "Duration (ms)\n",
      `${endTime1 - startTime1}`,
    );
  }

  {
    const erc20TokenContract = "SATPContract";
    const contractNameWrapper = "SATPWrapperContract";

    const startTime = new Date().getTime();
    besuEnv = await BesuTestEnvironment.setupTestEnvironment(
      erc20TokenContract,
      contractNameWrapper,
      logLevel,
    );
    const endTime = new Date().getTime();
    writeToCSV(
      "/home/kubaya/Desktop/tests/1-gateway-besu-deploy-ledger-time",
      "Duration (ms)\n",
      `${endTime - startTime}`,
    );
    log.info("Besu Ledger started successfully");
    const startTime1 = new Date().getTime();
    await besuEnv.deployAndSetupContracts(ClaimFormat.BUNGEE);
    const endTime1 = new Date().getTime();
    writeToCSV(
      "/home/kubaya/Desktop/tests/1-gateway-besu-deploy-contracts-time",
      "Duration (ms)\n",
      `${endTime1 - startTime1}`,
    );
  }
});

describe("SATPGateway sending a token from Besu to Fabric", () => {
  it("should realize a transfer", async () => {
    //setup satp gateway
    const factoryOptions: IPluginFactoryOptions = {
      pluginImportType: PluginImportType.Local,
    };
    const factory = new PluginFactorySATPGateway(factoryOptions);

    const gatewayIdentity = {
      id: "mockID",
      name: "CustomGateway",
      version: [
        {
          Core: SATP_CORE_VERSION,
          Architecture: SATP_ARCHITECTURE_VERSION,
          Crash: SATP_CRASH_VERSION,
        },
      ],
      connectedDLTs: [
        {
          id: BesuTestEnvironment.BESU_NETWORK_ID,
          ledgerType: LedgerType.Besu2X,
        },
        {
          id: FabricTestEnvironment.FABRIC_NETWORK_ID,
          ledgerType: LedgerType.Fabric2,
        },
      ],
      proofID: "mockProofID10",
      address: "http://localhost" as Address,
    } as GatewayIdentity;

    const startTimeDB = new Date().getTime();
    const knexInstanceClient = knex(knexClientConnection);
    await knexInstanceClient.migrate.latest();

    const knexSourceRemoteInstance = knex(knexSourceRemoteConnection);
    await knexSourceRemoteInstance.migrate.latest();
    const endTimeDB = new Date().getTime();
    writeToCSV(
      "/home/kubaya/Desktop/tests/1-gateway-db-migrate-time",
      "Duration (ms)\n",
      `${endTimeDB - startTimeDB}`,
    );

    const options: SATPGatewayConfig = {
      logLevel: "DEBUG",
      gid: gatewayIdentity,
      counterPartyGateways: [], //only knows itself
      bridgesConfig: [besuEnv.besuConfig, fabricEnv.fabricConfig],
      knexLocalConfig: knexClientConnection,
      knexRemoteConfig: knexSourceRemoteConnection,
    };

    const startTimeGatewayCreation = new Date().getTime();
    const gateway = await factory.create(options);
    const endTimeGatewayCreation = new Date().getTime();
    writeToCSV(
      "/home/kubaya/Desktop/tests/1-gateway-creation-time",
      "Duration (ms)\n",
      `${endTimeGatewayCreation - startTimeGatewayCreation}`,
    );
    expect(gateway).toBeInstanceOf(SATPGateway);

    const identity = gateway.Identity;
    // default servers
    expect(identity.gatewayServerPort).toBe(3010);
    expect(identity.gatewayClientPort).toBe(3011);
    expect(identity.address).toBe("http://localhost");
    await gateway.startup();

    const dispatcher = gateway.BLODispatcherInstance;

    expect(dispatcher).toBeTruthy();
    const req = getTransactRequest(
      "mockContext",
      besuEnv,
      fabricEnv,
      "100",
      "1",
    );

    const startTime = new Date().getTime();
    const res = await dispatcher?.Transact(req);
    const endTime = new Date().getTime();
    writeToCSV(
      "/home/kubaya/Desktop/tests/1-gateway-transact-time",
      "Duration (ms)\n",
      `${endTime - startTime}`,
    );
    log.info(res?.statusResponse);

    const responseBalanceOwner = await besuEnv.connector.invokeContract({
      contractName: besuEnv.erc20TokenContract,
      keychainId: besuEnv.keychainPlugin1.getKeychainId(),
      invocationType: EthContractInvocationType.Call,
      methodName: "checkBalance",
      params: [besuEnv.firstHighNetWorthAccount],
      signingCredential: {
        ethAccount: besuEnv.firstHighNetWorthAccount,
        secret: besuEnv.besuKeyPair.privateKey,
        type: Web3SigningCredentialType.PrivateKeyHex,
      },
      gas: 999999999,
    });
    expect(responseBalanceOwner).toBeTruthy();
    expect(responseBalanceOwner.success).toBeTruthy();
    expect(responseBalanceOwner.callOutput).toBe("0");
    log.info("Amount was transfer correctly from the Owner account");

    const responseBalanceBridge = await besuEnv.connector.invokeContract({
      contractName: besuEnv.erc20TokenContract,
      keychainId: besuEnv.keychainPlugin1.getKeychainId(),
      invocationType: EthContractInvocationType.Call,
      methodName: "checkBalance",
      params: [besuEnv.wrapperContractAddress],
      signingCredential: {
        ethAccount: besuEnv.firstHighNetWorthAccount,
        secret: besuEnv.besuKeyPair.privateKey,
        type: Web3SigningCredentialType.PrivateKeyHex,
      },
      gas: 999999999,
    });
    expect(responseBalanceBridge).toBeTruthy();
    expect(responseBalanceBridge.success).toBeTruthy();
    expect(responseBalanceBridge.callOutput).toBe("0");
    log.info("Amount was transfer correctly to the Wrapper account");

    const responseBalance1 = await fabricEnv.apiClient.runTransactionV1({
      contractName: fabricEnv.satpContractName,
      channelName: fabricEnv.fabricChannelName,
      params: [fabricEnv.bridge_id],
      methodName: "ClientIDAccountBalance",
      invocationType: FabricContractInvocationType.Send,
      signingCredential: fabricEnv.fabricSigningCredential,
    });

    expect(responseBalance1).not.toBeUndefined();
    expect(responseBalance1.status).toBeGreaterThan(199);
    expect(responseBalance1.status).toBeLessThan(300);
    expect(responseBalance1.data).not.toBeUndefined();
    expect(responseBalance1.data.functionOutput).toBe("0");
    log.info("Amount was transfer correctly from the Bridge account");

    const responseBalance2 = await fabricEnv.apiClient.runTransactionV1({
      contractName: fabricEnv.satpContractName,
      channelName: fabricEnv.fabricChannelName,
      params: [fabricEnv.clientId],
      methodName: "ClientIDAccountBalance",
      invocationType: FabricContractInvocationType.Send,
      signingCredential: fabricEnv.fabricSigningCredential,
    });
    expect(responseBalance2).not.toBeUndefined();
    expect(responseBalance2.status).toBeGreaterThan(199);
    expect(responseBalance2.status).toBeLessThan(300);
    expect(responseBalance2.data).not.toBeUndefined();
    expect(responseBalance2.data.functionOutput).toBe("1");
    log.info("Amount was transfer correctly to the Owner account");
    if (gateway) {
      if (knexInstanceClient) {
        await knexInstanceClient.destroy();
      }
      if (knexSourceRemoteInstance) {
        await knexSourceRemoteInstance.destroy();
      }
    }
    await gateway.shutdown();
    const endTestTime = new Date().getTime();
    writeToCSV(
      "/home/kubaya/Desktop/tests/1-gateway-e2e-time",
      "Duration (ms)\n",
      `${endTestTime - startTestTime}`,
    );
  });
});
function writeToCSV(filePath: string, header: string, data: string): void {
  const fileExists = fs.existsSync(filePath);

  if (!fileExists) {
    fs.writeFileSync(filePath, header);
  }

  const csvData = `${data}\n`;
  fs.appendFileSync(filePath, csvData);
}
