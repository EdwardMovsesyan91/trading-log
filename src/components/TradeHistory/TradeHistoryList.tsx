import * as React from "react";
import { Box, Stack, Typography } from "@mui/material";
import { type TradeFiltersValue } from "./TradeFilters";
import TradeHistoryCard from "./TradeHistoryCard";
import type { Trade } from "../../types/trade";

function parseRR(rr?: string): number | null {
  if (!rr) return null;
  const m = rr.match(/^\s*(\d+)\s*:\s*(\d+)\s*$/);
  if (!m) return null;
  const a = Number(m[1]),
    b = Number(m[2]);
  if (!b) return null;
  return a / b; // risk:reward numeric ratio
}

export default function TradeHistoryList({
  trades,
  onDelete,
  title = "היסטוריית עסקאות",
}: {
  trades: Trade[];
  onDelete?: (id: string) => void;
  title?: string;
}) {
  const [filters] = React.useState<TradeFiltersValue>({
    sortBy: "dateDesc",
    from: null,
    to: null,
  });

  const filtered = React.useMemo(() => {
    return trades.filter((t) => {
      if (filters.session && t.session !== filters.session) return false;
      if (filters.pair && t.pair !== filters.pair) return false;
      if (filters.tradeType && t.tradeType !== filters.tradeType) return false;
      if (filters.result && t.result !== filters.result) return false;
      if (filters.from && new Date(t.date) < filters.from) return false;
      if (filters.to && new Date(t.date) > filters.to) return false;
      return true;
    });
  }, [trades, filters]);

  const items = React.useMemo(() => {
    const arr = [...filtered];
    switch (filters.sortBy) {
      case "dateAsc":
        arr.sort((a, b) => +new Date(a.date) - +new Date(b.date));
        break;
      case "rrDesc":
        arr.sort(
          (a, b) => (parseRR(b.rr) ?? -Infinity) - (parseRR(a.rr) ?? -Infinity)
        );
        break;
      case "rrAsc":
        arr.sort(
          (a, b) => (parseRR(a.rr) ?? +Infinity) - (parseRR(b.rr) ?? +Infinity)
        );
        break;
      case "result":
        arr.sort((a, b) => {
          const ra = a.result.startsWith("TP") ? 0 : 1;
          const rb = b.result.startsWith("TP") ? 0 : 1;
          return ra - rb || +new Date(b.date) - +new Date(a.date);
        });
        break;
      case "dateDesc":
      default:
        arr.sort((a, b) => +new Date(b.date) - +new Date(a.date));
    }
    return arr;
  }, [filtered, filters.sortBy]);

  return (
    <Box>
      <Stack sx={{ margin: "0 22px 22px 0" }}>
        <Typography variant="h5">{title}</Typography>
      </Stack>

      <Stack gap={2}>
        {items.map((t) => (
          <TradeHistoryCard key={t.id} trade={t} onDelete={onDelete} />
        ))}
        {!items.length && (
          <Typography
            sx={{ color: "text.secondary", textAlign: "center", py: 4 }}
          >
            עדיין לא נוספו עסקאות תואמות למסננים
          </Typography>
        )}
      </Stack>
    </Box>
  );
}
