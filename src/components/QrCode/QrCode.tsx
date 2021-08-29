import React from 'react';
import {ModalWrapper, Reoverlay} from 'reoverlay';
import QrCode from 'qrcode.react';

import './QrCode.scss';

interface ModalOptions
{
	value: string
}

function QrCodeModal(options: ModalOptions)
{
	const closeModal = () =>
	{
		Reoverlay.hideModal();
	}

	const html =
	(
		<ModalWrapper contentContainerClassName="qrcode">
			<div className="image">
				<QrCode value={options.value} size={256} />
			</div>
			<div className="description">
				{options.value}
			</div>
			<div className="button-bar">
				<button onClick={closeModal}>Close</button>
			</div>
		</ModalWrapper>
	);

	return html;
}

export default QrCodeModal;
