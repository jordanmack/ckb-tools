import React from 'react'

import { createTheme } from '@material-ui/core'
import MUIThemeProvider from '@material-ui/styles/ThemeProvider'
import {
  amaranth,
  blueBayoux,
  nervosGreen,
  outrageousOrange,
  porcelain,
  white,
} from '../colors'

const theme = createTheme({
  props: {
    MuiButtonBase: {
      disableRipple: true,
    },
    MuiCheckbox: {
      disableRipple: true,
    },
    MuiRadio: {
      disableRipple: true,
    },
  },
  palette: {
    primary: {
      main: nervosGreen,
    },
    secondary: {
      main: outrageousOrange,
    },
    text: {
      primary: nervosGreen,
      secondary: blueBayoux,
    },
    error: {
      main: amaranth,
    },
    background: {
      default: porcelain,
      paper: white,
    },
    common: {
      white: white,
    },
  }
})

export const ThemeProvider: React.FC = ({ children }) => (
  <MUIThemeProvider theme={theme}>
    {children}
  </MUIThemeProvider>
)
