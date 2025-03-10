/*
Hyperledger Cactus Plugin - Connector Fabric

Can perform basic tasks on a fabric ledger

API version: 2.1.0
*/

// Code generated by OpenAPI Generator (https://openapi-generator.tech); DO NOT EDIT.

package cactus-plugin-ledger-connector-fabric

import (
	"encoding/json"
)

// checks if the DeploymentTargetOrgFabric2x type satisfies the MappedNullable interface at compile time
var _ MappedNullable = &DeploymentTargetOrgFabric2x{}

// DeploymentTargetOrgFabric2x struct for DeploymentTargetOrgFabric2x
type DeploymentTargetOrgFabric2x struct {
	// Transient map of arguments in JSON encoding
	Transient *string `json:"transient,omitempty"`
	// Mapped to environment variables of the Fabric CLI container.
	CORE_PEER_LOCALMSPID string `json:"CORE_PEER_LOCALMSPID"`
	// Mapped to environment variables of the Fabric CLI container.
	CORE_PEER_ADDRESS string `json:"CORE_PEER_ADDRESS"`
	// Mapped to environment variables of the Fabric CLI container.
	CORE_PEER_MSPCONFIGPATH string `json:"CORE_PEER_MSPCONFIGPATH"`
	// Mapped to environment variables of the Fabric CLI container.
	CORE_PEER_TLS_ROOTCERT_FILE string `json:"CORE_PEER_TLS_ROOTCERT_FILE"`
	// Mapped to environment variables of the Fabric CLI container.
	ORDERER_TLS_ROOTCERT_FILE string `json:"ORDERER_TLS_ROOTCERT_FILE"`
}

// NewDeploymentTargetOrgFabric2x instantiates a new DeploymentTargetOrgFabric2x object
// This constructor will assign default values to properties that have it defined,
// and makes sure properties required by API are set, but the set of arguments
// will change when the set of required properties is changed
func NewDeploymentTargetOrgFabric2x(cOREPEERLOCALMSPID string, cOREPEERADDRESS string, cOREPEERMSPCONFIGPATH string, cOREPEERTLSROOTCERTFILE string, oRDERERTLSROOTCERTFILE string) *DeploymentTargetOrgFabric2x {
	this := DeploymentTargetOrgFabric2x{}
	this.CORE_PEER_LOCALMSPID = cOREPEERLOCALMSPID
	this.CORE_PEER_ADDRESS = cOREPEERADDRESS
	this.CORE_PEER_MSPCONFIGPATH = cOREPEERMSPCONFIGPATH
	this.CORE_PEER_TLS_ROOTCERT_FILE = cOREPEERTLSROOTCERTFILE
	this.ORDERER_TLS_ROOTCERT_FILE = oRDERERTLSROOTCERTFILE
	return &this
}

// NewDeploymentTargetOrgFabric2xWithDefaults instantiates a new DeploymentTargetOrgFabric2x object
// This constructor will only assign default values to properties that have it defined,
// but it doesn't guarantee that properties required by API are set
func NewDeploymentTargetOrgFabric2xWithDefaults() *DeploymentTargetOrgFabric2x {
	this := DeploymentTargetOrgFabric2x{}
	return &this
}

// GetTransient returns the Transient field value if set, zero value otherwise.
func (o *DeploymentTargetOrgFabric2x) GetTransient() string {
	if o == nil || IsNil(o.Transient) {
		var ret string
		return ret
	}
	return *o.Transient
}

// GetTransientOk returns a tuple with the Transient field value if set, nil otherwise
// and a boolean to check if the value has been set.
func (o *DeploymentTargetOrgFabric2x) GetTransientOk() (*string, bool) {
	if o == nil || IsNil(o.Transient) {
		return nil, false
	}
	return o.Transient, true
}

// HasTransient returns a boolean if a field has been set.
func (o *DeploymentTargetOrgFabric2x) HasTransient() bool {
	if o != nil && !IsNil(o.Transient) {
		return true
	}

	return false
}

