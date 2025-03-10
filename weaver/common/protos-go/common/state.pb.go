// Copyright IBM Corp. All Rights Reserved.
//
// SPDX-License-Identifier: Apache-2.0

// Code generated by protoc-gen-go. DO NOT EDIT.
// versions:
// 	protoc-gen-go v1.30.0
// 	protoc        v4.23.4
// source: common/state.proto

package common

import (
	protoreflect "google.golang.org/protobuf/reflect/protoreflect"
	protoimpl "google.golang.org/protobuf/runtime/protoimpl"
	reflect "reflect"
	sync "sync"
)

const (
	// Verify that this generated code is sufficiently up-to-date.
	_ = protoimpl.EnforceVersion(20 - protoimpl.MinVersion)
	// Verify that runtime/protoimpl is sufficiently up-to-date.
	_ = protoimpl.EnforceVersion(protoimpl.MaxVersion - 20)
)

type Meta_Protocol int32

const (
	Meta_BITCOIN  Meta_Protocol = 0
	Meta_ETHEREUM Meta_Protocol = 1
	Meta_FABRIC   Meta_Protocol = 3
	Meta_CORDA    Meta_Protocol = 4
)

// Enum value maps for Meta_Protocol.
var (
	Meta_Protocol_name = map[int32]string{
		0: "BITCOIN",
		1: "ETHEREUM",
		3: "FABRIC",
		4: "CORDA",
	}
	Meta_Protocol_value = map[string]int32{
		"BITCOIN":  0,
		"ETHEREUM": 1,
		"FABRIC":   3,
		"CORDA":    4,
	}
)

func (x Meta_Protocol) Enum() *Meta_Protocol {
	p := new(Meta_Protocol)
	*p = x
	return p
}

func (x Meta_Protocol) String() string {
	return protoimpl.X.EnumStringOf(x.Descriptor(), protoreflect.EnumNumber(x))
}

func (Meta_Protocol) Descriptor() protoreflect.EnumDescriptor {
	return file_common_state_proto_enumTypes[0].Descriptor()
}

func (Meta_Protocol) Type() protoreflect.EnumType {
	return &file_common_state_proto_enumTypes[0]
}

func (x Meta_Protocol) Number() protoreflect.EnumNumber {
	return protoreflect.EnumNumber(x)
}

// Deprecated: Use Meta_Protocol.Descriptor instead.
func (Meta_Protocol) EnumDescriptor() ([]byte, []int) {
	return file_common_state_proto_rawDescGZIP(), []int{0, 0}
}

type RequestState_STATUS int32

const (
	// pending ACK from remote relay
	RequestState_PENDING_ACK RequestState_STATUS = 0
	// Received ACK, waiting for data to be sent from remote relay
	RequestState_PENDING           RequestState_STATUS = 1
	RequestState_ERROR             RequestState_STATUS = 2 // View is not there, received error from remote relay
	RequestState_COMPLETED         RequestState_STATUS = 3 // Data Sharing completed Successfully
	RequestState_EVENT_RECEIVED    RequestState_STATUS = 4 // View is there and event is received from remote relay
	RequestState_EVENT_WRITTEN     RequestState_STATUS = 5 // Driver Successfully wrote the view to ledger
	RequestState_EVENT_WRITE_ERROR RequestState_STATUS = 6 // View is there but driver failed to write
	RequestState_DELETED           RequestState_STATUS = 7 // Once network fetches this request state, mark it delete for cleanup later on
)

// Enum value maps for RequestState_STATUS.
var (
	RequestState_STATUS_name = map[int32]string{
		0: "PENDING_ACK",
		1: "PENDING",
		2: "ERROR",
		3: "COMPLETED",
		4: "EVENT_RECEIVED",
		5: "EVENT_WRITTEN",
		6: "EVENT_WRITE_ERROR",
		7: "DELETED",
	}
	RequestState_STATUS_value = map[string]int32{
		"PENDING_ACK":       0,
		"PENDING":           1,
		"ERROR":             2,
		"COMPLETED":         3,
		"EVENT_RECEIVED":    4,
		"EVENT_WRITTEN":     5,
		"EVENT_WRITE_ERROR": 6,
		"DELETED":           7,
	}
)

