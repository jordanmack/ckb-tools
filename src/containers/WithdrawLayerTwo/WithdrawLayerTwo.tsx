import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

import "./WithdrawalLayerTwo.scss";
import GLOBAL_CONFIG from "../../config";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import { ChainTypes, ChainTypeString } from "../../common/ts/Types";
import { AddressTranslator, GodwokenWithdraw, WithdrawalRequest, Script, GwUnlockBuilderCellDep } from "nervos-godwoken-integration";

interface WithdrawLayerTwoProps {
  addressTranslator: AddressTranslator;
  chainType: ChainTypes;
  ethAddress: string;
}

export function WithdrawLayerTwo({ addressTranslator, chainType, ethAddress }: WithdrawLayerTwoProps) {
  const [withdrawalRequests, setWithdrawalRequests] = useState<
    WithdrawalRequest[] | null
  >(null);
  const [fetchWithdrawRequestsLoading, setFetchWithdrawLoading] =
    useState(false);
  const [createWithdrawRequestLoading, setCreateWithdrawRequestLoading] =
    useState(false);
  const [lastFinalizedBlock, setLastFinalizedBlock] = useState(BigInt(0));
  const [godwokenWithdraw, setGodwokenWithdraw] = useState<GodwokenWithdraw>();

  const loading = fetchWithdrawRequestsLoading || createWithdrawRequestLoading;

  const config = useMemo(() => {
    return GLOBAL_CONFIG[ChainTypes[chainType] as ChainTypeString];
  }, [chainType]);

  useEffect(() => {
    (async () => {
      const gwWithdraw = new GodwokenWithdraw({
        creatorAccountId: config.godwoken.creatorAccountId,
        ethAccountLockScriptTypeHash: config.godwoken.ethAccountLockScriptTypeHash,
        polyjuiceValidatorScriptCodeHash: config.godwoken.polyjuiceValidatorScriptCodeHash,
        rollupTypeHash: config.godwoken.rollupTypeHash,
        withdrawalLockScript: config.godwoken.withdrawalLockScript as Script,
        withdrawalLockCellDep: config.godwoken.withdrawalLockCellDep as GwUnlockBuilderCellDep,
        rollupTypeScript: config.godwoken.rollupTypeScript as Script
      }, addressTranslator);
      await gwWithdraw.init(chainType === ChainTypes.mainnet ? 'mainnet' : 'testnet');
      setGodwokenWithdraw(gwWithdraw);
    })();
  }, [addressTranslator, config, chainType]);

  async function fetchWithdrawRequests() {
    if (!godwokenWithdraw) {
      throw new Error('WithdrawLayerTwo component uninitialized.');
    }

    setFetchWithdrawLoading(true);

    const rollupData = await godwokenWithdraw.getRollupCellWithState();

    setLastFinalizedBlock(rollupData.lastFinalizedBlockNumber);

    setWithdrawalRequests(
      await godwokenWithdraw.fetchWithdrawalRequests(ethAddress)
    );
    setFetchWithdrawLoading(false);
  }

  async function withdraw(amount: string) {
    if (!godwokenWithdraw) {
      throw new Error('WithdrawLayerTwo component uninitialized.');
    }

    setCreateWithdrawRequestLoading(true);

    try {
      await godwokenWithdraw.connectWallet();
      await godwokenWithdraw.withdraw(ethAddress, amount, config.godwoken.rpcUrl);

      toast.success("Withdrawal successfully requested!");
    } catch (error: any) {
      toast.error(error?.message || 'Unknown error.');
    } finally {
      setCreateWithdrawRequestLoading(false);
    }
  }

  async function unlock(
    request: WithdrawalRequest
  ) {
    if (!godwokenWithdraw) {
      throw new Error('WithdrawLayerTwo component uninitialized.');
    }

    try {
      await godwokenWithdraw.connectWallet();
      const txId = await godwokenWithdraw.unlock(request, ethAddress);

      toast.success(`Transaction submitted: ${txId} (Layer 1 transaction)`);
    } catch (error) {
      console.log('err clause')
      console.error(error);
      toast.error(`Unlock failed. Please try again.`);
    }
  }

  return (
    <div>
      {loading && <LoadingSpinner />}
      Withdrawal from Godwoken is a 2 step process. First you have to initiate
      withdrawal by creating withdrawal request. Then you need to wait about 5
      days to "unlock" the funds and receive them on Layer 1. Fetch pending
      requests to see if any of them is ready for unlocking.
      <br />
      <br />
      <br />
      <button onClick={() => withdraw("400")}>
        Create new withdrawal request of 400 CKB
      </button>
      <br />
      <br />
      <button onClick={() => fetchWithdrawRequests()}>
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
                  <td>
                    {lastFinalizedBlock >= request.withdrawalBlockNumber ? (
                      <button
                        onClick={() =>
                          unlock(request)
                        }
                      >
                        Unlock
                      </button>
                    ) : (
                      "Not available"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <br />
          Last finalized block: {Number(lastFinalizedBlock)}. Withdrawal block
          needs to be higher or equal to it for the funds to be unlocked.
        </>
      )}
      {withdrawalRequests?.length === 0 && <>No pending withdrawal requests.</>}
    </div>
  );
}
