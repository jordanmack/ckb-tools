import { Hash, HexNumber, HexString, Script, utils } from "@ckb-lumos/base";
import {
  RawL2Transaction,
  normalizers,
  RawWithdrawalRequest,
  WithdrawalRequest,
  Fee,
} from "../base";
import { Reader } from "ckb-js-toolkit";
import keccak256 from "keccak256";
import { withdrawal } from "../utils";
import { normalizer } from "@polyjuice-provider/godwoken";
import { Godwoker, serializeRawL2Transaction } from "@polyjuice-provider/base";
import { SerializeRawWithdrawalRequest } from "@polyjuice-provider/godwoken/schemas";

const { NormalizeRawL2Transaction } = normalizer;

export function generateTransactionMessage(
  rawL2Transaction: RawL2Transaction,
  senderScriptHash: Hash,
  receiverScriptHash: Hash,
  rollupTypeHash: Hash
): HexString {
  const rawTxHex = new Reader(
    serializeRawL2Transaction(NormalizeRawL2Transaction(rawL2Transaction))
  ).serializeJson();

  const data =
    rollupTypeHash +
    senderScriptHash.slice(2) +
    receiverScriptHash.slice(2) +
    rawTxHex.slice(2);
  const message = new utils.CKBHasher().update(data).digestHex();

  const prefix = Buffer.from(`\x19Ethereum Signed Message:\n32`);
  const buf = Buffer.concat([prefix, Buffer.from(message.slice(2), "hex")]);
  return `0x${keccak256(buf).toString("hex")}`;
}

export async function signMessageEthereum(message: Hash, address: string): Promise<HexString> {
  const result = await (window.ethereum as any).request({ method: 'eth_sign',
    params: [address, message]
  })

  let v = Number.parseInt(result.slice(-2), 16);
  
  if (v >= 27)
    v -= 27;

  return `0x${result.slice(2, -2)}${v.toString(16).padStart(2, '0')}`;
}

export async function generateWithdrawalRequest(
  godwokenClient: Godwoker,
  ethereumAddress: string,
  {
    fromId,
    capacity,
    amount,
    ownerLockHash,
    fee,
    sellCapacity = "0x0",
    sellAmount = "0x0",
    paymentLockHash = "0x" + "00".repeat(32),
    sudtScriptHash = "0x" + "00".repeat(32),
  }: {
    fromId: HexNumber;
    capacity: HexNumber;
    amount: HexNumber;
    ownerLockHash: Hash;
    fee: Fee;
    sellCapacity?: HexNumber;
    sellAmount?: HexNumber;
    paymentLockHash?: Hash;
    sudtScriptHash?: Hash;
  },
  {
    config = {},
  }: {
    config?: any;
  } = {}
) {
  const ckbSudtScriptHash =
    "0x0000000000000000000000000000000000000000000000000000000000000000";

  if (config == null) {
    config = {};
  }

  const isSudt = sudtScriptHash !== ckbSudtScriptHash;
  let minCapacity = withdrawal.minimalWithdrawalCapacity(isSudt);
  if (BigInt(capacity) < BigInt(minCapacity)) {
    throw new Error(
      `Withdrawal required ${BigInt(
        minCapacity
      )} shannons at least, provided ${BigInt(capacity)}.`
    );
  }

  const script: Script = {
    code_hash: config.polyjuice.ethAccountLockCodeHash,
    hash_type: "type",
    args: config.rollupTypeHash + ethereumAddress.slice(2),
  };
  const accountScriptHash = utils.computeScriptHash(script);

  const nonce: HexNumber = await godwokenClient.getNonce(Number(fromId));

  const rawWithdrawalRequest: RawWithdrawalRequest = {
    nonce,
    capacity,
    amount,
    sudt_script_hash: sudtScriptHash,
    account_script_hash: accountScriptHash,
    sell_amount: sellAmount,
    sell_capacity: sellCapacity,
    owner_lock_hash: ownerLockHash,
    payment_lock_hash: paymentLockHash,
    fee,
  };

  const message = generateWithdrawalMessage(
    rawWithdrawalRequest,
    config.rollupTypeHash
  );

  const signature: HexString = await signMessageEthereum(message, ethereumAddress);

  const withdrawalRequest: WithdrawalRequest = {
    raw: rawWithdrawalRequest,
    signature: signature,
  };

  return withdrawalRequest;
}

export function generateWithdrawalMessage(
  raw_request: RawWithdrawalRequest,
  rollupTypeHash: Hash
): HexString {
  const raw_request_data = new Reader(
    SerializeRawWithdrawalRequest(
      normalizers.NormalizeRawWithdrawalRequest(raw_request)
    )
  ).serializeJson();
  const hexData = rollupTypeHash + raw_request_data.slice(2);
  const message = new utils.CKBHasher().update(hexData).digestHex();

  const prefix = Buffer.from(`\x19Ethereum Signed Message:\n32`);
  const buf = Buffer.concat([prefix, Buffer.from(message.slice(2), "hex")]);
  return `0x${keccak256(buf).toString("hex")}`;
}