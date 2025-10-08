import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { CacheProvider } from "@emotion/react";
import React from "react";
import { heIL } from "@mui/material/locale";
import { useThemeStore } from "../stores/useThemeStore";
import createCache from "@emotion/cache";
import { prefixer } from "stylis";
import rtlPlugin from "stylis-plugin-rtl";

export default function AppRoot({ children }: { children: React.ReactNode }) {
  const createRtlCache = () =>
    createCache({
      key: "muirtl",
      stylisPlugins: [prefixer, rtlPlugin],
    });

  const cacheRtl = createRtlCache();
  const mode = useThemeStore((s) => s.mode);

  const theme = React.useMemo(
    () =>
      createTheme(
        {
          direction: "rtl",
          palette: { mode },
          typography: {
            fontFamily:
              '"Heebo Variable", system-ui, -apple-system, "Segoe UI", Roboto, Arial',
            h4: { fontWeight: 700, letterSpacing: 0, lineHeight: 1.15 },
            subtitle1: { fontWeight: 500, letterSpacing: 0.1, lineHeight: 1.4 },
          },
          shape: {},
        },
        heIL
      ),
    [mode]
  );

  return (
    <CacheProvider value={cacheRtl}>
      <ThemeProvider theme={theme}>
        <CssBaseline enableColorScheme />
        {children}
      </ThemeProvider>
    </CacheProvider>
  );
}