// SetTransient gets a reference to the given string and assigns it to the Transient field.
func (o *DeploymentTargetOrgFabric2x) SetTransient(v string) {
	o.Transient = &v
}

// GetCORE_PEER_LOCALMSPID returns the CORE_PEER_LOCALMSPID field value
func (o *DeploymentTargetOrgFabric2x) GetCORE_PEER_LOCALMSPID() string {
	if o == nil {
		var ret string
		return ret
	}

	return o.CORE_PEER_LOCALMSPID
}

// GetCORE_PEER_LOCALMSPIDOk returns a tuple with the CORE_PEER_LOCALMSPID field value
// and a boolean to check if the value has been set.
func (o *DeploymentTargetOrgFabric2x) GetCORE_PEER_LOCALMSPIDOk() (*string, bool) {
	if o == nil {
		return nil, false
	}
	return &o.CORE_PEER_LOCALMSPID, true
}

// SetCORE_PEER_LOCALMSPID sets field value
func (o *DeploymentTargetOrgFabric2x) SetCORE_PEER_LOCALMSPID(v string) {
	o.CORE_PEER_LOCALMSPID = v
}

// GetCORE_PEER_ADDRESS returns the CORE_PEER_ADDRESS field value
func (o *DeploymentTargetOrgFabric2x) GetCORE_PEER_ADDRESS() string {
	if o == nil {
		var ret string
		return ret
	}

	return o.CORE_PEER_ADDRESS
}

// GetCORE_PEER_ADDRESSOk returns a tuple with the CORE_PEER_ADDRESS field value
// and a boolean to check if the value has been set.
func (o *DeploymentTargetOrgFabric2x) GetCORE_PEER_ADDRESSOk() (*string, bool) {
	if o == nil {
		return nil, false
	}
	return &o.CORE_PEER_ADDRESS, true
}

// SetCORE_PEER_ADDRESS sets field value
func (o *DeploymentTargetOrgFabric2x) SetCORE_PEER_ADDRESS(v string) {
	o.CORE_PEER_ADDRESS = v
}

// GetCORE_PEER_MSPCONFIGPATH returns the CORE_PEER_MSPCONFIGPATH field value
func (o *DeploymentTargetOrgFabric2x) GetCORE_PEER_MSPCONFIGPATH() string {
	if o == nil {
		var ret string
		return ret
	}

	return o.CORE_PEER_MSPCONFIGPATH
}

// GetCORE_PEER_MSPCONFIGPATHOk returns a tuple with the CORE_PEER_MSPCONFIGPATH field value
// and a boolean to check if the value has been set.
func (o *DeploymentTargetOrgFabric2x) GetCORE_PEER_MSPCONFIGPATHOk() (*string, bool) {
	if o == nil {
		return nil, false
	}
	return &o.CORE_PEER_MSPCONFIGPATH, true
}

// SetCORE_PEER_MSPCONFIGPATH sets field value
func (o *DeploymentTargetOrgFabric2x) SetCORE_PEER_MSPCONFIGPATH(v string) {
	o.CORE_PEER_MSPCONFIGPATH = v
}

// GetCORE_PEER_TLS_ROOTCERT_FILE returns the CORE_PEER_TLS_ROOTCERT_FILE field value
func (o *DeploymentTargetOrgFabric2x) GetCORE_PEER_TLS_ROOTCERT_FILE() string {
	if o == nil {
		var ret string
		return ret
	}

	return o.CORE_PEER_TLS_ROOTCERT_FILE
}

// GetCORE_PEER_TLS_ROOTCERT_FILEOk returns a tuple with the CORE_PEER_TLS_ROOTCERT_FILE field value
// and a boolean to check if the value has been set.
func (o *DeploymentTargetOrgFabric2x) GetCORE_PEER_TLS_ROOTCERT_FILEOk() (*string, bool) {
	if o == nil {
		return nil, false
	}
	return &o.CORE_PEER_TLS_ROOTCERT_FILE, true
}

