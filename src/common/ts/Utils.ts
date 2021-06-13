function addCopyButtonTooltips(className: string)
{
	const addToolTip = (e: Event) =>
	{
		(e.currentTarget as HTMLButtonElement).classList.add('tooltipped');
		(e.currentTarget as HTMLButtonElement).classList.add('tooltipped-e');
		(e.currentTarget as HTMLButtonElement).classList.add('tooltipped-no-delay');
		(e.currentTarget as HTMLButtonElement).setAttribute('aria-label', 'Copied!');
	};

	const removeToolTip = (e: Event) =>
	{
		(e.currentTarget as HTMLButtonElement).classList.remove('tooltipped');
		(e.currentTarget as HTMLButtonElement).classList.remove('tooltipped-e');
		(e.currentTarget as HTMLButtonElement).classList.remove('tooltipped-no-delay');
		(e.currentTarget as HTMLButtonElement).setAttribute('aria-label', '');
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

const exports =
{
	addCopyButtonTooltips,
	decodeError,
};
export default exports;
