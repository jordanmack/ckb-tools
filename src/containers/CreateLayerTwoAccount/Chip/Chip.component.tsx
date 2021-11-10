import React from 'react'

import { Box, Typography } from '@material-ui/core'
import { lightGray } from '../styles/colors'

import { IChipProps } from './Chip.types'

const Chip: React.FC<IChipProps> = ({ label, icon, onClick }) => {
  return (
    <Box
      display="inline-flex"
      alignItems="center"
      maxHeight={40}
      px={2}
      py={0.5}
      borderRadius={8}
      style={{
        border: `1px solid ${lightGray}`,
        cursor: onClick ? 'pointer' : 'initial',
        justifyContent: 'center',
      }}
      onClick={onClick}
    >
      <Typography
        style={{
          whiteSpace: 'nowrap',
        }}
        color="textPrimary"
        variant="overline"
      >
        {label}
      </Typography>
      {icon && <Box ml={1}>{icon}</Box>}
    </Box>
  )
}

export default Chip
