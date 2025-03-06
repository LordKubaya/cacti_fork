import {
  ChainCodeProgrammingLanguage,
  DeployContractV1Response,
  DeploymentTargetOrganization,
  FabricContractInvocationType,
  FabricSigningCredential,
  FileBase64,
  IPluginLedgerConnectorFabricOptions,
  PluginLedgerConnectorFabric,
} from "@hyperledger/cactus-plugin-ledger-connector-fabric";
import path from "path";
import fs from "fs-extra";
import { PluginBungeeHermes } from "@hyperledger/cactus-plugin-bungee-hermes";
import { StrategyFabric } from "@hyperledger/cactus-plugin-bungee-hermes/dist/lib/main/typescript/strategy/strategy-fabric";
import { stringify as safeStableStringify } from "safe-stable-stringify";
import {
  Logger,
  LogLevelDesc,
  LoggerProvider,
  Secp256k1Keys,
} from "@hyperledger/cactus-common";
import { ClaimFormat } from "../../../generated/proto/cacti/satp/v02/common/message_pb";
import { LedgerType } from "@hyperledger/cactus-core-api";
import { BridgeLeaf, BridgeLeafOptions } from "../bridge-leaf";
import { BridgeLeafFungible } from "../bridge-leaf-fungible";
import { BridgeLeafNonFungible } from "../bridge-leaf-non-fungible";
import { OntologyManager } from "../ontology/ontology-manager";
import { ISignerKeyPairs } from "@hyperledger/cactus-common/src/main/typescript/signer-key-pairs";
import { NetworkId } from "../../../network-identification/chainid-list";
import {
  BungeeError,
  ChannelNameError,
  InvalidWrapperContract,
  ReceiptError,
  TransactionError,
  TransactionReceiptError,
  UnsupportedNetworkError,
  WrapperContractAlreadyCreatedError,
  WrapperContractError,
} from "../bridge-errors";
import { TransactionResponse } from "../bridge-types";
import { FabricAsset } from "../ontology/assets/fabric-asset";

/**
 * Options for configuring a Fabric leaf in a cross-chain bridge mechanism.
 *
 * @extends BridgeLeafOptions
 *
 * @property {FabricSigningCredential} signingCredential - The credential used for signing transactions on the Fabric network.
 * @property {IPluginLedgerConnectorFabricOptions} connectorOptions - Options for configuring the Fabric ledger connector plugin.
 * @property {string} channelName - The name of the channel on the Fabric network.
 * @property {Array<DeploymentTargetOrganization>} [targetOrganizations] - An optional array of target organizations for deployment.
 * @property {string} [caFile] - An optional path to the Certificate Authority (CA) file.
 * @property {number} [ccSequence] - An optional chaincode sequence number.
 * @property {string} [orderer] - An optional orderer URL.
 * @property {string} [ordererTLSHostnameOverride] - An optional hostname override for the orderer's TLS certificate.
 * @property {number} [connTimeout] - An optional connection timeout in milliseconds.
 * @property {string} [signaturePolicy] - An optional signature policy for the transactions.
 * @property {string} [wrapperContractName] - An optional name of the wrapper contract.
 */
export interface FabricLeafOptions extends BridgeLeafOptions {
  signingCredential: FabricSigningCredential;
  connectorOptions: IPluginLedgerConnectorFabricOptions;
  channelName: string;
  targetOrganizations?: Array<DeploymentTargetOrganization>;
  caFile?: string;
  ccSequence?: number;
  orderer?: string;
  ordererTLSHostnameOverride?: string;
  connTimeout?: number;
  signaturePolicy?: string;
  wrapperContractName?: string;
}