func (x RequestState_STATUS) Enum() *RequestState_STATUS {
	p := new(RequestState_STATUS)
	*p = x
	return p
}

func (x RequestState_STATUS) String() string {
	return protoimpl.X.EnumStringOf(x.Descriptor(), protoreflect.EnumNumber(x))
}

func (RequestState_STATUS) Descriptor() protoreflect.EnumDescriptor {
	return file_common_state_proto_enumTypes[1].Descriptor()
}

func (RequestState_STATUS) Type() protoreflect.EnumType {
	return &file_common_state_proto_enumTypes[1]
}

func (x RequestState_STATUS) Number() protoreflect.EnumNumber {
	return protoreflect.EnumNumber(x)
}

// Deprecated: Use RequestState_STATUS.Descriptor instead.
func (RequestState_STATUS) EnumDescriptor() ([]byte, []int) {
	return file_common_state_proto_rawDescGZIP(), []int{3, 0}
}

// Metadata for a View
type Meta struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	// Underlying distributed ledger protocol.
	Protocol Meta_Protocol `protobuf:"varint,1,opt,name=protocol,proto3,enum=common.state.Meta_Protocol" json:"protocol,omitempty"`
	// What notion of time?
	// If the observer and network are synchronizing on a global clock
	// there won't be a need to distinguish between static and dynamic views.
	Timestamp string `protobuf:"bytes,2,opt,name=timestamp,proto3" json:"timestamp,omitempty"`
	// Notorization, SPV, ZKP, etc. Possibly enum
	ProofType string `protobuf:"bytes,3,opt,name=proof_type,json=proofType,proto3" json:"proof_type,omitempty"`
	// The data field's serialization format (e.g. JSON, XML, Protobuf)
	SerializationFormat string `protobuf:"bytes,4,opt,name=serialization_format,json=serializationFormat,proto3" json:"serialization_format,omitempty"`
}

func (x *Meta) Reset() {
	*x = Meta{}
	if protoimpl.UnsafeEnabled {
		mi := &file_common_state_proto_msgTypes[0]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *Meta) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*Meta) ProtoMessage() {}

func (x *Meta) ProtoReflect() protoreflect.Message {
	mi := &file_common_state_proto_msgTypes[0]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use Meta.ProtoReflect.Descriptor instead.
func (*Meta) Descriptor() ([]byte, []int) {
	return file_common_state_proto_rawDescGZIP(), []int{0}
}

func (x *Meta) GetProtocol() Meta_Protocol {
	if x != nil {
		return x.Protocol
	}
	return Meta_BITCOIN
}

func (x *Meta) GetTimestamp() string {
	if x != nil {
		return x.Timestamp
	}
	return ""
}

func (x *Meta) GetProofType() string {
	if x != nil {
		return x.ProofType
	}
	return ""
}

func (x *Meta) GetSerializationFormat() string {
	if x != nil {
		return x.SerializationFormat
	}
	return ""
}

type View struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	Meta *Meta `protobuf:"bytes,1,opt,name=meta,proto3" json:"meta,omitempty"`
	// Represents the data playload of this view.
	// The representation of Fabric, Corda etc will be captured elsewhere.
	// For some protocols, like Bitcoin, the structure of an SPV proof is well known.
	Data []byte `protobuf:"bytes,2,opt,name=data,proto3" json:"data,omitempty"`
}

func (x *View) Reset() {
	*x = View{}
	if protoimpl.UnsafeEnabled {
		mi := &file_common_state_proto_msgTypes[1]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *View) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*View) ProtoMessage() {}

