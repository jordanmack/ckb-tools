import PWCore, {Address, Amount, AmountUnit, Builder, Cell, RawTransaction, SUDT, Transaction} from "@lay2/pw-core";
import BasicCollector from "../collectors/BasicCollector";

export default class SudtMintBuilder extends Builder
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

		// Create the SUDT output cell.
		const typeScript = sudt.toTypeScript();
		const lockScript = address.toLockScript();
		const sudtCell = new Cell(new Amount("142", AmountUnit.ckb), lockScript, typeScript, undefined, amount.toUInt128LE());
		outputCells.push(sudtCell);

		// Calculate the required capacity. (SUDT cell + change cell minimum (61) + fee)
		const neededAmount = sudtCell.capacity.add(new Amount("61", AmountUnit.ckb)).add(fee);

		// Add necessary capacity.
		const capacityCells = await collector.collectCapacity(address, neededAmount);
		for(const cell of capacityCells)
			inputCells.push(cell);

		// Calculate the input capacity and change cell amounts.
		const inputCapacity = inputCells.reduce((a, c)=>a.add(c.capacity), Amount.ZERO);
		const changeCapacity = inputCapacity.sub(neededAmount.sub(new Amount("61", AmountUnit.ckb)));

		// Add the change cell.
		const changeCell = new Cell(changeCapacity, lockScript);
		outputCells.push(changeCell);

		// Add the required cell deps.
		cellDeps.push(PWCore.config.defaultLock.cellDep);
		cellDeps.push(PWCore.config.pwLock.cellDep);
		cellDeps.push(PWCore.config.sudtType.cellDep);

		// Generate a transaction and calculate the fee. (The second argument for witness args is needed for more accurate fee calculation.)
		const tx = new Transaction(new RawTransaction(inputCells, outputCells, cellDeps), [Builder.WITNESS_ARGS.Secp256k1]);
		this.fee = Builder.calcFee(tx);

		// Throw error if the fee is too low.
		if(this.fee.gt(fee))
			throw new Error(`Fee of ${fee} is below the calculated fee requirements of ${this.fee}.`);

		// Return our unsigned and non-broadcasted transaction.
		return tx;
	}
}
