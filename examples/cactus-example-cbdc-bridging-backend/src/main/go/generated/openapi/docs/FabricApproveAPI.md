# \FabricApproveAPI

All URIs are relative to *http://localhost*

Method | HTTP request | Description
------------- | ------------- | -------------
[**FabricApprove**](FabricApproveAPI.md#FabricApprove) | **Post** /api/v1/@hyperledger/cactus-example-cbdc/approve-fabric-tokens | Submit a transaction intent



## FabricApprove

> FabricApprove(ctx).FabricApproveRequest(fabricApproveRequest).Execute()

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
	fabricApproveRequest := *openapiclient.NewFabricApproveRequest("user1", "100") // FabricApproveRequest | 

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	r, err := apiClient.FabricApproveAPI.FabricApprove(context.Background()).FabricApproveRequest(fabricApproveRequest).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `FabricApproveAPI.FabricApprove``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiFabricApproveRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **fabricApproveRequest** | [**FabricApproveRequest**](FabricApproveRequest.md) |  | 

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