/**
 * The `FabricLeaf` class extends the `BridgeLeaf` class and implements the `BridgeLeafFungible` and `BridgeLeafNonFungible` interfaces.
 * It represents a leaf node in a cross-chain bridge mechanism specifically for the Hyperledger Fabric blockchain.
 * This class handles the deployment and interaction with wrapper contracts on the Fabric network,
 * as well as the wrapping, unwrapping, locking, unlocking, minting, burning, and assigning of assets.
 * It also provides methods to retrieve assets and their views, and to run arbitrary transactions on the Fabric network.
 *
 * @remarks
 * The `FabricLeaf` class is designed to facilitate cross-chain asset transfers and interactions on the Hyperledger Fabric blockchain.
 * It leverages the `PluginLedgerConnectorFabric` for blockchain interactions and supports both fungible and non-fungible assets.
 * The class also integrates with the `PluginBungeeHermes` for generating views and snapshots of assets.
 *
 * @example
 * ```typescript
 * const fabricLeaf = new FabricLeaf({
 *   networkIdentification: { id: "fabric-network", ledgerType: LedgerType.Fabric2 },
 *   keyPair: myKeyPair,
 *   instanceId: uuidv4(),
 *     peerBinary: "/fabric-samples/bin/peer",
 *     goBinary: "/usr/local/go/bin/go",
 *     pluginRegistry,
 *     cliContainerEnv: FABRIC_25_LTS_FABRIC_SAMPLES_ENV_INFO_ORG_1,
 *     sshConfig: sshConfig,
 *     logLevel,
 *     connectionProfile: connectionProfile,
 *     discoveryOptions: discoveryOptions,
 *     eventHandlerOptions: {
 *       strategy: DefaultEventHandlerStrategy.NetworkScopeAllfortx,
 *       commitTimeout: 300,
 *     },
 *   signingCredential: mySigningCredential,
 *   ontologyManager: myOntologyManager,
 *   channelName: "mychannel",
 *   targetOrganizations: [{ mspId: "Org1MSP", peerEndpoint: "peer0.org1.example.com:7051" }],
 *   caFile: "/path/to/ca.pem",
 *   ccSequence: 1,
 *   orderer: "orderer.example.com:7050",
 *   ordererTLSHostnameOverride: "orderer.example.com",
 * });
 *
 * await fabricLeaf.deployFungibleWrapperContract("MyFungibleContract");
 * const transactionResponse = await fabricLeaf.wrapAsset(myAsset);
 * console.log(transactionResponse.transactionId);
 * ```
 *
 * @throws {UnsupportedNetworkError} If the provided network identification is not a supported Fabric network.
 * @throws {ChannelNameError} If no channel name is provided in the options.
 * @throws {InvalidWrapperContract} If the necessary variables for deploying the wrapper contract are missing.
 * @throws {WrapperContractError} If the wrapper contract is not deployed or already created.
 * @throws {TransactionError} If a transaction fails.
 * @throws {ReceiptError} If the receipt for a deployed contract is not available.
 * @throws {BungeeError} If the Bungee plugin is not initialized.
 */

