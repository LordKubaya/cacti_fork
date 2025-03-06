import {
  Logger,
  LoggerProvider,
  LogLevelDesc,
} from "@hyperledger/cactus-common";
import { BridgeLeaf, BridgeLeafOptions } from "./bridge-leaf";
import { LedgerType } from "@hyperledger/cactus-core-api";
import { NetworkId } from "../../network-identification/chainid-list";
import { BesuLeaf, BesuLeafOptions } from "./leafs/besu-leaf";
import {
  DeployLeafError,
  LeafError,
  UnsupportedNetworkError,
  WrapperContractAlreadyCreatedError,
} from "./bridge-errors";
import { EthereumLeaf, EthereumLeafOptions } from "./leafs/ethereum-leaf";
import { FabricLeaf, FabricLeafOptions } from "./leafs/fabric-leaf";

/**
 * Options for configuring the BridgeManager.
 *
 * @property {LogLevelDesc} [logLevel] - The log level for the BridgeManager.
 */
interface BridgeManagerOptions {
  logLevel?: LogLevelDesc;
}

/**
 * Retrieves the list of available network IDs for which bridge endpoints are deployed.
 *
 * @returns {NetworkId[]} An array of network IDs for which bridge endpoints are available.
 */
export class BridgeManager {
  public static readonly CLASS_NAME = "BridgeDeployer";
  private readonly log: Logger;
  private readonly logLevel: LogLevelDesc;

  private readonly leafs: Map<NetworkId, BridgeLeaf> = new Map<
    NetworkId,
    BridgeLeaf
  >();

  /**
   * Creates an instance of BridgeManager.
   *
   * @param options - The configuration options for the BridgeManager.
   */
  constructor(public readonly options: BridgeManagerOptions) {
    const label = BridgeManager.CLASS_NAME;
    this.logLevel = this.options.logLevel || "INFO";
    this.log = LoggerProvider.getOrCreate({ label, level: this.logLevel });
  }

  /**
   * Deploys a new leaf (bridge endpoint) based on the provided options.
   *
   * @param leafOptions - The configuration options for the leaf to be deployed.
   * @throws {DeployLeafError} If the leaf is already deployed or if there is an error during deployment.
   * @throws {UnsupportedNetworkError} If the network type specified in the options is not supported.
   * @throws {WrapperContractAlreadyCreatedError} If the contracts are already deployed.
   * @returns {Promise<void>} A promise that resolves when the leaf is successfully deployed.
   */
  public async deployLeaf(leafOptions: BridgeLeafOptions): Promise<void> {
    const fnTag = `${BridgeManager.CLASS_NAME}#deployLeaf()`;
    this.log.debug(`${fnTag}, Deploying Leaf...`);

    if (this.leafs.has(leafOptions.networkIdentification)) {
      throw new DeployLeafError(
        `${fnTag}, Leaf already deployed: ${leafOptions.networkIdentification}`,
      );
    }

    try {
      let leaf: BridgeLeaf;
      switch (leafOptions.networkIdentification.ledgerType) {
        case LedgerType.Besu1X:
        case LedgerType.Besu2X:
          leaf = new BesuLeaf(leafOptions as BesuLeafOptions);
          break;
        case LedgerType.Ethereum:
          leaf = new EthereumLeaf(leafOptions as EthereumLeafOptions);
          break;
        case LedgerType.Fabric2:
          leaf = new FabricLeaf(leafOptions as FabricLeafOptions);
          break;
        default:
          throw new UnsupportedNetworkError(
            `${fnTag}, ${leafOptions.networkIdentification.ledgerType} is not supported`,
          );
      }
      try {
        await leaf.deployContracts();
      } catch (error) {
        if (error instanceof WrapperContractAlreadyCreatedError) {
          this.log.debug("Contracts already deployed");
        } else {
          throw error;
        }
      }
    } catch (error) {
      throw new DeployLeafError(error);
    }
  }
  /**
   * Retrieves the bridge endpoint (leaf) for the specified network ID.
   *
   * @param id - The network ID for which to retrieve the bridge endpoint.
   * @throws {LeafError} If the bridge endpoint is not available for the specified network ID.
   * @returns {BridgeLeaf} The bridge endpoint associated with the specified network ID.
   */
  public getBridgeEndPoint(id: NetworkId): BridgeLeaf {
    const fnTag = `${BridgeManager.CLASS_NAME}#deployLeaf()`;
    this.log.debug(`${fnTag}, Getting Leaf...`);
    const leaf = this.leafs.get(id);
    if (!leaf) {
      throw new LeafError(`${fnTag}, Bridge endpoint not available: ${id}`);
    }
    return leaf;
  }
  /**
   * The BridgeManager class is responsible for managing the deployment and retrieval of bridge leaf nodes for different blockchain networks.
   *
   * @class BridgeManager
   */
  public getAvailableEndPoints(): NetworkId[] {
    const fnTag = `${BridgeManager.CLASS_NAME}#getAvailableEndPoints()`;
    this.log.debug(`${fnTag}, Getting Leafs...`);
    return Array.from(this.leafs.keys());
  }
}
