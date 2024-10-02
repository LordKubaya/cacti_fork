# SessionReference

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Id** | **string** |  | 
**Status** | **string** |  | 
**OriginLedger** | **string** |  | 
**DestinyLedger** | **string** |  | 

## Methods

### NewSessionReference

`func NewSessionReference(id string, status string, originLedger string, destinyLedger string, ) *SessionReference`

NewSessionReference instantiates a new SessionReference object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewSessionReferenceWithDefaults

`func NewSessionReferenceWithDefaults() *SessionReference`

NewSessionReferenceWithDefaults instantiates a new SessionReference object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetId

`func (o *SessionReference) GetId() string`

GetId returns the Id field if non-nil, zero value otherwise.

### GetIdOk

`func (o *SessionReference) GetIdOk() (*string, bool)`

GetIdOk returns a tuple with the Id field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetId

`func (o *SessionReference) SetId(v string)`

SetId sets Id field to given value.


### GetStatus

`func (o *SessionReference) GetStatus() string`

GetStatus returns the Status field if non-nil, zero value otherwise.

### GetStatusOk

`func (o *SessionReference) GetStatusOk() (*string, bool)`

GetStatusOk returns a tuple with the Status field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetStatus

`func (o *SessionReference) SetStatus(v string)`

SetStatus sets Status field to given value.


### GetOriginLedger

`func (o *SessionReference) GetOriginLedger() string`

GetOriginLedger returns the OriginLedger field if non-nil, zero value otherwise.

### GetOriginLedgerOk

`func (o *SessionReference) GetOriginLedgerOk() (*string, bool)`

GetOriginLedgerOk returns a tuple with the OriginLedger field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetOriginLedger

`func (o *SessionReference) SetOriginLedger(v string)`

SetOriginLedger sets OriginLedger field to given value.


### GetDestinyLedger

`func (o *SessionReference) GetDestinyLedger() string`

GetDestinyLedger returns the DestinyLedger field if non-nil, zero value otherwise.

### GetDestinyLedgerOk

`func (o *SessionReference) GetDestinyLedgerOk() (*string, bool)`

GetDestinyLedgerOk returns a tuple with the DestinyLedger field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetDestinyLedger

`func (o *SessionReference) SetDestinyLedger(v string)`

SetDestinyLedger sets DestinyLedger field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


