import {
  IPluginLedgerConnector,
  LedgerType,
} from "@hyperledger/cactus-core-api";
import { NetworkId } from "../../network-identification/chainid-list";
import { LogLevelDesc } from "@hyperledger/cactus-common";
import { ISignerKeyPairs } from "@hyperledger/cactus-common/src/main/typescript/signer-key-pairs";
import { ClaimFormat } from "../../generated/proto/cacti/satp/v02/common/message_pb";
import { PluginBungeeHermes } from "@hyperledger/cactus-plugin-bungee-hermes";
import { OntologyManager } from "./ontology/ontology-manager";
import { v4 as uuidv4 } from "uuid";

/**
 * Options for configuring a bridge leaf in a cross-chain mechanism.
 *
 * @property {NetworkId} networkIdentification - The identification of the network.
 * @property {OntologyManager} ontologyManager - The manager responsible for the ontology.
 * @property {string} [leafId] - Optional identifier for the leaf.
 * @property {ISignerKeyPairs} [keyPair] - Optional key pair for signing.
 * @property {LogLevelDesc} [logLevel] - Optional log level for logging.
 * @property {ClaimFormat} [claimFormat] - Optional format for claims.
 */
export interface BridgeLeafOptions {
  networkIdentification: NetworkId;
  ontologyManager: OntologyManager;
  leafId?: string;
  keyPair?: ISignerKeyPairs;
  logLevel?: LogLevelDesc;
  claimFormat?: ClaimFormat;
}

/**
 * Abstract class representing a bridge leaf in a cross-chain mechanism.
 *
 * In DLT bridges, a “leaf” is analogous to a bascule bridge leaf — an independent module forming half of a cross-chain connection.
 * Each leaf handles specific tasks, and together (2 or more leafs) they provide a secure, trustless bridge between ledger.
 *
 * @abstract
 */
export abstract class BridgeLeaf {
  /**
   * Unique identifier for the bridge leaf.
   *
   * @protected
   * @abstract
   * @readonly
   */
  protected abstract readonly id: string;

  /**
   * Network identification details.
   *
   * @protected
   * @abstract
   * @readonly
   */
  protected abstract readonly networkIdentification: NetworkId;

  /**
   * Key pairs used for signing.
   *
   * @protected
   * @abstract
   * @readonly
   */
  protected abstract readonly keyPair: ISignerKeyPairs;

  /**
   * Logging level.
   *
   * @protected
   * @abstract
   * @readonly
   */
  protected abstract readonly logLevel: LogLevelDesc;

  /**
   * Format of the claim.
   *
   * @protected
   * @abstract
   * @readonly
   */
  protected abstract readonly claimFormat: ClaimFormat;

  /**
   * Optional bungee plugin for Hermes.
   *
   * @protected
   * @abstract
   * @readonly
   */
  protected abstract readonly bungee?: PluginBungeeHermes;

  /**
   * Ontology manager instance.
   *
   * @protected
   * @abstract
   * @readonly
   */
  protected abstract readonly ontologyManager: OntologyManager;

  /**
   * Connector for the ledger plugin.
   *
   * @protected
   * @abstract
   * @readonly
   */
  protected abstract readonly connector: IPluginLedgerConnector<
    unknown,
    unknown,
    unknown,
    unknown
  >;

  /**
   * Retrieves the unique identifier of the bridge leaf.
   *
   * @returns {string} The unique identifier.
   * @throws Will throw the identifier.
   */
  public getId(): string {
    throw this.id;
  }

  /**
   * Creates a unique identifier for the bridge leaf based on the provided leaf name.
   *
   * @param {string} leafName - The name of the leaf.
   * @returns {string} The generated unique identifier.
   */
  public createId(leafName: string): string {
    return `${leafName}-${this.networkIdentification.id}-${this.networkIdentification.ledgerType}-${uuidv4()}`;
  }

  /**
   * Retrieves the network identifier.
   *
   * @returns {string} The network identifier.
   * @throws Will throw the network identifier.
   */
  public getNetworkId(): string {
    throw this.networkIdentification.id;
  }

  /**
   * Retrieves the ledger type.
   *
   * @returns {LedgerType} The ledger type.
   */
  public getLedgerType(): LedgerType {
    return this.networkIdentification.ledgerType;
  }

  /**
   * Retrieves the network identification details.
   *
   * @returns {NetworkId} The network identification details.
   */
  public getNetworkIdentification(): NetworkId {
    return this.networkIdentification;
  }

  /**
   * Represents an abstract base class for a bridge leaf in a cross-chain mechanism.
   *
   * @abstract
   */
  public abstract deployContracts(): Promise<void>;
}
