import { Cell, Hash, HexNumber, HexString } from "@ckb-lumos/base";
import { minimalCellCapacity } from "@ckb-lumos/helpers";
import { core } from '@polyjuice-provider/repo/packages/godwoken';
import {
  WithdrawalLockArgs,
} from "./base/types";
import { Reader } from "ckb-js-toolkit";
import { Address, HashType, ScriptType, SnakeScript } from "@lay2/pw-core";
import { CkbIndexer } from "./indexer-remote";
import { NormalizeWithdrawalLockArgs } from "./base/normalizers";
import { SerializeWithdrawalLockArgs } from "@polyjuice-provider/repo/packages/godwoken/schemas";
import CONFIG from '../../../config';

export interface WithdrawalRequest {
	amount: bigint;
	withdrawalBlockNumber: bigint;
  cell: any;
}

export function minimalWithdrawalCapacity(isSudt: boolean): HexNumber {
  // fixed size, the specific value is not important.
  const dummyHash: Hash = "0x" + "00".repeat(32);
  const dummyHexNumber: HexNumber = "0x0";
  const dummyRollupTypeHash: Hash = dummyHash;

  const dummyWithdrawalLockArgs: WithdrawalLockArgs = {
    account_script_hash: dummyHash,
    withdrawal_block_hash: dummyHash,
    withdrawal_block_number: dummyHexNumber,
    sudt_script_hash: dummyHash,
    sell_amount: dummyHexNumber,
    sell_capacity: dummyHexNumber,
    owner_lock_hash: dummyHash,
    payment_lock_hash: dummyHash,
  };

  const serialized: HexString = new Reader(
    SerializeWithdrawalLockArgs(
      NormalizeWithdrawalLockArgs(dummyWithdrawalLockArgs)
    )
  ).serializeJson();

  const args = dummyRollupTypeHash + serialized.slice(2);

  const lock: any = {
    code_hash: dummyHash,
    hash_type: "data",
    args,
  };

  let type: any = undefined;
  let data = "0x";
  if (isSudt) {
    type = {
      code_hash: dummyHash,
      hash_type: "data",
      args: dummyHash,
    };
    data = "0x" + "00".repeat(16);
  }

  const cell: Cell = {
    cell_output: {
      lock,
      type,
      capacity: dummyHexNumber,
    },
    data,
  };

  const capacity: bigint = minimalCellCapacity(cell);

  return "0x" + capacity.toString(16);
}

export async function getLastFinalizedBlockNumber(rollupTypeScript: SnakeScript) {
  const indexer = new CkbIndexer(
    CONFIG.testnet.ckbRpcUrl,
    CONFIG.testnet.ckbIndexerUrl
  );

  // * search rollup cell then get last_finalized_block_number from cell data (GlobalState)
  const rollupCells = await indexer.getCells({
    script: rollupTypeScript,
    script_type: ScriptType.type
  });

  let rollup_cell: Cell | undefined = undefined;
  for await (const cell of rollupCells) {
    rollup_cell = cell;
    break;
  }

  if (rollup_cell === null) {
    throw new Error('rollup_cell not found');
  }

  const globalState = new core.GlobalState(new Reader(rollup_cell.data));
  const last_finalized_block_number = globalState
    .getLastFinalizedBlockNumber()
    .toLittleEndianBigUint64();

  return last_finalized_block_number;
}

 export async function fetchWithdrawalRequests(
  ckbAddress: Address,
  rollupTypeHash: string
): Promise<WithdrawalRequest[]> {
  const lock_script = ckbAddress.toLockScript();
  const lock_script_hash = lock_script.toHash();

  // Ready to build L1 CKB transaction
  // const lastFinalizedBlockNumber = await getLastFinalizedBlockNumber(rollupTypeScript, indexer);

  // * search withdrawal locked cell by:
  //   - withdrawal lock code hash
  //   - owner secp256k1 blake2b160 lock hash
  //   - last_finalized_block_number
  //   - TODO: withdrawal_block_hash (to proof the block is on current rollup)
  
  const indexer = new CkbIndexer(
    CONFIG.testnet.ckbRpcUrl,
    CONFIG.testnet.ckbIndexerUrl
  );
  
  const withdrawalCollector = indexer.collector({
    lock: {
        code_hash: CONFIG.testnet.godwoken.withdrawalLockScript.code_hash,
        hash_type: CONFIG.testnet.godwoken.withdrawalLockScript.hash_type as HashType,
        args: rollupTypeHash, // prefix search
    },
    type: "empty",
    argsLen: "any",
    fromBlock: '1000000'
  });

  const withdrawalCells: WithdrawalRequest[] = [];
  for await (const cell of withdrawalCollector.collect()) {
    const lock_args = cell.cell_output.lock.args;
    const withdrawal_lock_args_data = '0x' + lock_args.slice(66);
    const withdrawal_lock_args = new core.WithdrawalLockArgs(
      new Reader(withdrawal_lock_args_data)
    );
    const owner_lock_hash = new Reader(
      withdrawal_lock_args.getOwnerLockHash().raw()
    ).serializeJson();
    if (owner_lock_hash !== lock_script_hash) {
      continue;
    }

    const withdrawalBlockNumber = withdrawal_lock_args
      .getWithdrawalBlockNumber()
      .toLittleEndianBigUint64();

    withdrawalCells.push({
      cell,
      withdrawalBlockNumber,
      amount: withdrawal_lock_args.getSellCapacity().toLittleEndianBigUint64()
    });
  }

  return withdrawalCells.sort((a, b) => Number(a.withdrawalBlockNumber - b.withdrawalBlockNumber));
};
