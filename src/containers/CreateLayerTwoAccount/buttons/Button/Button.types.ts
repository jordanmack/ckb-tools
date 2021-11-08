import { ReactElement } from 'react'

import { ButtonProps } from '@material-ui/core/Button'

export interface IButtonProps extends ButtonProps {
  text: string | ReactElement
  isFetching?: boolean
}
