import { TextField, MenuItem, IconButton, Tooltip, Stack } from "@mui/material";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import SortIcon from "@mui/icons-material/Sort";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { he } from "date-fns/locale";
import type { Pair, Session, TradeResult, TradeType } from "../../types/trade";

export type SortKey = "dateDesc" | "dateAsc" | "rrDesc" | "rrAsc" | "result";

export interface TradeFiltersValue {
  session?: Session;
  pair?: Pair;
  tradeType?: TradeType;
  result?: TradeResult;
  from?: Date | null;
  to?: Date | null;
  sortBy: SortKey;
}

const SESSIONS: Session[] = ["לונדון", "ניו-יורק"];
const PAIRS: Pair[] = ["EUR-USD", "GBP-USD"];
const RESULTS: TradeResult[] = ["TP ✅", "SL ❌"];

export default function TradeFilters({
  value,
  onChange,
}: {
  value: TradeFiltersValue;
  onChange: (v: TradeFiltersValue) => void;
}) {
  const set = <K extends keyof TradeFiltersValue>(
    k: K,
    v: TradeFiltersValue[K]
  ) => onChange({ ...value, [k]: v });

  const reset = () => onChange({ sortBy: "dateDesc", from: null, to: null });

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={he}>
      <Stack
        dir="rtl"
        direction="row"
        spacing={1.5}
        flexWrap="wrap"
        sx={{ mb: 2 }}
      >
        <TextField
          select
          label="סשן"
          size="small"
          sx={{ minWidth: 150 }}
          value={value.session ?? ""}
          onChange={(e) =>
            set("session", (e.target.value as Session) || undefined)
          }
        >
          <MenuItem value="">{`הכל`}</MenuItem>
          {SESSIONS.map((s) => (
            <MenuItem key={s} value={s}>
              {s}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="צמד"
          size="small"
          sx={{ minWidth: 150 }}
          value={value.pair ?? ""}
          onChange={(e) => set("pair", (e.target.value as Pair) || undefined)}
        >
          <MenuItem value="">{`הכל`}</MenuItem>
          {PAIRS.map((p) => (
            <MenuItem key={p} value={p}>
              {p}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="סוג עסקה"
          size="small"
          sx={{ minWidth: 150 }}
          value={value.tradeType ?? ""}
          onChange={(e) =>
            set("tradeType", (e.target.value as TradeType) || undefined)
          }
        >
          <MenuItem value="">{`הכל`}</MenuItem>
          {["לונג🟢", "שורט🔴"].map((t) => (
            <MenuItem key={t} value={t}>
              {t}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="תוצאה"
          size="small"
          sx={{ minWidth: 140 }}
          value={value.result ?? ""}
          onChange={(e) =>
            set("result", (e.target.value as TradeResult) || undefined)
          }
        >
          <MenuItem value="">{`הכל`}</MenuItem>
          {RESULTS.map((r) => (
            <MenuItem key={r} value={r}>
              {r}
            </MenuItem>
          ))}
        </TextField>

        <DatePicker
          label="מתאריך"
          value={value.from ?? null}
          onChange={(d) => set("from", d)}
          slotProps={{ textField: { size: "small" } }}
        />
        <DatePicker
          label="עד תאריך"
          value={value.to ?? null}
          onChange={(d) => set("to", d)}
          slotProps={{ textField: { size: "small" } }}
        />

        <TextField
          select
          size="small"
          label="מיון"
          sx={{ minWidth: 160 }}
          value={value.sortBy}
          onChange={(e) => set("sortBy", e.target.value as SortKey)}
          InputProps={{ endAdornment: <SortIcon fontSize="small" /> }}
        >
          <MenuItem value="dateDesc">תאריך ↓ (חדש קודם)</MenuItem>
          <MenuItem value="dateAsc">תאריך ↑ (ישן קודם)</MenuItem>
          <MenuItem value="rrDesc">RR ↓</MenuItem>
          <MenuItem value="rrAsc">RR ↑</MenuItem>
          <MenuItem value="result">תוצאה (רווח → הפסד)</MenuItem>
        </TextField>

        <Tooltip title="איפוס">
          <IconButton onClick={reset} size="small">
            <RestartAltIcon />
          </IconButton>
        </Tooltip>
      </Stack>
    </LocalizationProvider>
  );
}
