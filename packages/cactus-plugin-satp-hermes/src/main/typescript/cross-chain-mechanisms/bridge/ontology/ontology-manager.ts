import { LedgerType } from "@hyperledger/cactus-core-api";
import { TokenType } from "../../../generated/proto/cacti/satp/v02/common/message_pb";
import { InteractionsRequest as EvmInteractionSignature } from "../../../generated/SATPWrapperContract";
import {
  fabricInteractionList,
  FabricInteractionSignature,
} from "./assets/fabric-asset";
import { evmInteractionList } from "./assets/evm-asset";
import { LedgerNotSupported, OntologyNotFoundError } from "./ontology-errors";
import {
  Logger,
  LoggerProvider,
  LogLevelDesc,
} from "@hyperledger/cactus-common";

export class OntologyManager {
  public static readonly CLASS_NAME = "OntologyManager";
  private readonly log: Logger;
  private readonly logLevel: LogLevelDesc;

  private ontologies: Map<[LedgerType, TokenType], string> = new Map<
    [LedgerType, TokenType],
    string
  >();

  constructor(logLevel: LogLevelDesc) {
    const label = OntologyManager.CLASS_NAME;
    this.logLevel = logLevel || "INFO";
    this.log = LoggerProvider.getOrCreate({ label, level: this.logLevel });
    // Initialization code here
  }

  public getOntology(ledgerType: LedgerType, tokenType: TokenType): string {
    const ontology = this.ontologies.get([ledgerType, tokenType]);
    if (!ontology) {
      throw new OntologyNotFoundError();
    }
    return ontology;
  }

  public addOntology(): void {
    throw new Error("Method not implemented.");
  }

  public removeOntology(): void {
    throw new Error("Method not implemented.");
  }

  public getOntologyInteractions(
    ledgerType: LedgerType,
    tokenType: TokenType,
  ): FabricInteractionSignature[] | EvmInteractionSignature[] {
    const ontology = this.getOntology(ledgerType, tokenType);

    //TODO This might need a refactor to support non-fungible tokens
    switch (ledgerType) {
      case LedgerType.Fabric2:
        return fabricInteractionList(ontology);
      case LedgerType.Besu1X:
      case LedgerType.Besu2X:
      case LedgerType.Ethereum:
        return evmInteractionList(ontology);
      default:
        throw new LedgerNotSupported(`Ledger ${ledgerType} not supported`);
    }
  }
}