// SetCORE_PEER_TLS_ROOTCERT_FILE sets field value
func (o *DeploymentTargetOrgFabric2x) SetCORE_PEER_TLS_ROOTCERT_FILE(v string) {
	o.CORE_PEER_TLS_ROOTCERT_FILE = v
}

// GetORDERER_TLS_ROOTCERT_FILE returns the ORDERER_TLS_ROOTCERT_FILE field value
func (o *DeploymentTargetOrgFabric2x) GetORDERER_TLS_ROOTCERT_FILE() string {
	if o == nil {
		var ret string
		return ret
	}

	return o.ORDERER_TLS_ROOTCERT_FILE
}

// GetORDERER_TLS_ROOTCERT_FILEOk returns a tuple with the ORDERER_TLS_ROOTCERT_FILE field value
// and a boolean to check if the value has been set.
func (o *DeploymentTargetOrgFabric2x) GetORDERER_TLS_ROOTCERT_FILEOk() (*string, bool) {
	if o == nil {
		return nil, false
	}
	return &o.ORDERER_TLS_ROOTCERT_FILE, true
}

// SetORDERER_TLS_ROOTCERT_FILE sets field value
func (o *DeploymentTargetOrgFabric2x) SetORDERER_TLS_ROOTCERT_FILE(v string) {
	o.ORDERER_TLS_ROOTCERT_FILE = v
}

func (o DeploymentTargetOrgFabric2x) MarshalJSON() ([]byte, error) {
	toSerialize,err := o.ToMap()
	if err != nil {
		return []byte{}, err
	}
	return json.Marshal(toSerialize)
}

func (o DeploymentTargetOrgFabric2x) ToMap() (map[string]interface{}, error) {
	toSerialize := map[string]interface{}{}
	if !IsNil(o.Transient) {
		toSerialize["transient"] = o.Transient
	}
	toSerialize["CORE_PEER_LOCALMSPID"] = o.CORE_PEER_LOCALMSPID
	toSerialize["CORE_PEER_ADDRESS"] = o.CORE_PEER_ADDRESS
	toSerialize["CORE_PEER_MSPCONFIGPATH"] = o.CORE_PEER_MSPCONFIGPATH
	toSerialize["CORE_PEER_TLS_ROOTCERT_FILE"] = o.CORE_PEER_TLS_ROOTCERT_FILE
	toSerialize["ORDERER_TLS_ROOTCERT_FILE"] = o.ORDERER_TLS_ROOTCERT_FILE
	return toSerialize, nil
}

type NullableDeploymentTargetOrgFabric2x struct {
	value *DeploymentTargetOrgFabric2x
	isSet bool
}

func (v NullableDeploymentTargetOrgFabric2x) Get() *DeploymentTargetOrgFabric2x {
	return v.value
}

func (v *NullableDeploymentTargetOrgFabric2x) Set(val *DeploymentTargetOrgFabric2x) {
	v.value = val
	v.isSet = true
}

func (v NullableDeploymentTargetOrgFabric2x) IsSet() bool {
	return v.isSet
}

func (v *NullableDeploymentTargetOrgFabric2x) Unset() {
	v.value = nil
	v.isSet = false
}

func NewNullableDeploymentTargetOrgFabric2x(val *DeploymentTargetOrgFabric2x) *NullableDeploymentTargetOrgFabric2x {
	return &NullableDeploymentTargetOrgFabric2x{value: val, isSet: true}
}

func (v NullableDeploymentTargetOrgFabric2x) MarshalJSON() ([]byte, error) {
	return json.Marshal(v.value)
}

func (v *NullableDeploymentTargetOrgFabric2x) UnmarshalJSON(src []byte) error {
	v.isSet = true
	return json.Unmarshal(src, &v.value)
}