func (x *View) ProtoReflect() protoreflect.Message {
	mi := &file_common_state_proto_msgTypes[1]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use View.ProtoReflect.Descriptor instead.
func (*View) Descriptor() ([]byte, []int) {
	return file_common_state_proto_rawDescGZIP(), []int{1}
}

func (x *View) GetMeta() *Meta {
	if x != nil {
		return x.Meta
	}
	return nil
}

func (x *View) GetData() []byte {
	if x != nil {
		return x.Data
	}
	return nil
}

// View represents the response from a remote network
type ViewPayload struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	RequestId string `protobuf:"bytes,1,opt,name=request_id,json=requestId,proto3" json:"request_id,omitempty"`
	// Types that are assignable to State:
	//
	//	*ViewPayload_View
	//	*ViewPayload_Error
	State isViewPayload_State `protobuf_oneof:"state"`
}

func (x *ViewPayload) Reset() {
	*x = ViewPayload{}
	if protoimpl.UnsafeEnabled {
		mi := &file_common_state_proto_msgTypes[2]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *ViewPayload) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*ViewPayload) ProtoMessage() {}

func (x *ViewPayload) ProtoReflect() protoreflect.Message {
	mi := &file_common_state_proto_msgTypes[2]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use ViewPayload.ProtoReflect.Descriptor instead.
func (*ViewPayload) Descriptor() ([]byte, []int) {
	return file_common_state_proto_rawDescGZIP(), []int{2}
}

func (x *ViewPayload) GetRequestId() string {
	if x != nil {
		return x.RequestId
	}
	return ""
}

func (m *ViewPayload) GetState() isViewPayload_State {
	if m != nil {
		return m.State
	}
	return nil
}

func (x *ViewPayload) GetView() *View {
	if x, ok := x.GetState().(*ViewPayload_View); ok {
		return x.View
	}
	return nil
}

func (x *ViewPayload) GetError() string {
	if x, ok := x.GetState().(*ViewPayload_Error); ok {
		return x.Error
	}
	return ""
}

type isViewPayload_State interface {
	isViewPayload_State()
}

type ViewPayload_View struct {
	View *View `protobuf:"bytes,2,opt,name=view,proto3,oneof"`
}

type ViewPayload_Error struct {
	Error string `protobuf:"bytes,3,opt,name=error,proto3,oneof"`
}

func (*ViewPayload_View) isViewPayload_State() {}

func (*ViewPayload_Error) isViewPayload_State() {}

// the payload that is used for the communication between the requesting relay
// and its network
type RequestState struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	RequestId string              `protobuf:"bytes,1,opt,name=request_id,json=requestId,proto3" json:"request_id,omitempty"`
	Status    RequestState_STATUS `protobuf:"varint,2,opt,name=status,proto3,enum=common.state.RequestState_STATUS" json:"status,omitempty"`
	// Types that are assignable to State:
	//
	//	*RequestState_View
	//	*RequestState_Error
	State isRequestState_State `protobuf_oneof:"state"`
}

func (x *RequestState) Reset() {
	*x = RequestState{}
	if protoimpl.UnsafeEnabled {
		mi := &file_common_state_proto_msgTypes[3]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *RequestState) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*RequestState) ProtoMessage() {}

