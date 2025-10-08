import * as React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Dialog,
  DialogContent,
  Fade,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
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

/** If the url is a Cloudinary upload URL, inject a small thumbnail transform.
 * Example: …/upload/ → …/upload/f_auto,q_auto,w_300,h_170,c_fill/
 */
function toThumb(url: string, t = "f_auto,q_auto,w_300,h_170,c_fill") {
  return url.includes("/upload/")
    ? url.replace("/upload/", `/upload/${t}/`)
    : url;
}

export default function TradeHistoryCard({
  trade,
  onDelete,
}: {
  trade: Trade;
  onDelete?: (id: string) => void;
}) {
  // Adjust these accessors to your actual field names:
  const fullImageUrl =
    (trade as any).image?.secureUrl ||
    (trade as any).imageUrl ||
    (trade as any).screenshotUrl ||
    "";

  const hasImage = Boolean(fullImageUrl);
  const thumbUrl = hasImage ? toThumb(fullImageUrl) : "";

  const [open, setOpen] = React.useState(false);

  return (
    <>
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
              {hasImage && (
                <Tooltip title="תצוגת תמונה">
                  <IconButton size="small" onClick={() => setOpen(true)}>
                    <ImageOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <IconButton
                size="small"
                color="error"
                onClick={() => onDelete?.(trade.id)}
              >
                <DeleteOutlineIcon />
              </IconButton>
            </Box>
          </Box>

          {/* Info grid */}
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
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="md"
        TransitionComponent={Fade}
        TransitionProps={{ timeout: 220 }}
      >
        <DialogContent
          sx={{
            p: 0,
            bgcolor: "black",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {hasImage && (
            <Box
              component="img"
              src={fullImageUrl}
              alt="תמונת עסקה"
              sx={{
                maxWidth: "100%",
                maxHeight: "80vh",
                display: "block",
                m: "auto",
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
