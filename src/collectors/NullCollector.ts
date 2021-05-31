import {Amount, Collector} from '@lay2/pw-core';

export default class NullCollector extends Collector
{
	// eslint-disable-next-line
	constructor()
	{
		super();
	}
	async getBalance()
	{
		return Amount.ZERO;
	}
	async collect()
	{
		return [];
	}
}
