// @generated by protoc-gen-es v2.2.2 with parameter "target=ts"
// @generated from file cacti/satp/v02/service/crash_recovery.proto (package cacti.satp.v02.service, syntax proto3)
/* eslint-disable */

import type { GenFile, GenMessage, GenService } from "@bufbuild/protobuf/codegenv1";
import { fileDesc, messageDesc, serviceDesc } from "@bufbuild/protobuf/codegenv1";
import type { Message } from "@bufbuild/protobuf";

/**
 * Describes the file cacti/satp/v02/service/crash_recovery.proto.
 */
export const file_cacti_satp_v02_service_crash_recovery: GenFile = /*@__PURE__*/
  fileDesc("CitjYWN0aS9zYXRwL3YwMi9zZXJ2aWNlL2NyYXNoX3JlY292ZXJ5LnByb3RvEhZjYWN0aS5zYXRwLnYwMi5zZXJ2aWNlItMBCg5SZWNvdmVyUmVxdWVzdBISCgpzZXNzaW9uX2lkGAEgASgJEhQKDG1lc3NhZ2VfdHlwZRgCIAEoCRISCgpzYXRwX3BoYXNlGAMgASgJEhcKD3NlcXVlbmNlX251bWJlchgEIAEoBRIRCglpc19iYWNrdXAYBSABKAgSHwoXbmV3X2lkZW50aXR5X3B1YmxpY19rZXkYBiABKAkSHAoUbGFzdF9lbnRyeV90aW1lc3RhbXAYByABKAMSGAoQY2xpZW50X3NpZ25hdHVyZRgIIAEoCSK0AQoPUmVjb3ZlclJlc3BvbnNlEhIKCnNlc3Npb25faWQYASABKAkSFAoMbWVzc2FnZV90eXBlGAIgASgJEhwKFGhhc2hfcmVjb3Zlcl9tZXNzYWdlGAMgASgJEj8KDnJlY292ZXJlZF9sb2dzGAQgAygLMicuY2FjdGkuc2F0cC52MDIuc2VydmljZS5QZXJzaXN0TG9nRW50cnkSGAoQc2VydmVyX3NpZ25hdHVyZRgFIAEoCSKqAQoVUmVjb3ZlclN1Y2Nlc3NSZXF1ZXN0EhIKCnNlc3Npb25faWQYASABKAkSFAoMbWVzc2FnZV90eXBlGAIgASgJEiMKG2hhc2hfcmVjb3Zlcl91cGRhdGVfbWVzc2FnZRgDIAEoCRIPCgdzdWNjZXNzGAQgASgIEhcKD2VudHJpZXNfY2hhbmdlZBgFIAMoCRIYChBjbGllbnRfc2lnbmF0dXJlGAYgASgJIlgKFlJlY292ZXJTdWNjZXNzUmVzcG9uc2USEgoKc2Vzc2lvbl9pZBgBIAEoCRIQCghyZWNlaXZlZBgCIAEoCBIYChBzZXJ2ZXJfc2lnbmF0dXJlGAMgASgJIpEBCg9Sb2xsYmFja1JlcXVlc3QSEgoKc2Vzc2lvbl9pZBgBIAEoCRIUCgxtZXNzYWdlX3R5cGUYAiABKAkSDwoHc3VjY2VzcxgDIAEoCBIZChFhY3Rpb25zX3BlcmZvcm1lZBgEIAMoCRIOCgZwcm9vZnMYBSADKAkSGAoQY2xpZW50X3NpZ25hdHVyZRgGIAEoCSKSAQoQUm9sbGJhY2tSZXNwb25zZRISCgpzZXNzaW9uX2lkGAEgASgJEhQKDG1lc3NhZ2VfdHlwZRgCIAEoCRIPCgdzdWNjZXNzGAMgASgIEhkKEWFjdGlvbnNfcGVyZm9ybWVkGAQgAygJEg4KBnByb29mcxgFIAMoCRIYChBzZXJ2ZXJfc2lnbmF0dXJlGAYgASgJIo0BCg9QZXJzaXN0TG9nRW50cnkSEgoKc2Vzc2lvbl9pZBgBIAEoCRIMCgR0eXBlGAIgASgJEgsKA2tleRgDIAEoCRIRCglvcGVyYXRpb24YBCABKAkSEQoJdGltZXN0YW1wGAUgASgJEgwKBGRhdGEYBiABKAkSFwoPc2VxdWVuY2VfbnVtYmVyGAcgASgFInkKEFJvbGxiYWNrTG9nRW50cnkSEgoKc2Vzc2lvbl9pZBgBIAEoCRINCgVzdGFnZRgCIAEoCRIRCgl0aW1lc3RhbXAYAyABKAkSDgoGYWN0aW9uGAQgASgJEg4KBnN0YXR1cxgFIAEoCRIPCgdkZXRhaWxzGAYgASgJIqMBCg1Sb2xsYmFja1N0YXRlEhIKCnNlc3Npb25faWQYASABKAkSFQoNY3VycmVudF9zdGFnZRgCIAEoCRJGChRyb2xsYmFja19sb2dfZW50cmllcxgDIAMoCzIoLmNhY3RpLnNhdHAudjAyLnNlcnZpY2UuUm9sbGJhY2tMb2dFbnRyeRIOCgZzdGF0dXMYBCABKAkSDwoHZGV0YWlscxgFIAEoCTLCAgoUQ3Jhc2hSZWNvdmVyeVNlcnZpY2USWgoHUmVjb3ZlchImLmNhY3RpLnNhdHAudjAyLnNlcnZpY2UuUmVjb3ZlclJlcXVlc3QaJy5jYWN0aS5zYXRwLnYwMi5zZXJ2aWNlLlJlY292ZXJSZXNwb25zZRJvCg5SZWNvdmVyU3VjY2VzcxItLmNhY3RpLnNhdHAudjAyLnNlcnZpY2UuUmVjb3ZlclN1Y2Nlc3NSZXF1ZXN0Gi4uY2FjdGkuc2F0cC52MDIuc2VydmljZS5SZWNvdmVyU3VjY2Vzc1Jlc3BvbnNlEl0KCFJvbGxiYWNrEicuY2FjdGkuc2F0cC52MDIuc2VydmljZS5Sb2xsYmFja1JlcXVlc3QaKC5jYWN0aS5zYXRwLnYwMi5zZXJ2aWNlLlJvbGxiYWNrUmVzcG9uc2ViBnByb3RvMw");

