/* eslint-disable @typescript-eslint/no-unused-vars */
import { SessionReference } from "../models/SessionReference";
import {
  GetSessionsReferencesApi,
  TransactApi,
} from "@hyperledger/cactus-example-cbdc-bridging-backend/src/main/typescript/generated/openapi/typescript-axios/api";
import { Configuration } from "@hyperledger/cactus-example-cbdc-bridging-backend/src/main/typescript/generated/openapi/typescript-axios/configuration";

export async function getSessionReferencesBridge(
  path: string,
  type: "BESU" | "FABRIC",
): Promise<SessionReference[]> {
  const getSessionReferencesApi = new GetSessionsReferencesApi(
    new Configuration({ basePath: path }),
  );
  try {
    const response = await getSessionReferencesApi.getSessionsReferences(type);

    if (response.status !== 200) {
      throw Error(response.status + " :" + response.data);
    }

    return response.data as SessionReference[];
  } catch (error) {
    console.log(error);
    return [
      {
        id: "MockID",
        status: "undefined",
        substatus: "undefined",
        originLedger: "undefined",
        destinyLedger: "undefined",
      },
    ];
  }
}

export async function transactTokens(
  path: string,
  sender: string,
  receiver: string,
  sourceChain: "FABRIC" | "BESU",
  receiverChain: "FABRIC" | "BESU",
  amount: string,
) {
  const transactApi = new TransactApi(new Configuration({ basePath: path }));
  try {
    const response = await transactApi.transact({
      sender,
      receiver,
      sourceChain: {
        assetType: sourceChain,
      },
      receiverChain: {
        assetType: receiverChain,
      },
      amount,
    });
  } catch (error) {
    console.error(error);
  }
}
