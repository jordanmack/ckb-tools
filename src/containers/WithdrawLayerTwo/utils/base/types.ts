import { Hash, HexString, HexNumber, Script } from "@ckb-lumos/base";

export interface RawL2Transaction {
  from_id: HexNumber;
  to_id: HexNumber;
  nonce: HexNumber;
  args: HexString;
}

export interface L2Transaction {
  raw: RawL2Transaction;
  signature: HexString;
}

export interface CreateAccount {
  script: Script;
  fee: Fee;
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

export interface SudtQuery {
  short_address: HexString;
}

export interface SudtTransfer {
  to: HexString;
  amount: HexNumber;
  fee: HexNumber;
}

export interface DepositRequest {
  capacity: HexNumber;
  amount: HexNumber;
  sudt_script_hash: Hash;
  script: Script;
}

export interface CustodianLockArgs {
  deposit_block_hash: Hash;
  deposit_block_number: HexNumber;
  deposit_lock_args: DepositLockArgs;
}

export interface UnoinType {
  type: string;
  value: any;
}

export interface DepositLockArgs {
  owner_lock_hash: Hash;
  layer2_lock: Script;
  cancel_timeout: HexNumber;
}

export type L2TransactionStatus = "committed" | "pending";

export interface L2TransactionWithStatus {
  transaction: L2Transaction & { hash: Hash };
  status: L2TransactionStatus;
}

export interface AccountMerkleState {
  merkle_root: Hash;
  count: HexNumber;
}

export interface SubmitTransactions {
  tx_witness_root: Hash;
  tx_count: HexNumber;
  prev_state_checkpoint: Hash;
}

export interface SubmitWithdrawals {
  withdrawal_witness_root: Hash;
  withdrawal_count: HexNumber;
}

export interface RawL2Block {
  number: HexNumber;
  block_producer_id: HexNumber;
  parent_block_hash: Hash;
  stake_cell_owner_lock_hash: Hash;
  timestamp: HexNumber;
  prev_account: AccountMerkleState;
  post_account: AccountMerkleState;
  state_checkpoint_list: Hash[];
  submit_withdrawals: SubmitWithdrawals;
  submit_transactions: SubmitTransactions;
}

export interface KVPair {
  k: Hash;
  v: Hash;
}

export interface L2Block {
  raw: RawL2Block;
  kv_state: KVPair;
  kv_state_proof: HexString;
  transactions: L2Transaction[];
  block_proof: HexString;
  withdrawal_requests: WithdrawalRequest[];
  hash: Hash;
}

export type L2BlockStatus = "unfinalized" | "finalized" | "reverted";

export interface L2BlockWithStatus {
  block: L2Block;
  status: L2BlockStatus;
}

export interface LogItem {
  account_id: HexNumber;
  service_flag: HexNumber;
  data: HexString;
}

export interface RunResult {
  return_data: HexString;
  logs: LogItem[];
}

export interface L2TransactionReceipt {
  tx_witness_hash: Hash;
  post_state: AccountMerkleState;
  read_data_hashes: Hash[];
  logs: LogItem[];
}