export class FabricLeaf
  extends BridgeLeaf
  implements BridgeLeafFungible, BridgeLeafNonFungible
{
  public static readonly CLASS_NAME = "FabricLeaf";

  protected readonly log: Logger;
  protected readonly logLevel: LogLevelDesc;

  protected readonly id: string;

  protected readonly networkIdentification: NetworkId;

  protected readonly keyPair: ISignerKeyPairs;

  protected readonly connector: PluginLedgerConnectorFabric;

  protected bungee?: PluginBungeeHermes;

  protected readonly claimFormat: ClaimFormat;

  protected readonly ontologyManager: OntologyManager;

  private readonly signingCredential: FabricSigningCredential;

  private readonly wrapperSatpContractDir = path.join(
    __dirname,
    "../fabric-contracts/satp-wrapper/chaincode-typescript",
  );

  private wrapperFungibleDeployReceipt: DeployContractV1Response | undefined;

  private contractChannel: string | undefined;

  private wrapperContractName: string | undefined;

  private targetOrganizations: Array<DeploymentTargetOrganization> | undefined;
  private caFile: string | undefined;
  private ccSequence: number | undefined;
  private orderer: string | undefined;
  private ordererTLSHostnameOverride: string | undefined;
  private connTimeout: number | undefined;
  private signaturePolicy: string | undefined;

  /**
   * Constructs a new instance of the FabricLeaf class.
   *
   * @param options - The options for configuring the FabricLeaf instance.
   * @throws UnsupportedNetworkError - If the provided network identification is not of type Fabric2.
   * @throws ChannelNameError - If the channel name is not provided in the options, without this we cannot deploy contracts to the fabric network.
   * @throws InvalidWrapperContract - If the necessary variables for deploying the wrapper contract are missing.
   *
   */
  constructor(public readonly options: FabricLeafOptions) {
    super();
    const label = FabricLeaf.CLASS_NAME;
    this.logLevel = this.options.logLevel || "INFO";
    this.log = LoggerProvider.getOrCreate({ label, level: this.logLevel });

    if (options.networkIdentification.ledgerType !== LedgerType.Fabric2) {
      throw new UnsupportedNetworkError(
        `${FabricLeaf.CLASS_NAME} supports only Besu networks but got ${options.networkIdentification.ledgerType}`,
      );
    }

    this.networkIdentification = {
      id: options.networkIdentification.id,
      ledgerType: options.networkIdentification.ledgerType,
    };

    this.id = this.options.leafId || this.createId(FabricLeaf.CLASS_NAME);
    this.keyPair = options.keyPair || Secp256k1Keys.generateKeyPairsBuffer();

    this.claimFormat = options.claimFormat || ClaimFormat.DEFAULT;

    this.connector = new PluginLedgerConnectorFabric(options.connectorOptions);

    this.ontologyManager = options.ontologyManager;

    this.signingCredential = options.signingCredential;

    if (options.claimFormat === ClaimFormat.BUNGEE) {
      this.bungee = new PluginBungeeHermes({
        instanceId: `fabric-${this.id}`,
        pluginRegistry: options.connectorOptions.pluginRegistry,
        keyPair: this.keyPair,
        logLevel: this.logLevel,
      });
      this.bungee.addStrategy(
        this.options.networkIdentification.id,
        new StrategyFabric(this.logLevel),
      );
    }

    if (!options.channelName) {
      throw new ChannelNameError(
        `${FabricLeaf.CLASS_NAME}#constructor, Channel Name not provided`,
      );
    }
    this.contractChannel = options.channelName;

    if (options.wrapperContractName) {
      this.wrapperContractName = options.wrapperContractName;
    } else if (
      options.targetOrganizations &&
      options.caFile &&
      options.ccSequence &&
      options.orderer &&
      options.ordererTLSHostnameOverride
    ) {
      this.log.debug(
        `${FabricLeaf.CLASS_NAME}#constructor, No wrapper contract provided, creation required`,
      );
      this.targetOrganizations = options.targetOrganizations;
      this.caFile = options.caFile;
      this.ccSequence = options.ccSequence;
      this.orderer = options.orderer;
      this.ordererTLSHostnameOverride = options.ordererTLSHostnameOverride;
    } else {
      throw new InvalidWrapperContract(
        `${FabricLeaf.CLASS_NAME}#constructor, Missing variables necessary to deploy the Wrapper Contract`,
      );
    }
  }

  /**
   * Deploys the necessary contracts for the Ethereum leaf.
   *
   * This method deploys the fungible wrapper contract and, if uncommented,
   * can also deploy the non-fungible wrapper contract. The deployments are
   * executed in parallel using `Promise.all`.
   *
   * @returns {Promise<void>} A promise that resolves when all contracts are deployed.
   */
  public async deployContracts(): Promise<void> {
    await Promise.all([
      this.deployFungibleWrapperContract(),
      // this.deployNonFungibleWrapperContract(),
    ]);
  }

  /**
   * Retrieves the deployment receipt of the non-fungible wrapper contract.
   *
   * @returns
   * @throws
   */
  public getDeployNonFungibleWrapperContractReceipt(): unknown {
    //TODO implement
    throw new Error("Method not implemented.");
  }

  /**
   * Deploys a non-fungible wrapper contract.
   *
   **/
  public deployNonFungibleWrapperContract(): Promise<void> {
    //TODO implement
    throw new Error("Method not implemented.");
  }

  /**
   * Retrieves the deployment receipt for the fungible wrapper contract.
   *
   * @returns {DeployContractV1Response} The deployment receipt of the fungible wrapper contract.
   * @throws {ReceiptError} If the fungible wrapper contract has not been deployed.
   */
  public getDeployFungibleWrapperContractReceipt(): DeployContractV1Response {
    if (!this.wrapperFungibleDeployReceipt) {
      throw new ReceiptError(
        `${FabricLeaf.CLASS_NAME}#getDeployFungibleWrapperContractReceipt() Fungible Wrapper Contract Not deployed`,
      );
    }
    return this.wrapperFungibleDeployReceipt;
  }

  /**
   * Deploys a fungible wrapper contract to the Fabric network.
   *
   * @param contractName - Optional name for the wrapper contract. If not provided, a default name will be generated.
   * @throws {ChannelNameError} If the channel name is not available.
   * @throws {WrapperContractAlreadyCreatedError} If the wrapper contract is already created or if there are missing variables for contract creation.
   * @throws {TransactionReceiptError} If the wrapper contract deployment fails.
   */
  public async deployFungibleWrapperContract(
    contractName?: string,
  ): Promise<void> {
    const fnTag = `${FabricLeaf.CLASS_NAME}}#deployWrapperContract`;
    this.log.debug(`${fnTag}, Deploying Wrapper Contract`);

    if (!this.contractChannel) {
      throw new ChannelNameError(`${fnTag}, Channel Name not available`);
    }

    if (this.wrapperContractName) {
      throw new WrapperContractAlreadyCreatedError(fnTag);
    }

    if (
      !(
        this.targetOrganizations &&
        this.caFile &&
        this.ccSequence &&
        this.orderer &&
        this.ordererTLSHostnameOverride
      )
    ) {
      throw new WrapperContractError(
        `${fnTag}, Missing variables for contract creation`,
      );
    }

    this.wrapperContractName =
      contractName || `${this.id}-fungible-wrapper-contract`;

    // ├── package.json
    // ├── src
    // │   ├── index.ts
    // │   ├── interaction-signature.ts
    // │   ├── ITraceableContract.ts
    // │   ├── satp-wrapper.ts
    // │   └── token.ts
    // ├── tsconfig.json
    // --------
    const wrapperSourceFiles: FileBase64[] = [];
    {
      const filename = "./tsconfig.json";
      const relativePath = "./";
      const filePath = path.join(
        this.wrapperSatpContractDir,
        relativePath,
        filename,
      );
      const buffer = await fs.readFile(filePath);
      wrapperSourceFiles.push({
        body: buffer.toString("base64"),
        filepath: relativePath,
        filename,
      });
    }
    {
      const filename = "./package.json";
      const relativePath = "./";
      const filePath = path.join(
        this.wrapperSatpContractDir,
        relativePath,
        filename,
      );
      const buffer = await fs.readFile(filePath);
      wrapperSourceFiles.push({
        body: buffer.toString("base64"),
        filepath: relativePath,
        filename,
      });
    }
    {
      const filename = "./index.ts";
      const relativePath = "./src/";
      const filePath = path.join(
        this.wrapperSatpContractDir,
        relativePath,
        filename,
      );
      const buffer = await fs.readFile(filePath);
      wrapperSourceFiles.push({
        body: buffer.toString("base64"),
        filepath: relativePath,
        filename,
      });
    }
    {
      const filename = "./interaction-signature.ts";
      const relativePath = "./src/";
      const filePath = path.join(
        this.wrapperSatpContractDir,
        relativePath,
        filename,
      );
      const buffer = await fs.readFile(filePath);
      wrapperSourceFiles.push({
        body: buffer.toString("base64"),
        filepath: relativePath,
        filename,
      });
    }
    {
      const filename = "./ITraceableContract.ts";
      const relativePath = "./src/";
      const filePath = path.join(
        this.wrapperSatpContractDir,
        relativePath,
        filename,
      );
      const buffer = await fs.readFile(filePath);
      wrapperSourceFiles.push({
        body: buffer.toString("base64"),
        filepath: relativePath,
        filename,
      });
    }
    {
      const filename = "./satp-wrapper.ts";
      const relativePath = "./src/";
      const filePath = path.join(
        this.wrapperSatpContractDir,
        relativePath,
        filename,
      );
      const buffer = await fs.readFile(filePath);
      wrapperSourceFiles.push({
        body: buffer.toString("base64"),
        filepath: relativePath,
        filename,
      });
    }
    {
      const filename = "./token.ts";
      const relativePath = "./src/";
      const filePath = path.join(
        this.wrapperSatpContractDir,
        relativePath,
        filename,
      );
      const buffer = await fs.readFile(filePath);
      wrapperSourceFiles.push({
        body: buffer.toString("base64"),
        filepath: relativePath,
        filename,
      });
    }

    const deployOutWrapperContract = await this.connector.deployContract({
      channelId: this.contractChannel,
      ccVersion: "1.0.0",
      sourceFiles: wrapperSourceFiles,
      ccName: this.wrapperContractName,
      targetOrganizations: this.targetOrganizations,
      caFile: this.caFile,
      ccLabel: "satp-wrapper",
      ccLang: ChainCodeProgrammingLanguage.Typescript,
      ccSequence: this.ccSequence,
      orderer: this.orderer,
      ordererTLSHostnameOverride: this.ordererTLSHostnameOverride,
      connTimeout: this.connTimeout,
      signaturePolicy: this.signaturePolicy,
    });

    if (!deployOutWrapperContract.success) {
      throw new TransactionReceiptError(
        `${fnTag}, Wrapper Contract deployment failed: ${deployOutWrapperContract}`,
      );
    }

    this.wrapperFungibleDeployReceipt = deployOutWrapperContract;

    this.log.debug(
      `${fnTag}, Wrapper Contract deployed receipt: ${deployOutWrapperContract}`,
    );
  }

  /**
   * Wraps an asset on the Fabric network.
   *
   * @param asset - The asset to be wrapped, containing its id, owner, type, mspId, channelName, and contractName.
   * @returns {Promise<TransactionResponse>} The response of the transaction, including the transaction ID and output.
   * @throws {WrapperContractError} If the wrapper contract is not deployed.
   * @throws {TransactionError} If the transaction fails.
   */
  public async wrapAsset(asset: FabricAsset): Promise<TransactionResponse> {
    const fnTag = `${FabricLeaf.CLASS_NAME}}#wrapAsset`;
    this.log.debug(
      `${fnTag}, Wrapping Asset: {${asset.id}, ${asset.owner}, ${asset.type}}`,
    );

    const interactions = this.ontologyManager.getOntologyInteractions(
      LedgerType.Besu2X,
      asset.type,
    );

    if (!this.contractChannel || !this.wrapperContractName) {
      throw new WrapperContractError(`${fnTag}, Wrapper Contract not deployed`);
    }

    const response = await this.connector.transact({
      signingCredential: this.signingCredential,
      channelName: this.contractChannel,
      methodName: "wrap",
      params: [
        asset.type.toString(),
        asset.id,
        asset.owner,
        asset.mspId,
        asset.channelName,
        asset.contractName,
        safeStableStringify(interactions),
      ],
      contractName: this.wrapperContractName,
      invocationType: FabricContractInvocationType.Send,
    });

    if (response == undefined || response.transactionId == "") {
      throw new TransactionError(fnTag);
    }

    return {
      transactionId: response.transactionId,
      output: response.functionOutput,
    };
  }

  /**
   * Unwraps an asset on the Fabric network.
   *
   * @param assetId - The ID of the asset to be unwrapped.
   * @returns {Promise<TransactionResponse>} The response of the transaction, including the transaction ID and output.
   * @throws {WrapperContractError} If the wrapper contract is not deployed.
   * @throws {TransactionError} If the transaction fails.
   */
  public async unwrapAsset(assetId: string): Promise<TransactionResponse> {
    const fnTag = `${FabricLeaf.CLASS_NAME}}#unwrapAsset`;
    this.log.debug(`${fnTag}, Unwrapping Asset: ${assetId}`);

    if (!this.contractChannel || !this.wrapperContractName) {
      throw new WrapperContractError(`${fnTag}, Wrapper Contract not deployed`);
    }

    const response = await this.connector.transact({
      signingCredential: this.signingCredential,
      channelName: this.contractChannel,
      methodName: "unwrap",
      params: [assetId],
      contractName: this.wrapperContractName,
      invocationType: FabricContractInvocationType.Send,
    });

    if (response == undefined || response.transactionId == "") {
      throw new TransactionError(fnTag);
    }

    return {
      transactionId: response.transactionId,
      output: response.functionOutput,
    };
  }

  /**
   * Locks a specified amount of an asset on the Fabric network.
   *
   * @param assetId - The ID of the asset to be locked.
   * @param amount - The amount of the asset to be locked.
   * @returns {Promise<TransactionResponse>} The response of the transaction, including the transaction ID and output.
   * @throws {WrapperContractError} If the wrapper contract is not deployed.
   * @throws {TransactionError} If the transaction fails.
   */
  public async lockAsset(
    assetId: string,
    amount: number,
  ): Promise<TransactionResponse> {
    const fnTag = `${FabricLeaf.CLASS_NAME}}#lockAsset`;
    this.log.debug(`${fnTag}, Locking Asset: ${assetId} amount: ${amount}`);

    if (!this.contractChannel || !this.wrapperContractName) {
      throw new WrapperContractError(`${fnTag}, Wrapper Contract not deployed`);
    }

    const response = await this.connector.transact({
      signingCredential: this.signingCredential,
      channelName: this.contractChannel,
      methodName: "lock",
      params: [assetId, amount.toString()],
      contractName: this.wrapperContractName,
      invocationType: FabricContractInvocationType.Send,
    });

    if (response == undefined || response.transactionId == "") {
      throw new TransactionError(fnTag);
    }

    return {
      transactionId: response.transactionId,
      output: response.functionOutput,
    };
  }

  /**
   * Unlocks an asset.
   *
   * @param {string} assetId - The ID of the asset to be unlocked.
   * @param {number} amount - The amount of the asset to be unlocked.
   * @returns {Promise<TransactionResponse>} A promise that resolves to the transaction response.
   * @throws {WrapperContractError} If the wrapper contract is not deployed.
   * @throws {TransactionError} If the transaction fails.
   */
  public async unlockAsset(
    assetId: string,
    amount: number,
  ): Promise<TransactionResponse> {
    const fnTag = `${FabricLeaf.CLASS_NAME}}#unlockAsset`;
    this.log.debug(`${fnTag}, Unlocking Asset: ${assetId} amount: ${amount}`);

    if (!this.contractChannel || !this.wrapperContractName) {
      throw new WrapperContractError(`${fnTag}, Wrapper Contract not deployed`);
    }

    const response = await this.connector.transact({
      signingCredential: this.signingCredential,
      channelName: this.contractChannel,
      methodName: "unlock",
      params: [assetId, amount.toString()],
      contractName: this.wrapperContractName,
      invocationType: FabricContractInvocationType.Send,
    });

    if (response == undefined || response.transactionId == "") {
      throw new TransactionError(fnTag);
    }

    return {
      transactionId: response.transactionId,
      output: response.functionOutput,
    };
  }

  /**
   * Mints an asset.
   *
   * @param {string} assetId - The ID of the asset to be minted.
   * @param {number} amount - The amount of the asset to be minted.
   * @returns {Promise<TransactionResponse>} A promise that resolves to the transaction response.
   * @throws {WrapperContractError} If the wrapper contract is not deployed.
   * @throws {TransactionError} If the transaction fails.
   */
  public async mintAsset(
    assetId: string,
    amount: number,
  ): Promise<TransactionResponse> {
    const fnTag = `${FabricLeaf.CLASS_NAME}}#mintAsset`;
    this.log.debug(`${fnTag}, Minting Asset: ${assetId} amount: ${amount}`);

    if (!this.contractChannel || !this.wrapperContractName) {
      throw new WrapperContractError(`${fnTag}, Wrapper Contract not deployed`);
    }

    const response = await this.connector.transact({
      signingCredential: this.signingCredential,
      channelName: this.contractChannel,
      methodName: "mint",
      params: [assetId, amount.toString()],
      contractName: this.wrapperContractName,
      invocationType: FabricContractInvocationType.Send,
    });

    if (response == undefined || response.transactionId == "") {
      throw new TransactionError(fnTag);
    }

    return {
      transactionId: response.transactionId,
      output: response.functionOutput,
    };
  }

  /**
   * Burns an asset.
   *
   * @param {string} assetId - The ID of the asset to be burned.
   * @param {number} amount - The amount of the asset to be burned.
   * @returns {Promise<TransactionResponse>} A promise that resolves to the transaction response.
   * @throws {WrapperContractError} If the wrapper contract is not deployed.
   * @throws {TransactionError} If the transaction fails.
   */
  public async burnAsset(
    assetId: string,
    amount: number,
  ): Promise<TransactionResponse> {
    const fnTag = `${FabricLeaf.CLASS_NAME}}#burnAsset`;
    this.log.debug(`${fnTag}, Burning Asset: ${assetId} amount: ${amount}`);

    if (!this.contractChannel || !this.wrapperContractName) {
      throw new WrapperContractError(`${fnTag}, Wrapper Contract not deployed`);
    }

    const response = await this.connector.transact({
      signingCredential: this.signingCredential,
      channelName: this.contractChannel,
      methodName: "burn",
      params: [assetId, amount.toString()],
      contractName: this.wrapperContractName,
      invocationType: FabricContractInvocationType.Send,
    });

    if (response == undefined || response.transactionId == "") {
      throw new TransactionError(fnTag);
    }

    return {
      transactionId: response.transactionId,
      output: response.functionOutput,
    };
  }

  /**
   * Assigns an asset to a new owner.
   *
   * @param {string} assetId - The ID of the asset to be assigned.
   * @param {string} to - The new owner of the asset.
   * @param {number} amount - The amount of the asset to be assigned.
   * @returns {Promise<TransactionResponse>} A promise that resolves to the transaction response.
   * @throws {WrapperContractError} If the wrapper contract is not deployed.
   * @throws {TransactionError} If the transaction fails.
   */
  public async assignAsset(
    assetId: string,
    to: string,
    amount: number,
  ): Promise<TransactionResponse> {
    const fnTag = `${FabricLeaf.CLASS_NAME}}#assignAsset`;
    this.log.debug(
      `${fnTag}, Assigning Asset: ${assetId} amount: ${amount} to: ${to}`,
    );

    if (!this.contractChannel || !this.wrapperContractName) {
      throw new WrapperContractError(`${fnTag}, Wrapper Contract not deployed`);
    }

    const response = await this.connector.transact({
      signingCredential: this.signingCredential,
      channelName: this.contractChannel,
      methodName: "assign",
      params: [assetId, to, amount.toString()],
      contractName: this.wrapperContractName,
      invocationType: FabricContractInvocationType.Send,
    });

    if (response == undefined || response.transactionId == "") {
      throw new TransactionError(fnTag);
    }

    return {
      transactionId: response.transactionId,
      output: response.functionOutput,
    };
  }
  /**
   * Retrieves all asset IDs.
   *
   * @returns {Promise<FabricAsset>} A promise that resolves to an array fabric assets.
   * @throws {WrapperContractError} If the wrapper contract is not deployed.
   * @throws {TransactionError} If the transaction fails.
   */
  public async getAsset(assetId: string): Promise<FabricAsset> {
    const fnTag = `${FabricLeaf.CLASS_NAME}}#getAsset`;
    this.log.debug(`${fnTag}, Getting Asset`);

    if (!this.contractChannel || !this.wrapperContractName) {
      throw new WrapperContractError(`${fnTag}, Wrapper Contract not deployed`);
    }

    const response = await this.connector.transact({
      signingCredential: this.signingCredential,
      channelName: this.contractChannel,
      methodName: "GetAsset",
      params: [assetId],
      contractName: this.wrapperContractName,
      invocationType: FabricContractInvocationType.Call,
    });

    if (response == undefined) {
      throw new TransactionError(fnTag);
    }

    const token = JSON.parse(response.functionOutput) as FabricAsset;

    return token;
  }

  /**
   * Retrieves the client ID associated with the Fabric network,
   * this is necessary because as there is no notion of address in Hyperledger Fabric,
   * we cannot know for sure the address ou id of us in that network and channel.
   *
   * @returns {Promise<string>} A promise that resolves to the client ID.
   * @throws {WrapperContractError} If the wrapper contract is not deployed.
   * @throws {TransactionError} If the transaction fails.
   */
  public async getClientId(): Promise<string> {
    const fnTag = `${FabricLeaf.CLASS_NAME}}#getClientId`;
    this.log.debug(`${fnTag}, Getting Client Id`);

    if (!this.contractChannel || !this.wrapperContractName) {
      throw new WrapperContractError(`${fnTag}, Wrapper Contract not deployed`);
    }

    const response = await this.connector.transact({
      signingCredential: this.signingCredential,
      channelName: this.contractChannel,
      methodName: "ClientAccountID",
      params: [],
      contractName: this.wrapperContractName,
      invocationType: FabricContractInvocationType.Call,
    });

    if (response == undefined) {
      throw new TransactionError(fnTag);
    }

    return response.functionOutput;
  }

  /**
   * Executes a transaction on the Fabric network using the specified method name and parameters.
   *
   * @param methodName - The name of the method to invoke on the Fabric contract.
   * @param params - An array of string parameters to pass to the method.
   * @returns A promise that resolves to a `TransactionResponse` object containing the transaction ID and output.
   * @throws `WrapperContractError` if the wrapper contract is not deployed.
   * @throws `TransactionError` if the transaction response is undefined or the transaction ID is empty.
   */
  public async runTransaction(
    methodName: string,
    params: string[],
  ): Promise<TransactionResponse> {
    const fnTag = `${FabricLeaf.CLASS_NAME}}#runTransaction`;
    this.log.debug(
      `${fnTag}, Running Transaction: ${methodName} with params: ${params}`,
    );

    if (!this.contractChannel || !this.wrapperContractName) {
      throw new WrapperContractError(`${fnTag}, Wrapper Contract not deployed`);
    }

    const response = await this.connector.transact({
      signingCredential: this.signingCredential,
      channelName: this.contractChannel,
      methodName: methodName,
      params: params,
      contractName: this.wrapperContractName,
      invocationType: FabricContractInvocationType.Send,
    });

    if (response == undefined || response.transactionId == "") {
      throw new TransactionError(fnTag);
    }

    return {
      transactionId: response.transactionId,
      output: response.functionOutput,
    };
  }

  /**
   * Retrieves the view for a specific asset using BUNGEE.
   *
   * @param {string} assetId - The ID of the asset to get the view for.
   * @returns {Promise<string>} A promise that resolves to the view of the asset.
   * @throws {WrapperContractError} If the wrapper contract is not deployed.
   * @throws {BungeeError} If Bungee is not initialized.
   * @throws {ViewError} If the view is undefined.
   */
  public async getView(assetId: string): Promise<string> {
    const fnTag = `${FabricLeaf.CLASS_NAME}}#getView`;
    this.log.debug(`${fnTag}, Getting View: ${assetId}`);

    if (!this.contractChannel || !this.wrapperContractName) {
      throw new WrapperContractError(`${fnTag}, Wrapper Contract not deployed`);
    }

    const networkDetails = {
      connector: this.connector,
      signingCredential: this.signingCredential,
      contractName: this.wrapperContractName,
      channelName: this.contractChannel,
      participant: this.id,
    };

    if (this.bungee == undefined) {
      throw new BungeeError(`${fnTag}, Bungee not initialized`);
    }

    try {
      const snapshot = await this.bungee.generateSnapshot(
        [assetId],
        this.networkIdentification.id,
        networkDetails,
      );

      const generated = this.bungee.generateView(
        snapshot,
        "0",
        Number.MAX_SAFE_INTEGER.toString(),
        undefined,
      );

      return safeStableStringify(generated);
    } catch (error) {
      console.error(error);
      return "";
    }
  }

  /**
   * Retrieves the receipt for a given transaction ID.
   *
   * @param transactionId - The ID of the transaction for which to get the receipt.
   * @returns A promise that resolves to the receipt of the transaction as a string.
   * @throws {WrapperContractError} If the wrapper contract is not deployed.
   */
  public async getReceipt(transactionId: string): Promise<string> {
    const fnTag = `${FabricLeaf.CLASS_NAME}}#getReceipt`;
    this.log.debug(`${fnTag}, Getting Receipt: ${transactionId}`);

    if (!this.contractChannel || !this.wrapperContractName) {
      throw new WrapperContractError(`${fnTag}, Wrapper Contract not deployed`);
    }

    const receipt = await this.connector.getTransactionReceiptByTxID({
      signingCredential: this.signingCredential,
      channelName: this.contractChannel,
      contractName: "qscc",
      invocationType: FabricContractInvocationType.Call,
      methodName: "GetBlockByTxID",
      params: [this.contractChannel, transactionId],
    });

    return safeStableStringify(receipt);
  }
}
