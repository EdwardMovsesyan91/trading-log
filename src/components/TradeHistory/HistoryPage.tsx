import * as React from "react";
import TradeHistoryList from "./TradeHistoryList";
import type { Trade } from "../../types/trade";
import { listTrades, deleteTrade } from "../../api/trades";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

export default function HistoryPage({ onDeleted }: { onDeleted?: () => void }) {
  const [data, setData] = React.useState<Trade[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [confirmId, setConfirmId] = React.useState<string | null>(null);
  const [snack, setSnack] = React.useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const load = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const items = await listTrades();
      setData(items);
    } catch (e: any) {
      setError(e?.message || "שגיאה בטעינת נתונים");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  async function handleDeleteRequest(id: string) {
    setConfirmId(id);
  }

  async function confirmDelete() {
    if (!confirmId) return;
    try {
      await deleteTrade(confirmId);
      setData((d) => d.filter((x) => x.id !== confirmId));
      setSnack({
        open: true,
        message: "העסקה נמחקה בהצלחה",
        severity: "success",
      });
      onDeleted?.();
    } catch (e: any) {
      setSnack({
        open: true,
        message: e?.message || "מחיקה נכשלה",
        severity: "error",
      });
    } finally {
      setConfirmId(null);
    }
  }

  return (
    <>
      <TradeHistoryList
        trades={data}
        onDelete={handleDeleteRequest}
        title={loading ? "טוען…" : error ? error : "היסטוריית עסקאות"}
      />

      <Dialog open={!!confirmId} onClose={() => setConfirmId(null)}>
        <DialogTitle>לאשר מחיקה?</DialogTitle>
        <DialogContent>האם אתה בטוח שברצונך למחוק את העסקה הזו?</DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmId(null)}>ביטול</Button>
          <Button color="error" variant="contained" onClick={confirmDelete}>
            מחק
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          severity={snack.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </>
  );
}
