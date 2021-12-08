import { useState } from "react";
import PWCore, {
  Address,
  AddressType,
  Amount,
  AmountUnit,
  CellDep,
  DefaultSigner,
  DepType,
  OutPoint,
  Provider,
  Reader,
  SnakeScript,
  transformers,
} from "@lay2/pw-core";
import { Godwoker, RequireResult } from "@polyjuice-provider/base";
import { toast } from "react-toastify";

import './WithdrawalLayerTwo.scss';
import {
  fetchWithdrawalRequests,
  getRollupCellWithState,
  minimalWithdrawalCapacity,
  WithdrawalRequest,
} from "./utils/withdrawal";
import { generateWithdrawalRequest } from "./utils/transaction";
import { Fee } from "./utils/base/types.js";
import { NormalizeWithdrawalRequest } from "./utils/base/normalizers";
import CONFIG from "../../config";
import BasicCollector from "../../collectors/BasicCollector";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import GodwokenUnlockBuilder from "../../builders/GodwokenUnlockBuilder";
import { ChainTypes, ChainTypeString } from "../../common/ts/Types";
import { SerializeWithdrawalRequest } from "@polyjuice-provider/godwoken/schemas";

interface PwObject {
  collector: BasicCollector;
  pwCore: PWCore;
  provider: Provider;
}

interface WithdrawLayerTwoProps {
  pw: PwObject;
}

