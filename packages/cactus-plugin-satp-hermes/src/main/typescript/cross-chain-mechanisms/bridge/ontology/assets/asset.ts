import { v4 as uuidv4 } from "uuid";
import { TokenType } from "../../../../generated/proto/cacti/satp/v02/common/message_pb";

export interface Asset {
  id: string;
  type: TokenType;
  owner: string;
  contractName: string;
}

export interface FungibleAsset extends Asset {
  amount: number;
}

export function getTokenType(stringType: string) {
  return TokenType[stringType.toUpperCase() as keyof typeof TokenType];
}

export function createAssetId(
  contextId: string,
  tokenType: TokenType,
  networkId: string,
): string {
  return `${uuidv4()}-${contextId}-${tokenType}-${networkId}`;
}
