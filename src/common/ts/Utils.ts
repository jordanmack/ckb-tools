import {Reader} from 'ckb-js-toolkit';

function addCopyButtonTooltips(className: string)
{
	const addToolTip = (e: Event) =>
	{
		const element = e.currentTarget as HTMLButtonElement; 
		const tooltipDirection = (window.innerWidth >= 1280) ? 'tooltipped-e' : 'tooltipped-s';
		element.classList.add('tooltipped');
		element.classList.add(tooltipDirection);
		element.classList.add('tooltipped-no-delay');
		element.setAttribute('aria-label', 'Copied!');
	};

	const removeToolTip = (e: Event) =>
	{
		const element = e.currentTarget as HTMLButtonElement; 
		element.classList.remove('tooltipped');
		element.classList.remove('tooltipped-e');
		element.classList.remove('tooltipped-s');
		element.classList.remove('tooltipped-no-delay');
		element.setAttribute('aria-label', '');
	};
	
	for(const e of document.getElementsByClassName(className))
	{
		e.removeEventListener('click', addToolTip);
		e.addEventListener('click', addToolTip);
		e.removeEventListener('mouseout', removeToolTip);
		e.addEventListener('mouseout', removeToolTip);
	}
}

interface DecodeErrorOptions
{
	logErrorDetails?: boolean,
	rethrowUnmatched?: boolean,
}

function decodeError(error: Error, passedOptions?: DecodeErrorOptions)
{
	const defaults =
	{
		logErrorDetails: true,
		rethrowUnmatched: false,
	};
	const options = Object.assign({}, defaults, passedOptions);

	const regex = /^(\w+): ([\w\s]+) (\{.*\})$/;
	const matches = error.message.match(regex);

	if(!!matches && matches.length > 0)
	{
		const category = matches[1];
		const type = matches[2];
		const json = JSON.parse(matches[3]);

		if(options.logErrorDetails)
		{
			console.error(`Error: ${category}`);
			console.error(`Type: ${type}`);
			console.error(`Code: ${json.code}`);
			console.error(`Message: ${json.message}`);
			console.error(`Data: ${json.data}`);
		}

		const error =
		{
			category,
			json,
			type,
		};

		return error;
	}
	else if(options.rethrowUnmatched)
		throw error;

	return null;
}

function arrayBufferToHex(arrayBuffer: ArrayBuffer)
{
	return new Reader(arrayBuffer).serializeJson();
}

function hexToArrayBuffer(hexString: string)
{
	return new Reader(hexString).toArrayBuffer();
}

const exportObj =
{
	addCopyButtonTooltips,
	arrayBufferToHex,
	decodeError,
	hexToArrayBuffer,
};
export default exportObj;
