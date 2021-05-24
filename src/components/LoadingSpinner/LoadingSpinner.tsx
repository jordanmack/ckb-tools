import React from 'react';
import './LoadingSpinner.scss';

function LoadingSpinner()
{
	const html =
	(
		<img className="loading-spinner" src="loading.svg" alt="Loading" />
	);

	return html;
}

export default LoadingSpinner;
