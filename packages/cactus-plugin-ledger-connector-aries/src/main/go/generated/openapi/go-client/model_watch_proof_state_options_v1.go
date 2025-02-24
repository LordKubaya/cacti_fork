/*
Hyperledger Cacti Plugin - Connector Aries

Can communicate with other Aries agents and Cacti Aries connectors

API version: 2.1.0
*/

// Code generated by OpenAPI Generator (https://openapi-generator.tech); DO NOT EDIT.

package cactus-plugin-ledger-connector-aries

import (
	"encoding/json"
)

// checks if the WatchProofStateOptionsV1 type satisfies the MappedNullable interface at compile time
var _ MappedNullable = &WatchProofStateOptionsV1{}

// WatchProofStateOptionsV1 Options passed when monitoring proof state change events.
type WatchProofStateOptionsV1 struct {
	// Aries agent label that will also be used as wallet id.
	AgentName string `json:"agentName"`
}

// NewWatchProofStateOptionsV1 instantiates a new WatchProofStateOptionsV1 object
// This constructor will assign default values to properties that have it defined,
// and makes sure properties required by API are set, but the set of arguments
// will change when the set of required properties is changed
func NewWatchProofStateOptionsV1(agentName string) *WatchProofStateOptionsV1 {
	this := WatchProofStateOptionsV1{}
	this.AgentName = agentName
	return &this
}

// NewWatchProofStateOptionsV1WithDefaults instantiates a new WatchProofStateOptionsV1 object
// This constructor will only assign default values to properties that have it defined,
// but it doesn't guarantee that properties required by API are set
func NewWatchProofStateOptionsV1WithDefaults() *WatchProofStateOptionsV1 {
	this := WatchProofStateOptionsV1{}
	return &this
}

// GetAgentName returns the AgentName field value
func (o *WatchProofStateOptionsV1) GetAgentName() string {
	if o == nil {
		var ret string
		return ret
	}

	return o.AgentName
}

// GetAgentNameOk returns a tuple with the AgentName field value
// and a boolean to check if the value has been set.
func (o *WatchProofStateOptionsV1) GetAgentNameOk() (*string, bool) {
	if o == nil {
		return nil, false
	}
	return &o.AgentName, true
}

// SetAgentName sets field value
func (o *WatchProofStateOptionsV1) SetAgentName(v string) {
	o.AgentName = v
}

func (o WatchProofStateOptionsV1) MarshalJSON() ([]byte, error) {
	toSerialize,err := o.ToMap()
	if err != nil {
		return []byte{}, err
	}
	return json.Marshal(toSerialize)
}

func (o WatchProofStateOptionsV1) ToMap() (map[string]interface{}, error) {
	toSerialize := map[string]interface{}{}
	toSerialize["agentName"] = o.AgentName
	return toSerialize, nil
}

type NullableWatchProofStateOptionsV1 struct {
	value *WatchProofStateOptionsV1
	isSet bool
}

func (v NullableWatchProofStateOptionsV1) Get() *WatchProofStateOptionsV1 {
	return v.value
}

func (v *NullableWatchProofStateOptionsV1) Set(val *WatchProofStateOptionsV1) {
	v.value = val
	v.isSet = true
}

func (v NullableWatchProofStateOptionsV1) IsSet() bool {
	return v.isSet
}

func (v *NullableWatchProofStateOptionsV1) Unset() {
	v.value = nil
	v.isSet = false
}

func NewNullableWatchProofStateOptionsV1(val *WatchProofStateOptionsV1) *NullableWatchProofStateOptionsV1 {
	return &NullableWatchProofStateOptionsV1{value: val, isSet: true}
}

func (v NullableWatchProofStateOptionsV1) MarshalJSON() ([]byte, error) {
	return json.Marshal(v.value)
}

func (v *NullableWatchProofStateOptionsV1) UnmarshalJSON(src []byte) error {
	v.isSet = true
	return json.Unmarshal(src, &v.value)
}


