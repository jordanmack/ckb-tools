import { messages } from './Header.messages'

const isEthereumAddress = (address: string) => address.length === 42

const ckbRegex = new RegExp(`^(ckb|ckt)`)
const isCkbAddress = (address: string) => ckbRegex.test(address)

export const getAddressLabel = (address: string): string => {
  if (!(isEthereumAddress(address) || isCkbAddress(address))) {
    return messages.WRONG_ADDRESS
  }

  const first = address.substring(0, 6)
  const last = address.substring(address.length - 4, address.length)
  return `${first}...${last}`
}
