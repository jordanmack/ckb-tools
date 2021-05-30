import React from 'react';
import {ModalWrapper, Reoverlay} from 'reoverlay';

import './MintModal.scss';

interface ModalOptions
{
	defaultAddress?: string,
	defaultAmount?: string,
	onConfirm: (e: React.SyntheticEvent) => boolean,
}

function MintModal(options: ModalOptions)
{
	const closeModal = () =>
	{
		Reoverlay.hideModal();
	}

	const onConfirm = (e: React.SyntheticEvent) =>
	{
		if(options.onConfirm(e))
			Reoverlay.hideModal();
	};

	const html =
	(
		<ModalWrapper contentContainerClassName="mint">
			<form id="mint-token-form" onSubmit={()=>false}>
				<h2>Mint SUDT Tokens</h2>
				<p>
					Create SUDT tokens and send to the address specified.
				</p>
				<p>
					Note: This requires 142 CKBytes to create the destination cell and a 0.0001 CKByte TX fee.
				</p>
				<p>
					<label>
						Nervos CKB Address
						<input type="text" className="address" defaultValue={options.defaultAddress} />
					</label>
				</p>
				<p>
					<label>
						Token Amount
						<input type="number" className="amount" defaultValue={options.defaultAmount} />
					</label>
				</p>
				<div className="button-bar">
					<button onClick={closeModal}>Cancel</button>
					<span className="spacer" />
					<button onClick={onConfirm}>Mint and Send</button>
				</div>
			</form>
		</ModalWrapper>
	);

	return html;
}

export default MintModal;