/**
 * @generated from message cacti.satp.v02.service.RecoverRequest
 */
export type RecoverRequest = Message<"cacti.satp.v02.service.RecoverRequest"> & {
  /**
   * @generated from field: string session_id = 1;
   */
  sessionId: string;

  /**
   * @generated from field: string message_type = 2;
   */
  messageType: string;

  /**
   * @generated from field: string satp_phase = 3;
   */
  satpPhase: string;

  /**
   * @generated from field: int32 sequence_number = 4;
   */
  sequenceNumber: number;

  /**
   * @generated from field: bool is_backup = 5;
   */
  isBackup: boolean;

  /**
   * @generated from field: string new_identity_public_key = 6;
   */
  newIdentityPublicKey: string;

  /**
   * @generated from field: int64 last_entry_timestamp = 7;
   */
  lastEntryTimestamp: bigint;

  /**
   * @generated from field: string client_signature = 8;
   */
  clientSignature: string;
};

/**
 * Describes the message cacti.satp.v02.service.RecoverRequest.
 * Use `create(RecoverRequestSchema)` to create a new message.
 */
export const RecoverRequestSchema: GenMessage<RecoverRequest> = /*@__PURE__*/
  messageDesc(file_cacti_satp_v02_service_crash_recovery, 0);

/**
 * @generated from message cacti.satp.v02.service.RecoverResponse
 */
export type RecoverResponse = Message<"cacti.satp.v02.service.RecoverResponse"> & {
  /**
   * @generated from field: string session_id = 1;
   */
  sessionId: string;

  /**
   * @generated from field: string message_type = 2;
   */
  messageType: string;

  /**
   * @generated from field: string hash_recover_message = 3;
   */
  hashRecoverMessage: string;

  /**
   * @generated from field: repeated cacti.satp.v02.service.PersistLogEntry recovered_logs = 4;
   */
  recoveredLogs: PersistLogEntry[];

  /**
   * @generated from field: string server_signature = 5;
   */
  serverSignature: string;
};

