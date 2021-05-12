import {Amount, AmountUnit, Cell, Collector, OutPoint, Script} from "@lay2/pw-core";

export default class AuctionCollector extends Collector
{
	indexerUrl = null;

	constructor(indexerUrl)
	{
		super();
		this.indexerUrl = indexerUrl;
	}

	async collectCapacity(address, neededAmount)
	{
		this.cells = [];

		const indexerQuery =
		{
			id: 2,
			jsonrpc: "2.0",
			method: "get_cells",
			params: 
			[
				{
					script: address.toLockScript().serializeJson(),
					script_type: "lock",
				},
				"asc",
				"0x2710",
			]
		};

		const requestOptions =
		{
			method: "POST",
			body: JSON.stringify(indexerQuery),
			cache: "no-store",
			headers:
			{
				"Content-Type": "application/json",
			},
			mode: "cors",
		};
		const result = await (await fetch(this.indexerUrl, requestOptions)).json();

		let amountTotal = Amount.ZERO;
		const rawCells = result.result.objects;
		for(const rawCell of rawCells)
		{
			const amount = new Amount(rawCell.output.capacity, AmountUnit.shannon);
			const lockScript = Script.fromRPC(rawCell.output.lock);
			const typeScript = Script.fromRPC(rawCell.output.type);
			const outPoint = OutPoint.fromRPC(rawCell.out_point);
			const outputData = rawCell.output_data;

			if(typeScript === undefined || typeScript === null)
			{
				const cell = new Cell(amount, lockScript, typeScript, outPoint, outputData);
				this.cells.push(cell);
	
				amountTotal = amountTotal.add(amount)
				if(amountTotal.gte(neededAmount))
					break;
			}
		}

		if(amountTotal.lt(neededAmount))
			throw new Error(`Could not find enough input capacity. Needed ${neededAmount.toString(AmountUnit.ckb)}, found ${amountTotal.toString(AmountUnit.ckb)}.`);

		return this.cells;
	}

	async collectSUDT(sudt, address, neededAmount)
	{
		this.cells = [];

		const lockScript = address.toLockScript();
		const typeScript = sudt.toTypeScript();

		const indexerQuery =
		{
			id: 2,
			jsonrpc: "2.0",
			method: "get_cells",
			params: 
			[
				{
					script: lockScript.serializeJson(),
					script_type: "lock",
					filter:
					{
						script: typeScript.serializeJson(),
					}		
				},
				"asc",
				"0x2710",
			]
		};

		const requestOptions =
		{
			method: "POST",
			body: JSON.stringify(indexerQuery),
			cache: "no-store",
			headers:
			{
				"Content-Type": "application/json",
			},
			mode: "cors",
		};
		const result = await (await fetch(this.indexerUrl, requestOptions)).json();

		let amountSUDTTotal = Amount.ZERO;
		const rawCells = result.result.objects;
		for(const rawCell of rawCells)
		{
			const amount = new Amount(rawCell.output.capacity, AmountUnit.shannon);
			const amountSUDT = Amount.fromUInt128LE(rawCell.output_data.substring(0, 34));
			const lockScript = Script.fromRPC(rawCell.output.lock);
			const typeScript = Script.fromRPC(rawCell.output.type);
			const outPoint = OutPoint.fromRPC(rawCell.out_point);
			const outputData = rawCell.output_data;

			const cell = new Cell(amount, lockScript, typeScript, outPoint, outputData);
			this.cells.push(cell);

			amountSUDTTotal = amountSUDTTotal.add(amountSUDT)
			if(amountSUDTTotal.gte(neededAmount))
				break;
		}

		if(amountSUDTTotal.lt(neededAmount))
			throw new Error(`Could not find enough input SUDT cells. Needed ${neededAmount.toString(0)}, found ${amountSUDTTotal.toString(0)}.`);

		return this.cells;
	}

	async getCells(address)
	{
		this.cells = [];

		const indexerQuery =
		{
			id: 2,
			jsonrpc: "2.0",
			method: "get_cells",
			params: 
			[
				{
					script: address.toLockScript().serializeJson(),
					script_type: "lock",
				},
				"asc",
				"0x2710",
			]
		};

		const res = await (await fetch(this.indexerUrl,
		{
			method: "POST",
			body: JSON.stringify(indexerQuery),
			cache: "no-store",
			headers:
			{
				"Content-Type": "application/json",
			},
			mode: "cors",
		})).json();

		const rawCells = res.result.objects;

		for(const rawCell of rawCells)
		{
			const amount = new Amount(rawCell.output.capacity, AmountUnit.shannon);
			const lockScript = Script.fromRPC(rawCell.output.lock);
			const typeScript = Script.fromRPC(rawCell.output.type);
			const outPoint = OutPoint.fromRPC(rawCell.out_point);
			const outputData = rawCell.output_data;

			const cell = new Cell(amount, lockScript, typeScript, outPoint, outputData);
			this.cells.push(cell);
		}
		return this.cells;
	}

	async getBalance(address)
	{
		const cells = await this.getCells(address);

		if (!cells.length)
			return Amount.ZERO;

		const balance = cells
			.map((c) => c.capacity)
			.reduce((sum, cap) => (sum = sum.add(cap)));
		
		return balance;
	}

	async getSUDTBalance(sudt, address)
	{
		const cells = await this.getCells(address);

		if(!cells.length)
			return Amount.ZERO;

		const sudtTypeHash = sudt.toTypeScript().toHash();
		let balance = new Amount(0, 0);
		
		for(const cell of cells)
		{
			if(!!cell.type && cell.type.toHash() === sudtTypeHash && cell.data.length >= 34)
			// if(!!cell.type && cell.data.length >= 34)
			{
				const cellAmountData = cell.data.substring(0, 34);
				const amount = Amount.fromUInt128LE(cellAmountData);
				balance = balance.add(amount);
			}
		}

		return balance;
	}

	async collect(address, { withData }) {
		const cells = await this.getCells(address);

		if (withData) {
			return cells.filter((c) => !c.isEmpty() && !c.type);
		}

		return cells.filter((c) => c.isEmpty() && !c.type);
	}
}