func (x *RequestState) ProtoReflect() protoreflect.Message {
	mi := &file_common_state_proto_msgTypes[3]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use RequestState.ProtoReflect.Descriptor instead.
func (*RequestState) Descriptor() ([]byte, []int) {
	return file_common_state_proto_rawDescGZIP(), []int{3}
}

func (x *RequestState) GetRequestId() string {
	if x != nil {
		return x.RequestId
	}
	return ""
}

func (x *RequestState) GetStatus() RequestState_STATUS {
	if x != nil {
		return x.Status
	}
	return RequestState_PENDING_ACK
}

func (m *RequestState) GetState() isRequestState_State {
	if m != nil {
		return m.State
	}
	return nil
}

func (x *RequestState) GetView() *View {
	if x, ok := x.GetState().(*RequestState_View); ok {
		return x.View
	}
	return nil
}

func (x *RequestState) GetError() string {
	if x, ok := x.GetState().(*RequestState_Error); ok {
		return x.Error
	}
	return ""
}

type isRequestState_State interface {
	isRequestState_State()
}

type RequestState_View struct {
	View *View `protobuf:"bytes,3,opt,name=view,proto3,oneof"`
}

type RequestState_Error struct {
	Error string `protobuf:"bytes,4,opt,name=error,proto3,oneof"`
}

func (*RequestState_View) isRequestState_State() {}

func (*RequestState_Error) isRequestState_State() {}

var File_common_state_proto protoreflect.FileDescriptor

var file_common_state_proto_rawDesc = []byte{
	0x0a, 0x12, 0x63, 0x6f, 0x6d, 0x6d, 0x6f, 0x6e, 0x2f, 0x73, 0x74, 0x61, 0x74, 0x65, 0x2e, 0x70,
	0x72, 0x6f, 0x74, 0x6f, 0x12, 0x0c, 0x63, 0x6f, 0x6d, 0x6d, 0x6f, 0x6e, 0x2e, 0x73, 0x74, 0x61,
	0x74, 0x65, 0x22, 0xed, 0x01, 0x0a, 0x04, 0x4d, 0x65, 0x74, 0x61, 0x12, 0x37, 0x0a, 0x08, 0x70,
	0x72, 0x6f, 0x74, 0x6f, 0x63, 0x6f, 0x6c, 0x18, 0x01, 0x20, 0x01, 0x28, 0x0e, 0x32, 0x1b, 0x2e,
	0x63, 0x6f, 0x6d, 0x6d, 0x6f, 0x6e, 0x2e, 0x73, 0x74, 0x61, 0x74, 0x65, 0x2e, 0x4d, 0x65, 0x74,
	0x61, 0x2e, 0x50, 0x72, 0x6f, 0x74, 0x6f, 0x63, 0x6f, 0x6c, 0x52, 0x08, 0x70, 0x72, 0x6f, 0x74,
	0x6f, 0x63, 0x6f, 0x6c, 0x12, 0x1c, 0x0a, 0x09, 0x74, 0x69, 0x6d, 0x65, 0x73, 0x74, 0x61, 0x6d,
	0x70, 0x18, 0x02, 0x20, 0x01, 0x28, 0x09, 0x52, 0x09, 0x74, 0x69, 0x6d, 0x65, 0x73, 0x74, 0x61,
	0x6d, 0x70, 0x12, 0x1d, 0x0a, 0x0a, 0x70, 0x72, 0x6f, 0x6f, 0x66, 0x5f, 0x74, 0x79, 0x70, 0x65,
	0x18, 0x03, 0x20, 0x01, 0x28, 0x09, 0x52, 0x09, 0x70, 0x72, 0x6f, 0x6f, 0x66, 0x54, 0x79, 0x70,
	0x65, 0x12, 0x31, 0x0a, 0x14, 0x73, 0x65, 0x72, 0x69, 0x61, 0x6c, 0x69, 0x7a, 0x61, 0x74, 0x69,
	0x6f, 0x6e, 0x5f, 0x66, 0x6f, 0x72, 0x6d, 0x61, 0x74, 0x18, 0x04, 0x20, 0x01, 0x28, 0x09, 0x52,
	0x13, 0x73, 0x65, 0x72, 0x69, 0x61, 0x6c, 0x69, 0x7a, 0x61, 0x74, 0x69, 0x6f, 0x6e, 0x46, 0x6f,
	0x72, 0x6d, 0x61, 0x74, 0x22, 0x3c, 0x0a, 0x08, 0x50, 0x72, 0x6f, 0x74, 0x6f, 0x63, 0x6f, 0x6c,
	0x12, 0x0b, 0x0a, 0x07, 0x42, 0x49, 0x54, 0x43, 0x4f, 0x49, 0x4e, 0x10, 0x00, 0x12, 0x0c, 0x0a,
	0x08, 0x45, 0x54, 0x48, 0x45, 0x52, 0x45, 0x55, 0x4d, 0x10, 0x01, 0x12, 0x0a, 0x0a, 0x06, 0x46,
	0x41, 0x42, 0x52, 0x49, 0x43, 0x10, 0x03, 0x12, 0x09, 0x0a, 0x05, 0x43, 0x4f, 0x52, 0x44, 0x41,
	0x10, 0x04, 0x22, 0x42, 0x0a, 0x04, 0x56, 0x69, 0x65, 0x77, 0x12, 0x26, 0x0a, 0x04, 0x6d, 0x65,
	0x74, 0x61, 0x18, 0x01, 0x20, 0x01, 0x28, 0x0b, 0x32, 0x12, 0x2e, 0x63, 0x6f, 0x6d, 0x6d, 0x6f,
	0x6e, 0x2e, 0x73, 0x74, 0x61, 0x74, 0x65, 0x2e, 0x4d, 0x65, 0x74, 0x61, 0x52, 0x04, 0x6d, 0x65,
	0x74, 0x61, 0x12, 0x12, 0x0a, 0x04, 0x64, 0x61, 0x74, 0x61, 0x18, 0x02, 0x20, 0x01, 0x28, 0x0c,
	0x52, 0x04, 0x64, 0x61, 0x74, 0x61, 0x22, 0x77, 0x0a, 0x0b, 0x56, 0x69, 0x65, 0x77, 0x50, 0x61,
	0x79, 0x6c, 0x6f, 0x61, 0x64, 0x12, 0x1d, 0x0a, 0x0a, 0x72, 0x65, 0x71, 0x75, 0x65, 0x73, 0x74,
	0x5f, 0x69, 0x64, 0x18, 0x01, 0x20, 0x01, 0x28, 0x09, 0x52, 0x09, 0x72, 0x65, 0x71, 0x75, 0x65,
	0x73, 0x74, 0x49, 0x64, 0x12, 0x28, 0x0a, 0x04, 0x76, 0x69, 0x65, 0x77, 0x18, 0x02, 0x20, 0x01,
	0x28, 0x0b, 0x32, 0x12, 0x2e, 0x63, 0x6f, 0x6d, 0x6d, 0x6f, 0x6e, 0x2e, 0x73, 0x74, 0x61, 0x74,
	0x65, 0x2e, 0x56, 0x69, 0x65, 0x77, 0x48, 0x00, 0x52, 0x04, 0x76, 0x69, 0x65, 0x77, 0x12, 0x16,
	0x0a, 0x05, 0x65, 0x72, 0x72, 0x6f, 0x72, 0x18, 0x03, 0x20, 0x01, 0x28, 0x09, 0x48, 0x00, 0x52,
	0x05, 0x65, 0x72, 0x72, 0x6f, 0x72, 0x42, 0x07, 0x0a, 0x05, 0x73, 0x74, 0x61, 0x74, 0x65, 0x22,
	0xc1, 0x02, 0x0a, 0x0c, 0x52, 0x65, 0x71, 0x75, 0x65, 0x73, 0x74, 0x53, 0x74, 0x61, 0x74, 0x65,
	0x12, 0x1d, 0x0a, 0x0a, 0x72, 0x65, 0x71, 0x75, 0x65, 0x73, 0x74, 0x5f, 0x69, 0x64, 0x18, 0x01,
	0x20, 0x01, 0x28, 0x09, 0x52, 0x09, 0x72, 0x65, 0x71, 0x75, 0x65, 0x73, 0x74, 0x49, 0x64, 0x12,
	0x39, 0x0a, 0x06, 0x73, 0x74, 0x61, 0x74, 0x75, 0x73, 0x18, 0x02, 0x20, 0x01, 0x28, 0x0e, 0x32,
	0x21, 0x2e, 0x63, 0x6f, 0x6d, 0x6d, 0x6f, 0x6e, 0x2e, 0x73, 0x74, 0x61, 0x74, 0x65, 0x2e, 0x52,
	0x65, 0x71, 0x75, 0x65, 0x73, 0x74, 0x53, 0x74, 0x61, 0x74, 0x65, 0x2e, 0x53, 0x54, 0x41, 0x54,
	0x55, 0x53, 0x52, 0x06, 0x73, 0x74, 0x61, 0x74, 0x75, 0x73, 0x12, 0x28, 0x0a, 0x04, 0x76, 0x69,
	0x65, 0x77, 0x18, 0x03, 0x20, 0x01, 0x28, 0x0b, 0x32, 0x12, 0x2e, 0x63, 0x6f, 0x6d, 0x6d, 0x6f,
	0x6e, 0x2e, 0x73, 0x74, 0x61, 0x74, 0x65, 0x2e, 0x56, 0x69, 0x65, 0x77, 0x48, 0x00, 0x52, 0x04,
	0x76, 0x69, 0x65, 0x77, 0x12, 0x16, 0x0a, 0x05, 0x65, 0x72, 0x72, 0x6f, 0x72, 0x18, 0x04, 0x20,
	0x01, 0x28, 0x09, 0x48, 0x00, 0x52, 0x05, 0x65, 0x72, 0x72, 0x6f, 0x72, 0x22, 0x8b, 0x01, 0x0a,
	0x06, 0x53, 0x54, 0x41, 0x54, 0x55, 0x53, 0x12, 0x0f, 0x0a, 0x0b, 0x50, 0x45, 0x4e, 0x44, 0x49,
	0x4e, 0x47, 0x5f, 0x41, 0x43, 0x4b, 0x10, 0x00, 0x12, 0x0b, 0x0a, 0x07, 0x50, 0x45, 0x4e, 0x44,
	0x49, 0x4e, 0x47, 0x10, 0x01, 0x12, 0x09, 0x0a, 0x05, 0x45, 0x52, 0x52, 0x4f, 0x52, 0x10, 0x02,
	0x12, 0x0d, 0x0a, 0x09, 0x43, 0x4f, 0x4d, 0x50, 0x4c, 0x45, 0x54, 0x45, 0x44, 0x10, 0x03, 0x12,
	0x12, 0x0a, 0x0e, 0x45, 0x56, 0x45, 0x4e, 0x54, 0x5f, 0x52, 0x45, 0x43, 0x45, 0x49, 0x56, 0x45,
	0x44, 0x10, 0x04, 0x12, 0x11, 0x0a, 0x0d, 0x45, 0x56, 0x45, 0x4e, 0x54, 0x5f, 0x57, 0x52, 0x49,
	0x54, 0x54, 0x45, 0x4e, 0x10, 0x05, 0x12, 0x15, 0x0a, 0x11, 0x45, 0x56, 0x45, 0x4e, 0x54, 0x5f,
	0x57, 0x52, 0x49, 0x54, 0x45, 0x5f, 0x45, 0x52, 0x52, 0x4f, 0x52, 0x10, 0x06, 0x12, 0x0b, 0x0a,
	0x07, 0x44, 0x45, 0x4c, 0x45, 0x54, 0x45, 0x44, 0x10, 0x07, 0x42, 0x07, 0x0a, 0x05, 0x73, 0x74,
	0x61, 0x74, 0x65, 0x42, 0x78, 0x0a, 0x30, 0x6f, 0x72, 0x67, 0x2e, 0x68, 0x79, 0x70, 0x65, 0x72,
	0x6c, 0x65, 0x64, 0x67, 0x65, 0x72, 0x2e, 0x63, 0x61, 0x63, 0x74, 0x69, 0x2e, 0x77, 0x65, 0x61,
	0x76, 0x65, 0x72, 0x2e, 0x70, 0x72, 0x6f, 0x74, 0x6f, 0x73, 0x2e, 0x63, 0x6f, 0x6d, 0x6d, 0x6f,
	0x6e, 0x2e, 0x73, 0x74, 0x61, 0x74, 0x65, 0x5a, 0x44, 0x67, 0x69, 0x74, 0x68, 0x75, 0x62, 0x2e,
	0x63, 0x6f, 0x6d, 0x2f, 0x68, 0x79, 0x70, 0x65, 0x72, 0x6c, 0x65, 0x64, 0x67, 0x65, 0x72, 0x2d,
	0x63, 0x61, 0x63, 0x74, 0x69, 0x2f, 0x63, 0x61, 0x63, 0x74, 0x69, 0x2f, 0x77, 0x65, 0x61, 0x76,
	0x65, 0x72, 0x2f, 0x63, 0x6f, 0x6d, 0x6d, 0x6f, 0x6e, 0x2f, 0x70, 0x72, 0x6f, 0x74, 0x6f, 0x73,
	0x2d, 0x67, 0x6f, 0x2f, 0x76, 0x32, 0x2f, 0x63, 0x6f, 0x6d, 0x6d, 0x6f, 0x6e, 0x62, 0x06, 0x70,
	0x72, 0x6f, 0x74, 0x6f, 0x33,
}

var (
	file_common_state_proto_rawDescOnce sync.Once
	file_common_state_proto_rawDescData = file_common_state_proto_rawDesc
)

func file_common_state_proto_rawDescGZIP() []byte {
	file_common_state_proto_rawDescOnce.Do(func() {
		file_common_state_proto_rawDescData = protoimpl.X.CompressGZIP(file_common_state_proto_rawDescData)
	})
	return file_common_state_proto_rawDescData
}

var file_common_state_proto_enumTypes = make([]protoimpl.EnumInfo, 2)
var file_common_state_proto_msgTypes = make([]protoimpl.MessageInfo, 4)
var file_common_state_proto_goTypes = []interface{}{
	(Meta_Protocol)(0),       // 0: common.state.Meta.Protocol
	(RequestState_STATUS)(0), // 1: common.state.RequestState.STATUS
	(*Meta)(nil),             // 2: common.state.Meta
	(*View)(nil),             // 3: common.state.View
	(*ViewPayload)(nil),      // 4: common.state.ViewPayload
	(*RequestState)(nil),     // 5: common.state.RequestState
}
var file_common_state_proto_depIdxs = []int32{
	0, // 0: common.state.Meta.protocol:type_name -> common.state.Meta.Protocol
	2, // 1: common.state.View.meta:type_name -> common.state.Meta
	3, // 2: common.state.ViewPayload.view:type_name -> common.state.View
	1, // 3: common.state.RequestState.status:type_name -> common.state.RequestState.STATUS
	3, // 4: common.state.RequestState.view:type_name -> common.state.View
	5, // [5:5] is the sub-list for method output_type
	5, // [5:5] is the sub-list for method input_type
	5, // [5:5] is the sub-list for extension type_name
	5, // [5:5] is the sub-list for extension extendee
	0, // [0:5] is the sub-list for field type_name
}

func init() { file_common_state_proto_init() }
func file_common_state_proto_init() {
	if File_common_state_proto != nil {
		return
	}
	if !protoimpl.UnsafeEnabled {
		file_common_state_proto_msgTypes[0].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*Meta); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
		file_common_state_proto_msgTypes[1].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*View); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
		file_common_state_proto_msgTypes[2].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*ViewPayload); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
		file_common_state_proto_msgTypes[3].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*RequestState); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
	}
	file_common_state_proto_msgTypes[2].OneofWrappers = []interface{}{
		(*ViewPayload_View)(nil),
		(*ViewPayload_Error)(nil),
	}
	file_common_state_proto_msgTypes[3].OneofWrappers = []interface{}{
		(*RequestState_View)(nil),
		(*RequestState_Error)(nil),
	}
	type x struct{}
	out := protoimpl.TypeBuilder{
		File: protoimpl.DescBuilder{
			GoPackagePath: reflect.TypeOf(x{}).PkgPath(),
			RawDescriptor: file_common_state_proto_rawDesc,
			NumEnums:      2,
			NumMessages:   4,
			NumExtensions: 0,
			NumServices:   0,
		},
		GoTypes:           file_common_state_proto_goTypes,
		DependencyIndexes: file_common_state_proto_depIdxs,
		EnumInfos:         file_common_state_proto_enumTypes,
		MessageInfos:      file_common_state_proto_msgTypes,
	}.Build()
	File_common_state_proto = out.File
	file_common_state_proto_rawDesc = nil
	file_common_state_proto_goTypes = nil
	file_common_state_proto_depIdxs = nil
}
