import { useState } from "react";
import PWCore, {
  Address,
  AddressType,
  Amount,
  AmountUnit,
  CellDep,
  DepType,
  OutPoint,
  Provider,
  Reader,
  SnakeScript,
} from "@lay2/pw-core";
import { Godwoker } from "@polyjuice-provider/base";
import { toast } from "react-toastify";

import './WithdrawalLayerTwo.scss';
import {
  fetchWithdrawalRequests,
  getLastFinalizedBlockNumber,
  minimalWithdrawalCapacity,
  WithdrawalRequest,
} from "./utils/withdrawal";
import { generateWithdrawalRequest } from "./utils/transaction";
import { RPC } from "./utils/rpc/index";
import { Fee } from "./utils/base/types.js";
import { SerializeWithdrawalRequest } from "./utils/base/schemas/index";
import { NormalizeWithdrawalRequest } from "./utils/base/normalizers";
import CONFIG from "../../config";
import BasicCollector from "../../collectors/BasicCollector";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import GodwokenUnlockBuilder from "../../builders/GodwokenUnlockBuilder";
import { ChainTypes, ChainTypeString } from "../../common/ts/Types";

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
    setLastFinalizedBlock(await getLastFinalizedBlockNumber(CONFIG.testnet.godwoken.rollupTypeScript as SnakeScript));
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

    const rpc = new RPC(CONFIG.testnet.godwoken.rpcUrl);

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
      rpc,
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

    await rpc.gw.submit_withdrawal_request(data);

    setCreateWithdrawRequestLoading(false);
    toast.success("Withdrawal successfully requested!");
  }

  async function unlock(request: WithdrawalRequest, ckbAddress: Address, pw: PwObject) {
  	const collector = new BasicCollector(CONFIG[ChainTypes[ChainTypes.testnet] as ChainTypeString].ckbIndexerUrl);
	  const fee = new Amount('10000', AmountUnit.shannon);
    const withdrawalLockCellDep = new CellDep(DepType.code, new OutPoint('0xb4b07dcd1571ac18683b515ada40e13b99bd0622197b6817047adc9f407f4828', '0x0'));
    const rollupCellDep = new CellDep(DepType.code, new OutPoint('0x850e6c33d845356163c736bf8234856de0b0a8e2ad0c5227fc12058b8b602623', '0x0'));
    const builder = new GodwokenUnlockBuilder(ckbAddress, request, collector, fee, withdrawalLockCellDep, rollupCellDep);

    const transaction = await builder.build();
    console.info(transaction);

    const txId = await pw.pwCore.sendTransaction(transaction);
    console.log(`Transaction submitted: ${txId}`);
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
