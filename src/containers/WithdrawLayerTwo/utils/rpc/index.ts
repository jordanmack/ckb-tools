import { Hash, HexNumber, HexString, Script } from "@ckb-lumos/base";
import { RPC as ToolkitRPC } from "ckb-js-toolkit";
import {
  L2Block,
  L2BlockWithStatus,
  L2TransactionReceipt,
  L2TransactionWithStatus,
  RunResult,
} from "../base";

export class RPC {
  private innerGw: GwRpc;

  constructor(uri: string, options?: object) {
    this.innerGw = new GwRpc(uri, options);
  }

  get gw(): GwRpc {
    return this.innerGw;
  }
}

class GwRpc {
  private rpc: ToolkitRPC;

  constructor(uri: string, options?: object) {
    this.rpc = new ToolkitRPC(uri, options);
  }

  async ping(): Promise<"pong"> {
    return await this.rpc.ping();
  }

  async get_transaction(
    tx_hash: Hash
  ): Promise<L2TransactionWithStatus | undefined> {
    return await this.rpcCall("get_transaction", tx_hash);
  }

  async get_block(block_hash: Hash): Promise<L2BlockWithStatus | undefined> {
    return await this.rpcCall("get_block", block_hash);
  }

  async get_block_by_number(
    block_number: HexNumber
  ): Promise<L2Block | undefined> {
    return await this.rpcCall("get_block_by_number", block_number);
  }

  async get_block_hash(block_number: HexNumber): Promise<Hash | undefined> {
    return await this.rpcCall("get_block_hash", block_number);
  }

  async get_tip_block_hash(): Promise<Hash> {
    return await this.rpcCall("get_tip_block_hash");
  }

  async get_transaction_receipt(
    tx_hash: Hash
  ): Promise<L2TransactionReceipt | undefined> {
    return await this.rpcCall("get_transaction_receipt", tx_hash);
  }

  async execute_l2transaction(l2tx: HexString): Promise<RunResult> {
    return await this.rpcCall("execute_l2transaction", l2tx);
  }

  async execute_raw_l2transaction(
    raw_l2tx: HexString,
    block_number: HexNumber
  ): Promise<RunResult> {
    return await this.rpcCall(
      "execute_raw_l2transaction",
      raw_l2tx,
      block_number
    );
  }

  async submit_l2transaction(l2tx: HexString): Promise<Hash> {
    return await this.rpcCall("submit_l2transaction", l2tx);
  }

  async submit_withdrawal_request(
    withdrawal_request: HexString
  ): Promise<void> {
    return await this.rpcCall("submit_withdrawal_request", withdrawal_request);
  }

  async get_balance(
    short_address: HexString,
    sudt_id: HexNumber,
    block_number?: HexNumber
  ): Promise<HexNumber> {
    return await this.rpcCall(
      "get_balance",
      short_address,
      sudt_id,
      block_number
    );
  }

  async get_storage_at(
    account_id: HexNumber,
    key: Hash,
    block_number?: HexNumber
  ): Promise<Hash> {
    return await this.rpcCall("get_storage_at", account_id, key, block_number);
  }

  async get_account_id_by_script_hash(
    script_hash: Hash
  ): Promise<HexNumber | undefined> {
    return await this.rpcCall("get_account_id_by_script_hash", script_hash);
  }

  async get_nonce(
    account_id: HexNumber,
    block_number?: HexNumber
  ): Promise<HexNumber> {
    return await this.rpcCall("get_nonce", account_id, block_number);
  }

  async get_script(script_hash: Hash): Promise<Script | undefined> {
    return await this.rpcCall("get_script", script_hash);
  }

  async get_script_hash(account_id: HexNumber): Promise<Hash> {
    return await this.rpcCall("get_script_hash", account_id);
  }

  async get_script_hash_by_short_address(
    short_address: HexString
  ): Promise<Hash | undefined> {
    return await this.rpcCall(
      "get_script_hash_by_short_address",
      short_address
    );
  }

  async get_data(
    data_hash: Hash,
    block_number?: HexNumber
  ): Promise<HexString | undefined> {
    return await this.rpcCall("get_data", data_hash, block_number);
  }

  async compute_l2_sudt_script_hash(l1_sudt_script_hash: Hash): Promise<Hash> {
    return await this.rpcCall(
      "compute_l2_sudt_script_hash",
      l1_sudt_script_hash
    );
  }

  private async rpcCall(methodName: string, ...args: any[]): Promise<any> {
    const name = "gw_" + methodName;
    return await this.rpc[name](...args);
  }
}
