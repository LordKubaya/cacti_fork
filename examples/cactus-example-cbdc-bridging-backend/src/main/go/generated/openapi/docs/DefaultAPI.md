# \DefaultAPI

All URIs are relative to *http://localhost*

Method | HTTP request | Description
------------- | ------------- | -------------
[**GetBalance**](DefaultAPI.md#GetBalance) | **Get** /api/v1/@hyperledger/cactus-example-cbdc/get-balance | 
[**GetStatus**](DefaultAPI.md#GetStatus) | **Get** /api/v1/@hyperledger/cactus-example-cbdc/get-sessions-references | Get SATP current sessions data



## GetBalance

> BalanceResponse GetBalance(ctx).User(user).Chain(chain).Execute()



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
	user := "user_example" // string |  (optional)
	chain := "chain_example" // string |  (optional)

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.DefaultAPI.GetBalance(context.Background()).User(user).Chain(chain).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `DefaultAPI.GetBalance``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `GetBalance`: BalanceResponse
	fmt.Fprintf(os.Stdout, "Response from `DefaultAPI.GetBalance`: %v\n", resp)
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiGetBalanceRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **user** | **string** |  | 
 **chain** | **string** |  | 

### Return type

[**BalanceResponse**](BalanceResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## GetStatus

> []SessionReference GetStatus(ctx).Ledger(ledger).Execute()

Get SATP current sessions data



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
	ledger := "ledger_example" // string | Unique identifier for the session. (optional)

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.DefaultAPI.GetStatus(context.Background()).Ledger(ledger).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `DefaultAPI.GetStatus``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `GetStatus`: []SessionReference
	fmt.Fprintf(os.Stdout, "Response from `DefaultAPI.GetStatus`: %v\n", resp)
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiGetStatusRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **ledger** | **string** | Unique identifier for the session. | 

### Return type

[**[]SessionReference**](SessionReference.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)

