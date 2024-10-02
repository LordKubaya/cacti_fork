# \FabricMintAPI

All URIs are relative to *http://localhost*

Method | HTTP request | Description
------------- | ------------- | -------------
[**FabricMint**](FabricMintAPI.md#FabricMint) | **Post** /api/v1/@hyperledger/cactus-example-cbdc/mint-fabric-tokens | Submit a transaction intent



## FabricMint

> FabricMint(ctx).MintRequest(mintRequest).Execute()

Submit a transaction intent



### Example

```go
package main

import (
	"context"
	"fmt"
	"os"
	openapiclient "github.com/hyperledger/cacti/examples/cactus-example-cbdc-bridging-backend/src/main/go/generated"
)

func main() {
	mintRequest := *openapiclient.NewMintRequest("user1", "100") // MintRequest | 

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	r, err := apiClient.FabricMintAPI.FabricMint(context.Background()).MintRequest(mintRequest).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `FabricMintAPI.FabricMint``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiFabricMintRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **mintRequest** | [**MintRequest**](MintRequest.md) |  | 

### Return type

 (empty response body)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)

