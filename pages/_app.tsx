import type { AppProps } from 'next/app'
import {ThemeProvider, createTheme, CssBaseline} from '@mui/material';

export const darkTheme = createTheme({ palette: { mode: 'dark' } });


function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Component {...pageProps} />
    </ThemeProvider>
  )
}

export default MyApp