/**
 * Describes the message cacti.satp.v02.service.RecoverResponse.
 * Use `create(RecoverResponseSchema)` to create a new message.
 */
export const RecoverResponseSchema: GenMessage<RecoverResponse> = /*@__PURE__*/
  messageDesc(file_cacti_satp_v02_service_crash_recovery, 1);

/**
 * @generated from message cacti.satp.v02.service.RecoverSuccessRequest
 */
export type RecoverSuccessRequest = Message<"cacti.satp.v02.service.RecoverSuccessRequest"> & {
  /**
   * @generated from field: string session_id = 1;
   */
  sessionId: string;

  /**
   * @generated from field: string message_type = 2;
   */
  messageType: string;

  /**
   * @generated from field: string hash_recover_update_message = 3;
   */
  hashRecoverUpdateMessage: string;

  /**
   * @generated from field: bool success = 4;
   */
  success: boolean;

  /**
   * @generated from field: repeated string entries_changed = 5;
   */
  entriesChanged: string[];

  /**
   * @generated from field: string client_signature = 6;
   */
  clientSignature: string;
};

/**
 * Describes the message cacti.satp.v02.service.RecoverSuccessRequest.
 * Use `create(RecoverSuccessRequestSchema)` to create a new message.
 */
export const RecoverSuccessRequestSchema: GenMessage<RecoverSuccessRequest> = /*@__PURE__*/
  messageDesc(file_cacti_satp_v02_service_crash_recovery, 2);

/**
 * @generated from message cacti.satp.v02.service.RecoverSuccessResponse
 */
export type RecoverSuccessResponse = Message<"cacti.satp.v02.service.RecoverSuccessResponse"> & {
  /**
   * @generated from field: string session_id = 1;
   */
  sessionId: string;

  /**
   * @generated from field: bool received = 2;
   */
  received: boolean;

  /**
   * @generated from field: string server_signature = 3;
   */
  serverSignature: string;
};

/**
 * Describes the message cacti.satp.v02.service.RecoverSuccessResponse.
 * Use `create(RecoverSuccessResponseSchema)` to create a new message.
 */
export const RecoverSuccessResponseSchema: GenMessage<RecoverSuccessResponse> = /*@__PURE__*/
  messageDesc(file_cacti_satp_v02_service_crash_recovery, 3);

/**
 * @generated from message cacti.satp.v02.service.RollbackRequest
 */
export type RollbackRequest = Message<"cacti.satp.v02.service.RollbackRequest"> & {
  /**
   * @generated from field: string session_id = 1;
   */
  sessionId: string;

  /**
   * @generated from field: string message_type = 2;
   */
  messageType: string;

  /**
   * @generated from field: bool success = 3;
   */
  success: boolean;

  /**
   * @generated from field: repeated string actions_performed = 4;
   */
  actionsPerformed: string[];

  /**
   * @generated from field: repeated string proofs = 5;
   */
  proofs: string[];

  /**
   * @generated from field: string client_signature = 6;
   */
  clientSignature: string;
};

/**
 * Describes the message cacti.satp.v02.service.RollbackRequest.
 * Use `create(RollbackRequestSchema)` to create a new message.
 */
export const RollbackRequestSchema: GenMessage<RollbackRequest> = /*@__PURE__*/
  messageDesc(file_cacti_satp_v02_service_crash_recovery, 4);

/**
 * @generated from message cacti.satp.v02.service.RollbackResponse
 */
export type RollbackResponse = Message<"cacti.satp.v02.service.RollbackResponse"> & {
  /**
   * @generated from field: string session_id = 1;
   */
  sessionId: string;

  /**
   * @generated from field: string message_type = 2;
   */
  messageType: string;

  /**
   * @generated from field: bool success = 3;
   */
  success: boolean;

  /**
   * @generated from field: repeated string actions_performed = 4;
   */
  actionsPerformed: string[];

  /**
   * @generated from field: repeated string proofs = 5;
   */
  proofs: string[];

  /**
   * @generated from field: string server_signature = 6;
   */
  serverSignature: string;
};

/**
 * Describes the message cacti.satp.v02.service.RollbackResponse.
 * Use `create(RollbackResponseSchema)` to create a new message.
 */
export const RollbackResponseSchema: GenMessage<RollbackResponse> = /*@__PURE__*/
  messageDesc(file_cacti_satp_v02_service_crash_recovery, 5);

