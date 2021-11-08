export enum NetworkEnum {
  Ethereum = 'Ethereum',
  CKB = 'CKB',
  Godwoken = 'Godwoken',
  Faucet = 'Faucet',
  Layer1Testnet = 'Layer 1 Testnet Faucet'
}

export interface IAccountBox {
  network?: NetworkEnum
  address?: string
  explorerUrl?: string
}
