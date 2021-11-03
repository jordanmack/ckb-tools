import PWCore, {Address, Amount, AmountUnit, Builder, Cell, ChainID, RawTransaction, SUDT, Transaction} from "@lay2/pw-core";
import BasicCollector from "../collectors/BasicCollector";

export default class SudtMintBuilder extends Builder
{
	sudt: SUDT;
	issuerAddress: Address;
	destinationAddress: Address;
	amount: Amount;
	collector: BasicCollector;
	fee: Amount;

	constructor(sudt: SUDT, issuerAddress: Address, destinationAddress: Address, amount: Amount, collector: BasicCollector, fee: Amount)
	{
		super();

		this.sudt = sudt;
		this.issuerAddress = issuerAddress;
		this.destinationAddress = destinationAddress;
		this.amount = amount;
		this.collector = collector;
		this.fee = fee;
	}

	async build(): Promise<Transaction>
	{
		// Aliases
		const issuerAddress = this.issuerAddress;
		const destinationAddress = this.destinationAddress;
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
		const lockScript = destinationAddress.toLockScript();
		const sudtCell = new Cell(new Amount("142", AmountUnit.ckb), lockScript, typeScript, undefined, amount.toUInt128LE());
		outputCells.push(sudtCell);

		// Calculate the required capacity. (SUDT cell + change cell minimum (61) + fee)
		const neededAmount = sudtCell.capacity.add(new Amount("61", AmountUnit.ckb)).add(fee);

		// Add necessary capacity.
		const capacityCells = await collector.collectCapacity(issuerAddress, neededAmount);
		for(const cell of capacityCells)
			inputCells.push(cell);

		// Calculate the input capacity and change cell amounts.
		const inputCapacity = inputCells.reduce((a, c)=>a.add(c.capacity), Amount.ZERO);
		const changeCapacity = inputCapacity.sub(neededAmount.sub(new Amount("61", AmountUnit.ckb)));

		// Add the change cell.
		const changeLockScript = issuerAddress.toLockScript()
		const changeCell = new Cell(changeCapacity, changeLockScript);
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
