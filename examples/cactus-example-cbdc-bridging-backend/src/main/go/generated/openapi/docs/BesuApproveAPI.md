# \BesuApproveAPI

All URIs are relative to *http://localhost*

Method | HTTP request | Description
------------- | ------------- | -------------
[**BesuApprove**](BesuApproveAPI.md#BesuApprove) | **Post** /api/v1/@hyperledger/cactus-example-cbdc/approve-besu-tokens | Submit a transaction intent



## BesuApprove

> BesuApprove(ctx).BesuApproveRequest(besuApproveRequest).Execute()

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
	besuApproveRequest := *openapiclient.NewBesuApproveRequest("user1", "100") // BesuApproveRequest | 

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	r, err := apiClient.BesuApproveAPI.BesuApprove(context.Background()).BesuApproveRequest(besuApproveRequest).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `BesuApproveAPI.BesuApprove``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiBesuApproveRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **besuApproveRequest** | [**BesuApproveRequest**](BesuApproveRequest.md) |  | 

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

