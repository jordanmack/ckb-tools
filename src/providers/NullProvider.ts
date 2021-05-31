import {Provider} from '@lay2/pw-core';

export default class NullProvider extends Provider
{
	constructor()
	{
		super(0);
	}
	async init()
	{
		return new NullProvider();
	}
	async sign()
	{
		return '';
	}
	async close()
	{
		return null;
	}
}
