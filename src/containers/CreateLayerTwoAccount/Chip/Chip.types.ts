import { ReactElement } from 'react'

export interface IChipProps {
  label: string
  icon?: ReactElement
  onClick?: () => void
}
