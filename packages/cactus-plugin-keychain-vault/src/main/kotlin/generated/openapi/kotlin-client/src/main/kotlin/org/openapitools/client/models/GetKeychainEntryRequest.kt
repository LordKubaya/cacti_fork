/**
 * Hyperledger Cactus - Keychain API
 *
 * Contains/describes the Keychain API types/paths for Hyperledger Cactus.
 *
 * The version of the OpenAPI document: 0.3.0
 * 
 *
 * Please note:
 * This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * Do not edit this file manually.
 */

@file:Suppress(
    "ArrayInDataClass",
    "EnumEntryName",
    "RemoveRedundantQualifierName",
    "UnusedImport"
)

package org.openapitools.client.models


import com.squareup.moshi.Json

/**
 * 
 *
 * @param key The key for the entry to get from the keychain.
 */

data class GetKeychainEntryRequest (

    /* The key for the entry to get from the keychain. */
    @Json(name = "key")
    val key: kotlin.String

)
