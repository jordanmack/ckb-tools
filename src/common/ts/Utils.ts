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
	decodeError,
};
export default exports;
