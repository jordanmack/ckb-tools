import React from 'react'

import { CircularProgress } from '@material-ui/core'
import MUIButton from '@material-ui/core/Button'
import { useTheme } from '@material-ui/core/styles'

import { IButtonProps } from './Button.types'

const Button: React.FC<IButtonProps> = ({
  text,
  isFetching,
  disabled,
  ...rest
}) => {
  const { spacing } = useTheme()
  return (
    <MUIButton
      color="primary"
      variant="contained"
      disabled={isFetching ? true : disabled}
      style={{ borderRadius: spacing(1) }}
      {...rest}
    >
      {isFetching ? <CircularProgress color="primary" /> : text}
    </MUIButton>
  )
}

export default Button
