import PWCore, {Address, Amount, AmountUnit, Builder, Cell, CellDep, ChainID, normalizers, OutPoint, RawTransaction, Reader, Script, SerializeWitnessArgs, Transaction, WitnessArgs} from "@lay2/pw-core";
import { SerializeUnlockWithdrawalViaFinalize  } from "@polyjuice-provider/godwoken/schemas";

import BasicCollector from "../collectors/BasicCollector";
import { WithdrawalRequest } from "../containers/WithdrawLayerTwo/utils/withdrawal";

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

  export function NormalizeUnlockWithdrawalViaFinalize(
    unlock_withdrawal_finalize: object,
    { debugPath = "unlock_withdrawal_finalize" } = {}
  ) {
    return normalizeObject(debugPath, unlock_withdrawal_finalize, {});
  }

export default class GodwokenUnlockBuilder extends Builder
{
	constructor(
        public ownerAddress: Address,
        public withdrawalRequest: WithdrawalRequest,
        public collector: BasicCollector,
        public fee: Amount,
        public withdrawalLockCellDep: CellDep,
        public rollupCellDep: CellDep,
        public portalWalletWitnessArgs: WitnessArgs = PWCore.chainId === ChainID.ckb
            ? Builder.WITNESS_ARGS.RawSecp256k1
            : Builder.WITNESS_ARGS.Secp256k1
    )
	{
		super();
	}

	async build(): Promise<Transaction>
	{
		const collector = this.collector;
		const fee = this.fee;

		// Arrays for our input cells, output cells, and cell deps, which will be used in the final transaction.
		const inputCells: Cell[] = [];
		const outputCells: Cell[] = [];
		const cellDeps: CellDep[] = [];

        // Create the output cell
        const outputCell = new Cell(
            new Amount(this.withdrawalRequest.amount.toString(), AmountUnit.shannon),
            this.ownerAddress.toLockScript(),
            Script.fromRPC(this.withdrawalRequest.cell.cell_output.type),
            undefined,
            this.withdrawalRequest.cell.data
        );

		outputCells.push(outputCell);

		// Calculate the required remaining capacity. (Change cell minimum (61) + fee)
		const neededAmount = new Amount("61", AmountUnit.ckb).add(fee);

        const lockScript = Script.fromRPC(this.withdrawalRequest.cell.cell_output.lock);
        const typeScript = Script.fromRPC(this.withdrawalRequest.cell.cell_output.type);

        if (!lockScript || !this.withdrawalRequest.cell.out_point) {
            throw new Error('Unexpected lack of withdrawal request cell lock script.');
        }

		// Add input cell
        inputCells.push(
            new Cell(
                new Amount(this.withdrawalRequest.cell.cell_output.capacity, AmountUnit.shannon),
                lockScript,
                typeScript,
                new OutPoint(
                    this.withdrawalRequest.cell.out_point.tx_hash,
                    this.withdrawalRequest.cell.out_point.index
                ),
                this.withdrawalRequest.cell.data
            )
        );

		const capacityCells = await collector.collectCapacity(this.ownerAddress, neededAmount);
		for(const cell of capacityCells)
			inputCells.push(cell);

		// Calculate the input capacity and change cell amounts.
		const inputCapacity = inputCells.reduce((a, c)=>a.add(c.capacity), Amount.ZERO);
		const changeCapacity = inputCapacity
            .sub(outputCell.capacity)
            .sub(fee);

		// Add the change cell.
		const changeLockScript = this.ownerAddress.toLockScript()
		const changeCell = new Cell(changeCapacity, changeLockScript);
		outputCells.push(changeCell);

		// Add the required cell deps.
		cellDeps.push(
            this.withdrawalLockCellDep,
            this.rollupCellDep,
            PWCore.config.defaultLock.cellDep,
            PWCore.config.pwLock.cellDep
        );

		// Generate a transaction and calculate the fee. (The second argument for witness args is needed for more accurate fee calculation.)
        const data =
            "0x00000000" +
            new Reader(
                SerializeUnlockWithdrawalViaFinalize(
                    NormalizeUnlockWithdrawalViaFinalize({})
                )
            )
            .serializeJson()
            .slice(2);

        const withdrawalWitnessArgs: WitnessArgs = {
            lock: data,
            input_type: '',
            output_type: ''
        };
        const withdrawalWitnessArgsSerialized = new Reader(
            SerializeWitnessArgs(
                normalizers.NormalizeWitnessArgs(withdrawalWitnessArgs)
            )
        ).serializeJson();
        
		const tx = new Transaction(new RawTransaction(inputCells, outputCells, cellDeps), [withdrawalWitnessArgsSerialized, this.portalWalletWitnessArgs]);
		this.fee = Builder.calcFee(tx);

		// Throw error if the fee is too low.
		if(this.fee.gt(fee))
			throw new Error(`Fee of ${fee} is below the calculated fee requirements of ${this.fee}.`);

		// Return our unsigned and non-broadcasted transaction.
		return tx;
	}
}
