import { Reader } from "ckb-js-toolkit";
import {
  RawWithdrawalRequest,
  WithdrawalLockArgs,
  Fee,
  WithdrawalRequest,
  UnlockWithdrawalViaFinalize,
} from "./types";

// Taken for now from https://github.com/xxuejie/ckb-js-toolkit/blob/68f5ff709f78eb188ee116b2887a362123b016cc/src/normalizers.js#L17-L69,
// later we can think about exposing those functions directly.
function normalizeHexNumber(length: number) {
  return function (debugPath: string, value: any) {
    if (!(value instanceof ArrayBuffer)) {
      let intValue = BigInt(value).toString(16);
      if (intValue.length % 2 !== 0) {
        intValue = "0" + intValue;
      }
      if (intValue.length / 2 > length) {
        throw new Error(
          `${debugPath} is ${
            intValue.length / 2
          } bytes long, expected length is ${length}!`
        );
      }
      const view = new DataView(new ArrayBuffer(length));
      for (let i = 0; i < intValue.length / 2; i++) {
        const start = intValue.length - (i + 1) * 2;
        view.setUint8(i, parseInt(intValue.substr(start, 2), 16));
      }
      value = view.buffer;
    }
    if (value.byteLength < length) {
      const array = new Uint8Array(length);
      array.set(new Uint8Array(value), 0);
      value = array.buffer;
    }
    return value;
  };
}

function normalizeRawData(length: number) {
  return function (debugPath: string, value: any) {
    value = new Reader(value).toArrayBuffer();
    if (length > 0 && value.byteLength !== length) {
      throw new Error(
        `${debugPath} has invalid length ${value.byteLength}, required: ${length}`
      );
    }
    return value;
  };
}

function normalizeObject(debugPath: string, obj: any, keys: object) {
  const result: any = {};

  for (const [key, f] of Object.entries(keys)) {
    const value = obj[key];
    if (value === undefined || value === null) {
      throw new Error(`${debugPath} is missing ${key}!`);
    }
    result[key] = f(`${debugPath}.${key}`, value);
  }
  return result;
}

function toNormalize(normalize: Function) {
  return function (debugPath: string, value: any) {
    return normalize(value, {
      debugPath,
    });
  };
}

export function NormalizeRawWithdrawalRequest(
  raw_request: RawWithdrawalRequest,
  { debugPath = "raw_withdrawal_request" } = {}
) {
  return normalizeObject(debugPath, raw_request, {
    nonce: normalizeHexNumber(4),
    capacity: normalizeHexNumber(8),
    amount: normalizeHexNumber(16),
    sudt_script_hash: normalizeRawData(32),
    account_script_hash: normalizeRawData(32),
    sell_amount: normalizeHexNumber(16),
    sell_capacity: normalizeHexNumber(8),
    owner_lock_hash: normalizeRawData(32),
    payment_lock_hash: normalizeRawData(32),
    fee: toNormalize(NormalizeFee),
  });
}

export function NormalizeWithdrawalRequest(
  request: WithdrawalRequest,
  { debugPath = "withdrawal_request" } = {}
) {
  return normalizeObject(debugPath, request, {
    raw: toNormalize(NormalizeRawWithdrawalRequest),
    signature: normalizeRawData(65),
  });
}

export function NormalizeFee(fee: Fee, { debugPath = "fee" } = {}) {
  return normalizeObject(debugPath, fee, {
    sudt_id: normalizeHexNumber(4),
    amount: normalizeHexNumber(16),
  });
}

export function NormalizeWithdrawalLockArgs(
  withdrawal_lock_args: WithdrawalLockArgs,
  { debugPath = "withdrawal_lock_args" } = {}
) {
  return normalizeObject(debugPath, withdrawal_lock_args, {
    account_script_hash: normalizeRawData(32),
    withdrawal_block_hash: normalizeRawData(32),
    withdrawal_block_number: normalizeHexNumber(8),
    sudt_script_hash: normalizeRawData(32),
    sell_amount: normalizeHexNumber(16),
    sell_capacity: normalizeHexNumber(8),
    owner_lock_hash: normalizeRawData(32),
    payment_lock_hash: normalizeRawData(32),
  });
}

export function NormalizeUnlockWithdrawalViaFinalize(
  unlock_withdrawal_finalize: UnlockWithdrawalViaFinalize,
  { debugPath = "unlock_withdrawal_finalize" } = {}
) {
  return normalizeObject(debugPath, unlock_withdrawal_finalize, {});
}