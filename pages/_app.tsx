import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Mitr, Itim, IBM_Plex_Sans_Thai_Looped } from "next/font/google";
import NavBar from "@/components/navbar";

const mitr = IBM_Plex_Sans_Thai_Looped({
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
});

export let theme = createTheme({
  typography: {
    fontFamily: mitr.style.fontFamily,
  },
  
});

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  return (
    <main className={mitr.className}>
      <SessionProvider session={session}>
        <ThemeProvider theme={theme}>
          <NavBar {...pageProps} />
          <Component {...pageProps} />
        </ThemeProvider>
      </SessionProvider>
    </main>
  );
}
