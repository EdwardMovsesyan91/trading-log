import * as React from "react";
import { Box, Paper, Typography } from "@mui/material";
import type { Trade } from "../../types/trade";

export function calcMetrics(trades: Trade[]) {
  const total = trades.length;
  const wins = trades.filter((t) => t.result.startsWith("TP")).length;
  const losses = trades.filter((t) => t.result.startsWith("SL")).length;
  const winRate = total ? Math.round((wins / total) * 100) : 0;
  return { total, wins, losses, winRate };
}

export default function MetricsBar({ items }: { items: Trade[] }) {
  const m = React.useMemo(() => calcMetrics(items), [items]);
  const Cell = ({
    label,
    value,
  }: {
    label: string;
    value: React.ReactNode;
  }) => (
    <Paper
      sx={{ px: 2, py: 1, borderRadius: 2 }}
      elevation={0}
      variant="outlined"
    >
      <Typography variant="caption" sx={{ color: "text.secondary" }}>
        {label}
      </Typography>
      <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1 }}>
        {value}
      </Typography>
    </Paper>
  );
  return (
    <Box
      sx={{
        display: "flex",
        gap: 1.5,
        flexWrap: "wrap",
        mb: 1.5,
      }}
    >
      <Cell label="סה״כ עסקאות" value={m.total} />
      <Cell label="עסקאות רווחיות" value={m.wins} />
      <Cell label="עסקאות הפסד" value={m.losses} />
      <Cell label="Win Rate" value={`${m.winRate}%`} />
    </Box>
  );
}
