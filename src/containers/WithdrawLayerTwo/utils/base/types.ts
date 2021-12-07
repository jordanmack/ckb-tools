import { Hash, HexString } from "@lay2/pw-core";

type HexNumber = HexString;

export interface RawL2Transaction {
  from_id: HexNumber;
  to_id: HexNumber;
  nonce: HexNumber;
  args: HexString;
}

export interface Fee {
  sudt_id: HexNumber;
  amount: HexNumber;
}

export interface RawWithdrawalRequest {
  nonce: HexNumber;
  // CKB amount
  capacity: HexNumber;
  // SUDT amount
  amount: HexNumber;
  sudt_script_hash: Hash;
  // layer2 account_script_hash
  account_script_hash: Hash;
  // buyer can pay sell_amount and sell_capacity to unlock
  sell_amount: HexNumber;
  sell_capacity: HexNumber;
  // layer1 lock to withdraw after challenge period
  owner_lock_hash: Hash;
  // layer1 lock to receive the payment, must exists on the chain
  payment_lock_hash: Hash;
  fee: Fee;
}

export interface WithdrawalRequest {
  raw: RawWithdrawalRequest;
  signature: HexString;
}

export interface WithdrawalLockArgs {
  // layer2 account script hash
  account_script_hash: Hash;
  // the original custodian lock hash
  withdrawal_block_hash: Hash;
  withdrawal_block_number: HexNumber;
  // buyer can pay sell_amount token to unlock
  sudt_script_hash: Hash;
  sell_amount: HexNumber;
  sell_capacity: HexNumber;
  // layer1 lock to withdraw after challenge period
  owner_lock_hash: Hash;
  // layer1 lock to receive the payment, must exists on the chain
  payment_lock_hash: Hash;
}

export interface UnlockWithdrawalViaFinalize {}