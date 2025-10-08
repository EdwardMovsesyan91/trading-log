import * as React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Paper,
  Stack,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import TradeResultChip from "./TradeResultChip";
import type { Trade } from "../../types/trade";

function Row({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <Stack direction="row" spacing={0.5} sx={{ minWidth: 140 }}>
      <Typography variant="body2" sx={{ color: "text.secondary" }}>
        {label}:
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 700 }}>
        {value ?? "—"}
      </Typography>
    </Stack>
  );
}

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat("he-IL").format(new Date(iso));
  } catch {
    return iso;
  }
}

export default function TradeHistoryCard({
  trade,
  onDelete,
}: {
  trade: Trade;
  onDelete?: (id: string) => void;
}) {
  return (
    <Card variant="outlined" sx={{ borderRadius: 3 }}>
      <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 1,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              {trade.pair}
            </Typography>
            <TradeResultChip result={trade.result} />
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography
              variant="body2"
              sx={{ color: "error.main", cursor: "pointer" }}
              onClick={() => onDelete?.(trade.id)}
            >
              מחק
            </Typography>
            <IconButton
              size="small"
              color="error"
              onClick={() => onDelete?.(trade.id)}
            >
              <DeleteOutlineIcon />
            </IconButton>
          </Box>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(4, 1fr)" },
            gap: 1.25,
            mb: 1.5,
          }}
        >
          <Row label="תאריך" value={formatDate(trade.date)} />
          <Row label="סשן" value={trade.session} />
          <Row
            label="סוג עסקה"
            value={trade.tradeType.startsWith("לונג") ? "לונג" : "שורט"}
          />
          <Row label="יחס RR" value={trade.rr ?? "—"} />

          <Row
            label="מגמה ראשית"
            value={trade.trendMain.replace("מגמת ", "")}
          />
          <Row
            label="מגמה משנית"
            value={trade.trendSecondary.replace("מגמת ", "")}
          />
          <Row label="בלוק גדול" value={trade.tfBlock} />
          <Row label="כניסה" value={trade.tfEntry} />
        </Box>

        <Paper
          variant="outlined"
          sx={{ p: 1.25, borderRadius: 2, bgcolor: "action.hover" }}
        >
          <Stack direction="row" spacing={1}>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              הערות:
            </Typography>
            <Typography variant="body2">{trade.notes || "—"}</Typography>
          </Stack>
        </Paper>
      </CardContent>
    </Card>
  );
}
