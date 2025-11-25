import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#FF2B29', // Red (from logo - pressure washer/polisher)
      dark: '#000000', // Black (from logo background)
      light: '#ff6659',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#00BFFF', // Cyan Blue (from logo car gradient - lighter blue)
      dark: '#0080FF', // Darker Blue (from logo car gradient - darker blue)
      light: '#40E0D0',
      contrastText: '#ffffff',
    },
    error: {
      main: '#FF2B29', // Red
      dark: '#000000',
    },
    info: {
      main: '#00BFFF', // Cyan Blue (from logo car)
      dark: '#0080FF', // Darker Blue
      light: '#87CEEB', // Sky Blue
      contrastText: '#ffffff',
    },
    text: {
      primary: '#000000', // Black (from logo)
      secondary: '#A8A8A8', // Silver-grey (from logo metallic elements)
    },
    background: {
      default: '#f5f5f5', // Light Gray
      paper: '#ffffff', // White (from logo highlights)
    },
    divider: '#C0C0C0', // Silver-grey (from logo borders)
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
})

