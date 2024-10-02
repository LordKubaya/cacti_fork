# \BesuTransferAPI

All URIs are relative to *http://localhost*

Method | HTTP request | Description
------------- | ------------- | -------------
[**BesuTransfer**](BesuTransferAPI.md#BesuTransfer) | **Post** /api/v1/@hyperledger/cactus-example-cbdc/transfer-besu-tokens | Submit a transaction intent



## BesuTransfer

> BesuTransfer(ctx).TransferRequest(transferRequest).Execute()

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
	transferRequest := *openapiclient.NewTransferRequest("user1", "user2", "100") // TransferRequest | 

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	r, err := apiClient.BesuTransferAPI.BesuTransfer(context.Background()).TransferRequest(transferRequest).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `BesuTransferAPI.BesuTransfer``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiBesuTransferRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **transferRequest** | [**TransferRequest**](TransferRequest.md) |  | 

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