/**
 * @generated from message cacti.satp.v02.service.PersistLogEntry
 */
export type PersistLogEntry = Message<"cacti.satp.v02.service.PersistLogEntry"> & {
  /**
   * @generated from field: string session_id = 1;
   */
  sessionId: string;

  /**
   * @generated from field: string type = 2;
   */
  type: string;

  /**
   * @generated from field: string key = 3;
   */
  key: string;

  /**
   * @generated from field: string operation = 4;
   */
  operation: string;

  /**
   * @generated from field: string timestamp = 5;
   */
  timestamp: string;

  /**
   * @generated from field: string data = 6;
   */
  data: string;

  /**
   * @generated from field: int32 sequence_number = 7;
   */
  sequenceNumber: number;
};

/**
 * Describes the message cacti.satp.v02.service.PersistLogEntry.
 * Use `create(PersistLogEntrySchema)` to create a new message.
 */
export const PersistLogEntrySchema: GenMessage<PersistLogEntry> = /*@__PURE__*/
  messageDesc(file_cacti_satp_v02_service_crash_recovery, 6);

/**
 * @generated from message cacti.satp.v02.service.RollbackLogEntry
 */
export type RollbackLogEntry = Message<"cacti.satp.v02.service.RollbackLogEntry"> & {
  /**
   * @generated from field: string session_id = 1;
   */
  sessionId: string;

  /**
   * @generated from field: string stage = 2;
   */
  stage: string;

  /**
   * @generated from field: string timestamp = 3;
   */
  timestamp: string;

  /**
   * action performed during rollback
   *
   * @generated from field: string action = 4;
   */
  action: string;

  /**
   * @generated from field: string status = 5;
   */
  status: string;

  /**
   * @generated from field: string details = 6;
   */
  details: string;
};

/**
 * Describes the message cacti.satp.v02.service.RollbackLogEntry.
 * Use `create(RollbackLogEntrySchema)` to create a new message.
 */
export const RollbackLogEntrySchema: GenMessage<RollbackLogEntry> = /*@__PURE__*/
  messageDesc(file_cacti_satp_v02_service_crash_recovery, 7);

/**
 * @generated from message cacti.satp.v02.service.RollbackState
 */
export type RollbackState = Message<"cacti.satp.v02.service.RollbackState"> & {
  /**
   * @generated from field: string session_id = 1;
   */
  sessionId: string;

  /**
   * @generated from field: string current_stage = 2;
   */
  currentStage: string;

  /**
   * @generated from field: repeated cacti.satp.v02.service.RollbackLogEntry rollback_log_entries = 3;
   */
  rollbackLogEntries: RollbackLogEntry[];

  /**
   * Overall status (e.g., IN_PROGRESS, COMPLETED, FAILED)
   *
   * @generated from field: string status = 4;
   */
  status: string;

  /**
   * @generated from field: string details = 5;
   */
  details: string;
};

/**
 * Describes the message cacti.satp.v02.service.RollbackState.
 * Use `create(RollbackStateSchema)` to create a new message.
 */
export const RollbackStateSchema: GenMessage<RollbackState> = /*@__PURE__*/
  messageDesc(file_cacti_satp_v02_service_crash_recovery, 8);

/**
 * @generated from service cacti.satp.v02.service.CrashRecoveryService
 */
export const CrashRecoveryService: GenService<{
  /**
   * @generated from rpc cacti.satp.v02.service.CrashRecoveryService.Recover
   */
  recover: {
    methodKind: "unary";
    input: typeof RecoverRequestSchema;
    output: typeof RecoverResponseSchema;
  },
  /**
   * @generated from rpc cacti.satp.v02.service.CrashRecoveryService.RecoverSuccess
   */
  recoverSuccess: {
    methodKind: "unary";
    input: typeof RecoverSuccessRequestSchema;
    output: typeof RecoverSuccessResponseSchema;
  },
  /**
   * @generated from rpc cacti.satp.v02.service.CrashRecoveryService.Rollback
   */
  rollback: {
    methodKind: "unary";
    input: typeof RollbackRequestSchema;
    output: typeof RollbackResponseSchema;
  },
}> = /*@__PURE__*/
  serviceDesc(file_cacti_satp_v02_service_crash_recovery, 0);

