import PWCore, {Address, Amount, AmountUnit, Builder, Cell, ChainID, RawTransaction, SUDT, Transaction} from "@lay2/pw-core";
import BasicCollector from "../collectors/BasicCollector";

export default class SudtBurnBuilder extends Builder
{
	sudt: SUDT;
	address: Address;
	amount: Amount;
	collector: BasicCollector;
	fee: Amount;

	constructor(sudt: SUDT, address: Address, amount: Amount, collector: BasicCollector, fee: Amount)
	{
		super();

		this.sudt = sudt;
		this.address = address;
		this.amount = amount;
		this.collector = collector;
		this.fee = fee;
	}

	async build(): Promise<Transaction>
	{
		// Aliases
		const address = this.address;
		const amount = this.amount;
		const collector = this.collector;
		const fee = this.fee;
		const sudt = this.sudt;

		// Arrays for our input cells, output cells, and cell deps, which will be used in the final transaction.
		const inputCells = [];
		const outputCells = [];
		const cellDeps = [];

		// Add the SUDT input cells.
		const sudtCells = await collector.collectSUDT(sudt, address, amount);
		for(const cell of sudtCells)
			inputCells.push(cell);

		// Add an SUDT change cell, if needed.
		const inputSUDTAmount = inputCells.reduce((a, c)=>a.add(c.getSUDTAmount()), Amount.ZERO);
		if(inputSUDTAmount.sub(amount).gt(Amount.ZERO))
		{
			const typeScript = sudt.toTypeScript();
			const lockScript = address.toLockScript();
			const sudtCell = new Cell(new Amount("142", AmountUnit.ckb), lockScript, typeScript, undefined, inputSUDTAmount.sub(amount).toUInt128LE());
			outputCells.push(sudtCell);
		}

		// Calculate the capacity amounts.
		let inputCapacity = inputCells.reduce((a, c)=>a.add(c.capacity), Amount.ZERO);
		let outputCapacity = outputCells.reduce((a, c)=>a.add(c.capacity), Amount.ZERO);

		// Determine if more capacity is needed. (Input capacity - output capacity - change cell (61) - tx fee)
		if(inputCapacity.sub(outputCapacity).sub(new Amount("61", AmountUnit.ckb)).sub(fee).lt(Amount.ZERO))
		{
			const requiredCapacity = outputCapacity.add(new Amount("61", AmountUnit.ckb)).add(fee).sub(inputCapacity);
			const capacityCells = await collector.collectCapacity(address, requiredCapacity);
			for(const cell of capacityCells)
				inputCells.push(cell);
		}

		// Recalculate the input/output capacity amounts and the change cell amount.
		inputCapacity = inputCells.reduce((a, c)=>a.add(c.capacity), Amount.ZERO);
		outputCapacity = outputCells.reduce((a, c)=>a.add(c.capacity), Amount.ZERO);
		const changeCapacity = inputCapacity.sub(outputCapacity).sub(fee);

		// Add the change cell.
		const changeCell = new Cell(changeCapacity, address.toLockScript());
		outputCells.push(changeCell);

		// Add the required cell deps.
		cellDeps.push(PWCore.config.defaultLock.cellDep);
		cellDeps.push(PWCore.config.pwLock.cellDep);
		cellDeps.push(PWCore.config.sudtType.cellDep);

		// Generate a transaction and calculate the fee. (The second argument for witness args is needed for more accurate fee calculation.)
		const witnessArgs = (PWCore.chainId === ChainID.ckb) ? Builder.WITNESS_ARGS.RawSecp256k1 : Builder.WITNESS_ARGS.Secp256k1;
		const tx = new Transaction(new RawTransaction(inputCells, outputCells, cellDeps), [witnessArgs]);
		this.fee = Builder.calcFee(tx);

		// Throw error if the fee is too low.
		if(this.fee.gt(fee))
			throw new Error(`Fee of ${fee} is below the calculated fee requirements of ${this.fee}.`);

		// Return our unsigned and non-broadcasted transaction.
		return tx;
	}
}
