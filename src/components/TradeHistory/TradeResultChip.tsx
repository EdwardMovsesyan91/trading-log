import Chip from "@mui/material/Chip";
import type { TradeResult } from "../../types/trade";

export default function TradeResultChip({ result }: { result: TradeResult }) {
  const success = result.startsWith("TP");
  return (
    <Chip
      label={success ? "רווח" : "הפסד"}
      color={success ? "success" : "error"}
      size="small"
      sx={{ fontWeight: 700 }}
    />
  );
}
