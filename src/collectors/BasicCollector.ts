import {Address, Amount, AmountUnit, Cell, Collector, CollectorOptions, OutPoint, Script, SUDT} from '@lay2/pw-core';
import * as _ from 'lodash';

export default class BasicCollector extends Collector
{
	cells: Array<Cell> = [];
	indexerUrl: string;

	constructor(indexerUrl: string)
	{
		super();
		this.indexerUrl = indexerUrl;
	}

	async collectCapacity(address: Address, neededAmount: Amount)
	{
		this.cells = [];
		const indexerQuery = {
			id: _.random(1_000_000),
			jsonrpc: "2.0",
			method: "get_cells",
			params: [
				{
					script: address.toLockScript().serializeJson(),
					script_type: "lock",
				},
				"asc",
				"0x2710",
			]
		};
		const requestOptions = {
			method: "POST",
			body: JSON.stringify(indexerQuery),
			cache: "no-store" as RequestCache,
			headers: {
				"Content-Type": "application/json",
			},
			mode: "cors" as RequestMode,
		};
		const result = await (await fetch(this.indexerUrl, requestOptions)).json();
		let amountTotal = Amount.ZERO;
		const rawCells = result.result.objects;
		for (const rawCell of rawCells) {
			const amount = new Amount(rawCell.output.capacity, AmountUnit.shannon);
			const lockScript = Script.fromRPC(rawCell.output.lock);
			const typeScript = Script.fromRPC(rawCell.output.type);
			const outPoint = OutPoint.fromRPC(rawCell.out_point);
			const outputData = rawCell.output_data;

			if(typeScript === undefined || typeScript === null)
			{
				// @ts-ignore
				const cell = new Cell(amount, lockScript, undefined, outPoint, outputData);
				this.cells.push(cell);
				amountTotal = amountTotal.add(amount);
				if (amountTotal.gte(neededAmount))
					break;
			}
		}
		if (amountTotal.lt(neededAmount))
			throw new Error(`Could not find enough input capacity. Needed ${neededAmount.toString(AmountUnit.ckb)}, found ${amountTotal.toString(AmountUnit.ckb)}.`);

		return this.cells;
	}

	async collectSUDT(sudt: SUDT, address: Address, neededAmount: Amount)
	{
		this.cells = [];
		const lockScript = address.toLockScript();
		const typeScript = sudt.toTypeScript();

		const indexerQuery =
		{
			id: _.random(1_000_000),
			jsonrpc: "2.0",
			method: "get_cells",
			params: [
				{
					script: lockScript.serializeJson(),
					script_type: "lock",
					filter: {
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
			cache: "no-store" as RequestCache,
			headers: {
				"Content-Type": "application/json",
			},
			mode: "cors" as RequestMode,
		};

		const result = await (await fetch(this.indexerUrl, requestOptions)).json();
		let amountSUDTTotal = Amount.ZERO;
		const rawCells = result.result.objects;
		for (const rawCell of rawCells) {
			const amount = new Amount(rawCell.output.capacity, AmountUnit.shannon);
			const amountSUDT = Amount.fromUInt128LE(rawCell.output_data.substring(0, 34));
			const lockScript = Script.fromRPC(rawCell.output.lock);
			const typeScript = Script.fromRPC(rawCell.output.type);
			const outPoint = OutPoint.fromRPC(rawCell.out_point);
			const outputData = rawCell.output_data;

			// @ts-ignore
			const cell = new Cell(amount, lockScript, typeScript, outPoint, outputData);
			this.cells.push(cell);

			amountSUDTTotal = amountSUDTTotal.add(amountSUDT);

			if(amountSUDTTotal.gte(neededAmount))
				break;
		}
		if (amountSUDTTotal.lt(neededAmount))
			throw new Error(`Could not find enough input SUDT cells. Needed ${neededAmount.toString(0)}, found ${amountSUDTTotal.toString(0)}.`);

		return this.cells;
	}

	async getCells(address: Address)
	{
		this.cells = [];
		const indexerQuery = {
			id: _.random(1_000_000),
			jsonrpc: "2.0",
			method: "get_cells",
			params: [
				{
					script: address.toLockScript().serializeJson(),
					script_type: "lock",
				},
				"asc",
				"0x2710",
			]
		};
		const res = await (await fetch(this.indexerUrl, {
			method: "POST",
			body: JSON.stringify(indexerQuery),
			cache: "no-store" as RequestCache,
			headers: {
				"Content-Type": "application/json",
			},
			mode: "cors" as RequestMode,
		})).json();
		const rawCells = res.result.objects;
		for (const rawCell of rawCells) {
			const amount = new Amount(rawCell.output.capacity, AmountUnit.shannon);
			const lockScript = Script.fromRPC(rawCell.output.lock);
			const typeScript = Script.fromRPC(rawCell.output.type);
			const outPoint = OutPoint.fromRPC(rawCell.out_point);
			const outputData = rawCell.output_data;

			// @ts-ignore
			const cell = new Cell(amount, lockScript, typeScript, outPoint, outputData);
			this.cells.push(cell);
		}

		return this.cells;
	}

	async getBalance(address: Address)
	{
		const cells = await this.getCells(address);
		if (!cells.length)
			return Amount.ZERO;

		const balance = cells
			.map((c) => c.capacity)
			.reduce((sum, cap) => (sum = sum.add(cap)));

		return balance;
	}

	async getSUDTBalance(sudt: SUDT, address: Address)
	{
		const cells = await this.getCells(address);
		if (!cells.length)
			return Amount.ZERO;
		const sudtTypeHash = sudt.toTypeScript().toHash();
		let balance = new Amount(String(0), 0);
		for (const cell of cells) {
			if (!!cell.type && cell.type.toHash() === sudtTypeHash && cell.getHexData().length >= 34) 
			// if(!!cell.type && cell.data.length >= 34)
			{
				const cellAmountData = cell.getHexData().substring(0, 34);
				const amount = Amount.fromUInt128LE(cellAmountData);
				balance = balance.add(amount);
			}
		}

		return balance;
	}

	async collect(address: Address, options: CollectorOptions)
	{
		const cells = await this.getCells(address);
		if(options.withData) {
			return cells.filter((c) => !c.isEmpty() && !c.type);
		}

		return cells.filter((c) => c.isEmpty() && !c.type);
	}
}
