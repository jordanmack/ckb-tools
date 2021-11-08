import React from 'react'

import { Box, Typography } from '@material-ui/core'
import MUIButton from '@material-ui/core/Button'
import { useTheme } from '@material-ui/core/styles'

import { IIconButtonProps } from './IconButton.types'

const IconButton: React.FC<IIconButtonProps> = ({ icon, text, ...rest }) => {
  const { spacing } = useTheme()

  return (
    <MUIButton
      color="primary"
      variant="outlined"
      style={{ borderRadius: spacing(0.5) }}
      {...rest}
    >
      <Box display="flex" alignItems="end">
        <img
          style={{ height: 24, width: 16, marginRight: 12, color: 'white' }}
          src={icon}
        />
        <Typography variant="body2" style={{ textTransform: 'none' }}>
          {text}
        </Typography>
      </Box>
    </MUIButton>
  )
}

export default IconButton
