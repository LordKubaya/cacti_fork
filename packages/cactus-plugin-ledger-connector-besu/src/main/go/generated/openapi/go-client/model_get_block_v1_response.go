/*
Hyperledger Cactus Plugin - Connector Besu

Can perform basic tasks on a Besu ledger

API version: 2.1.0
*/

// Code generated by OpenAPI Generator (https://openapi-generator.tech); DO NOT EDIT.

package cactus-plugin-ledger-connector-besu

import (
	"encoding/json"
)

// checks if the GetBlockV1Response type satisfies the MappedNullable interface at compile time
var _ MappedNullable = &GetBlockV1Response{}

// GetBlockV1Response struct for GetBlockV1Response
type GetBlockV1Response struct {
	Block EvmBlock `json:"block"`
}

// NewGetBlockV1Response instantiates a new GetBlockV1Response object
// This constructor will assign default values to properties that have it defined,
// and makes sure properties required by API are set, but the set of arguments
// will change when the set of required properties is changed
func NewGetBlockV1Response(block EvmBlock) *GetBlockV1Response {
	this := GetBlockV1Response{}
	this.Block = block
	return &this
}

// NewGetBlockV1ResponseWithDefaults instantiates a new GetBlockV1Response object
// This constructor will only assign default values to properties that have it defined,
// but it doesn't guarantee that properties required by API are set
func NewGetBlockV1ResponseWithDefaults() *GetBlockV1Response {
	this := GetBlockV1Response{}
	return &this
}

// GetBlock returns the Block field value
func (o *GetBlockV1Response) GetBlock() EvmBlock {
	if o == nil {
		var ret EvmBlock
		return ret
	}

	return o.Block
}

// GetBlockOk returns a tuple with the Block field value
// and a boolean to check if the value has been set.
func (o *GetBlockV1Response) GetBlockOk() (*EvmBlock, bool) {
	if o == nil {
		return nil, false
	}
	return &o.Block, true
}

// SetBlock sets field value
func (o *GetBlockV1Response) SetBlock(v EvmBlock) {
	o.Block = v
}

func (o GetBlockV1Response) MarshalJSON() ([]byte, error) {
	toSerialize,err := o.ToMap()
	if err != nil {
		return []byte{}, err
	}
	return json.Marshal(toSerialize)
}

func (o GetBlockV1Response) ToMap() (map[string]interface{}, error) {
	toSerialize := map[string]interface{}{}
	toSerialize["block"] = o.Block
	return toSerialize, nil
}

type NullableGetBlockV1Response struct {
	value *GetBlockV1Response
	isSet bool
}

func (v NullableGetBlockV1Response) Get() *GetBlockV1Response {
	return v.value
}

func (v *NullableGetBlockV1Response) Set(val *GetBlockV1Response) {
	v.value = val
	v.isSet = true
}

func (v NullableGetBlockV1Response) IsSet() bool {
	return v.isSet
}

func (v *NullableGetBlockV1Response) Unset() {
	v.value = nil
	v.isSet = false
}

func NewNullableGetBlockV1Response(val *GetBlockV1Response) *NullableGetBlockV1Response {
	return &NullableGetBlockV1Response{value: val, isSet: true}
}

func (v NullableGetBlockV1Response) MarshalJSON() ([]byte, error) {
	return json.Marshal(v.value)
}

func (v *NullableGetBlockV1Response) UnmarshalJSON(src []byte) error {
	v.isSet = true
	return json.Unmarshal(src, &v.value)
}


