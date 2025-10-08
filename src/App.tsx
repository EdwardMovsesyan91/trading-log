import * as React from "react";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Fade from "@mui/material/Fade";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";

import "./App.css";
import Header from "./components/Header";
import StatsRow from "./components/StatsRow";
import type { Trade } from "./types/trade";
import { listTrades } from "./api/trades";
import TradeForm from "./components/TradeForm";
import HistoryPage from "./components/TradeHistory/HistoryPage";

type TabKey = "form" | "history";

export default function App() {
  const [tab, setTab] = React.useState<TabKey>("history");
  const [stats, setStats] = React.useState({
    wins: 0,
    losses: 0,
    total: 0,
    winRate: 0,
  });

  const computeStats = React.useCallback((items: Trade[]) => {
    const total = items.length;
    const wins = items.filter((t) => t.result.startsWith("TP")).length;
    const losses = items.filter((t) => t.result.startsWith("SL")).length;
    const winRate = total ? Math.round((wins / total) * 100) : 0;
    setStats({ wins, losses, total, winRate });
  }, []);

  const refreshStats = React.useCallback(async () => {
    try {
      const items = await listTrades();
      computeStats(items);
    } catch {
      // ignore for header stats
    }
  }, [computeStats]);

  React.useEffect(() => {
    refreshStats();
  }, [refreshStats]);

  return (
    <Box>
      <Header />

      <Container
        maxWidth="lg"
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 3.5,
        }}
      >
        <StatsRow
          winRate={stats.winRate}
          losses={stats.losses}
          wins={stats.wins}
          total={stats.total}
        />

        <Box>
          <ToggleButtonGroup
            value={tab}
            exclusive
            onChange={(_, v) => v && setTab(v)}
            color="primary"
            sx={{
              "& .MuiToggleButton-root": {
                px: 2.5,
                py: 1,
                borderRadius: 999,
                textTransform: "none",
                fontWeight: 700,
              },
              "& .MuiToggleButtonGroup-grouped": {
                border: (t) => `1px solid ${t.palette.divider}`,
                mx: 0.5,
              },
            }}
          >
            <ToggleButton value="form">עסקה חדשה</ToggleButton>
            <ToggleButton value="history">היסטוריה</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Box>
          <Fade in={tab === "form"} mountOnEnter unmountOnExit>
            <Box>
              <TradeForm />
            </Box>
          </Fade>

          <Fade in={tab === "history"} mountOnEnter unmountOnExit>
            <Box>
              <HistoryPage onDeleted={refreshStats} />
            </Box>
          </Fade>
        </Box>
      </Container>
    </Box>
  );
}