export function WithdrawLayerTwo({ pw }: WithdrawLayerTwoProps) {
  const [withdrawalRequests, setWithdrawalRequests] = useState<
    WithdrawalRequest[] | null
  >(null);
  const [fetchWithdrawRequestsLoading, setFetchWithdrawLoading] =
    useState(false);
  const [createWithdrawRequestLoading, setCreateWithdrawRequestLoading] =
    useState(false);
  const [lastFinalizedBlock, setLastFinalizedBlock] = useState(BigInt(0));

  const loading = fetchWithdrawRequestsLoading || createWithdrawRequestLoading;

  async function fetchWithdrawRequests(address: Address) {
    setFetchWithdrawLoading(true);
    
    setWithdrawalRequests(
      await fetchWithdrawalRequests(
        address,
        CONFIG.testnet.godwoken.rollupTypeHash
      )
    );
    const rollupData = await getRollupCellWithState(CONFIG.testnet.godwoken.rollupTypeScript as SnakeScript);

    setLastFinalizedBlock(rollupData.lastFinalizedBlockNumber);
    setFetchWithdrawLoading(false);
  }

  async function withdraw(address: Address, amount: string) {
    setCreateWithdrawRequestLoading(true);

    const minimum = new Amount(
      minimalWithdrawalCapacity(false),
      AmountUnit.shannon
    );
    const desiredAmount = new Amount(amount, AmountUnit.ckb);

    if (desiredAmount.lt(minimum)) {
      toast.error(
        `Too low amount to withdraw. Minimum is: ${minimum.toString()} CKB.`
      );
      return;
    }

    const godwoker = new Godwoker(CONFIG.testnet.godwoken.rpcUrl);
    await godwoker.init();

    if (address.addressType !== AddressType.eth) {
      setCreateWithdrawRequestLoading(false);
      throw new Error(
        "Invalid AddressType. Please pass Ethereum-type address."
      );
    }

    const fromId = await godwoker.getAccountIdByEoaEthAddress(
      address.addressString
    );

    const capacity =
      "0x" +
      (BigInt(400) * BigInt(Math.pow(10, 8))).toString(16).padStart(16, "0"); // used to be 1000 CKB
    const ownerLockHash = address.toLockScript().toHash();
    const fee: Fee = {
      sudt_id: "0x1",
      amount: "0x0",
    };

    const config = {
      rollupTypeHash: CONFIG.testnet.godwoken.rollupTypeHash,
      polyjuice: {
        ethAccountLockCodeHash:
          CONFIG.testnet.godwoken.ethAccountLockScriptTypeHash,
        creatorAccountId: CONFIG.testnet.godwoken.creatorAccountId,
        scriptCodeHash:
          CONFIG.testnet.godwoken.polyjuiceValidatorScriptCodeHash,
      },
    };

    const request = await generateWithdrawalRequest(
      godwoker,
      address.addressString,
      {
        fromId,
        capacity,
        amount: "0x0",
        ownerLockHash,
        fee,
      },
      {
        config,
      }
    );

    const normalizedRequest = NormalizeWithdrawalRequest(request);

    const data = new Reader(
      SerializeWithdrawalRequest(normalizedRequest)
    ).serializeJson();

    await godwoker.jsonRPC('gw_submit_withdrawal_request', [data], '', RequireResult.canBeEmpty);

    setCreateWithdrawRequestLoading(false);
    toast.success("Withdrawal successfully requested!");
  }

  async function unlock(request: WithdrawalRequest, ckbAddress: Address, pw: PwObject) {
    const { rollupCell } = await getRollupCellWithState(CONFIG.testnet.godwoken.rollupTypeScript as SnakeScript);

    if (!rollupCell?.outPoint) {
      throw new Error('Rollup cell missing.');
    }

    const testnetConfig = CONFIG[ChainTypes[ChainTypes.testnet] as ChainTypeString];

  	const collector = new BasicCollector(testnetConfig.ckbIndexerUrl);
	  const fee = new Amount('10000', AmountUnit.shannon);
    const withdrawalLockCellDep = new CellDep(DepType.code, new OutPoint(testnetConfig.godwoken.withdrawalLockCellDep.tx_hash, testnetConfig.godwoken.withdrawalLockCellDep.index));
    const rollupCellDep = new CellDep(DepType.code, rollupCell?.outPoint);
    const builder = new GodwokenUnlockBuilder(ckbAddress, request, collector, fee, withdrawalLockCellDep, rollupCellDep);

    const transaction = await builder.build();
    transaction.validate();

    const signer = new DefaultSigner(pw.provider);
    const signedTx = await signer.sign(transaction);

    signedTx.witnesses[0] = signedTx.witnessArgs[0] as string;

    try {
      const txId = await pw.pwCore.rpc.send_transaction(transformers.TransformTransaction(signedTx), 'passthrough');

      toast.success(`Transaction submitted: ${txId} (Layer 1 transaction)`);
    } catch (error) {
      toast.error(`Unlock failed. Please try again.`);
    }
  }

  return (
    <div>
      {loading && <LoadingSpinner />}
      Withdrawal from Godwoken is a 2 step process. First you have to initiate
      withdrawal by creating withdrawal request. Then you need to wait about 5
      days to "unlock" the funds and receive them on Layer 1. Fetch pending requests to see if any of them is ready for unlocking.
      <br />
      <br />
      <br />
      <button onClick={() => withdraw(pw?.provider.address, "400")}>
        Create new withdrawal request of 400 CKB
      </button>
      <br />
      <br />
      <button onClick={() => fetchWithdrawRequests(pw?.provider.address)}>
        Fetch pending withdrawal requests
      </button>
      <br />
      <br />
      {!!withdrawalRequests && withdrawalRequests.length > 0 && (
        <>
          <table className="withdrawal-table">
            <thead>
              <tr>
                <td>Amount (Shannon)</td>
                <td>Withdrawal block</td>
                <td>Action</td>
              </tr>
            </thead>
            <tbody>
              {withdrawalRequests.map((request, index) => (
                <tr key={index}>
                  <td>{request.amount.toString()}</td>
                  <td>{request.withdrawalBlockNumber.toString()}</td>
                  <td>{lastFinalizedBlock >= request.withdrawalBlockNumber ? <button onClick={() => unlock(request, pw?.provider.address, pw)}>Unlock</button> : 'Not available'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <br />
          Last finalized block: {Number(lastFinalizedBlock)}. Withdrawal block needs to be higher or equal to it for the funds to be unlocked.
        </>
      )}
      {withdrawalRequests?.length === 0 && (
        <>
          No pending withdrawal requests.
        </>
      )}
    </div>
  );
}
