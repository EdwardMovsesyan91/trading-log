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
  TextField,
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import TradeResultChip from "./TradeResultChip";
import type { Trade } from "../../types/trade";
import { updateTrade } from "../../api/trades";
import { uploadScreenshot } from "../../helpers/uploadScreenshot";

// ===== options =====
const SESSIONS = ["לונדון", "ניו-יורק"] as const;
const PAIRS = ["EUR-USD", "GBP-USD"] as const;
const TREND_MAIN = ["מגמת עליות", "מגמת ירידות"] as const;
const TREND_SECONDARY = ["מגמת עליות", "מגמת ירידות"] as const;
const TF_BLOCK = ["4H", "1H", "30m", "15m"] as const;
const TF_ENTRY = ["15m", "5m", "3m", "1m"] as const;
const TRADE_TYPES = ["לונג 🟢", "שורט 🔴"] as const;
const RESULTS = ["TP ✅", "SL ❌"] as const;

// ===== compact inputs =====
const CompactFieldSx = {
  minWidth: 0,
  "& .MuiOutlinedInput-input": { py: 0.25, px: 1 },
  "& .MuiInputBase-input": { fontSize: 14 },
  "& .MuiInputLabel-root": { fontSize: 12 },
};

function CompactTextField(props: any) {
  return (
    <TextField size="small" variant="outlined" sx={CompactFieldSx} {...props} />
  );
}

// InputLabel is optional now; if no label passed → no label rendered
function CompactSelect({
  label,
  children,
  ...rest
}: React.PropsWithChildren<{ label?: string } & any>) {
  return (
    <FormControl size="small" sx={{ minWidth: 0, ...CompactFieldSx }}>
      {label ? <InputLabel sx={{ fontSize: 12 }}>{label}</InputLabel> : null}
      <Select label={label} {...rest}>
        {children}
      </Select>
    </FormControl>
  );
}

// ===== label-in-view, input-in-edit =====
function EditRow({
  editing,
  label,
  view,
  input,
}: {
  editing: boolean;
  label: string;
  view: React.ReactNode;
  input: React.ReactNode;
}) {
  return (
    <Stack
      direction="row"
      spacing={0.5}
      sx={{ minWidth: 140, alignItems: "center" }}
    >
      {!editing && (
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {label}
        </Typography>
      )}
      {editing ? (
        input
      ) : (
        <Typography variant="body2" sx={{ fontWeight: 700 }}>
          {view}
        </Typography>
      )}
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
const toDateInput = (iso: string) => {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
const fromDateInput = (v: string) => (v ? new Date(v).toISOString() : "");

export default function TradeHistoryCard({
  trade,
  onDelete,
  onUpload,
}: {
  trade: Trade;
  onDelete?: (id: string) => void;
  onUpload?: (file: File) => Promise<{ url: string; publicId?: string }>;
}) {
  const initialImageUrl =
    (trade as any).image?.secureUrl ||
    (trade as any).imageUrl ||
    (trade as any).screenshotUrl ||
    "";

  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [form, setForm] = React.useState<Trade>(trade);
  const [imageUrl, setImageUrl] = React.useState<string>(initialImageUrl);
  const fileRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    setForm(trade);
    setImageUrl(initialImageUrl);
  }, [trade]); // eslint-disable-line

  const hasImage = Boolean(imageUrl);
  const ch = <K extends keyof Trade>(k: K, v: Trade[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  async function save() {
    setSaving(true);
    try {
      // 1) Upload new image if selected
      let uploaded: { secureUrl?: string; publicId?: string } = {};
      if (fileRef.current?.files?.[0]) {
        const file = fileRef.current.files[0];
        const up = await uploadScreenshot(file, {
          publicId: (form as any).screenshotId
            ? (form as any).screenshotId
            : `trades/${form.id}`,
          overwrite: true,
          invalidate: true,
        });
        uploaded = { secureUrl: up.secureUrl, publicId: up.publicId };
      }

      // 2) Strip non-editable keys
      const { _id, id, createdAt, updatedAt, ...editable } = form as any;

      const payload = {
        ...editable,
        ...(uploaded.secureUrl && { screenshotUrl: uploaded.secureUrl }),
        ...(uploaded.publicId && { screenshotId: uploaded.publicId }),
      };

      const updated = await updateTrade(form.id, payload);
      setForm(updated);
      setImageUrl(updated.screenshotUrl || imageUrl);
      setEditing(false);
    } catch (err: any) {
      console.error("Failed to update trade:", err);
      alert(err.message || "שגיאה בעדכון העסקה");
    } finally {
      setSaving(false);
    }
  }

  function cancel() {
    setForm(trade);
    setImageUrl(initialImageUrl);
    setEditing(false);
  }

  async function pickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (onUpload) {
      const { url } = await onUpload(f);
      setImageUrl(url);
    } else {
      setImageUrl(URL.createObjectURL(f)); // preview only
    }
  }

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
              {/* Pair: select in edit, h6 in view (no label in edit) */}
              {editing ? (
                <CompactSelect
                  value={form.pair || ""}
                  onChange={(e) => ch("pair", e.target.value as any)}
                >
                  {PAIRS.map((p) => (
                    <MenuItem key={p} value={p}>
                      {p}
                    </MenuItem>
                  ))}
                </CompactSelect>
              ) : (
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  {form.pair}
                </Typography>
              )}

              {/* Result */}
              {editing ? (
                <CompactSelect
                  value={form.result || ""}
                  onChange={(e) => ch("result", e.target.value as any)}
                >
                  {RESULTS.map((r) => (
                    <MenuItem key={r} value={r}>
                      {r}
                    </MenuItem>
                  ))}
                </CompactSelect>
              ) : (
                <TradeResultChip result={form.result} />
              )}

              {/* Image preview + replace */}
              {hasImage && (
                <Tooltip title="תצוגת תמונה">
                  <IconButton size="small" onClick={() => setOpen(true)}>
                    <ImageOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              {editing && (
                <>
                  <input
                    ref={fileRef}
                    hidden
                    type="file"
                    accept="image/*"
                    onChange={pickFile}
                  />
                  <Tooltip title="החלף תמונה">
                    <IconButton
                      size="small"
                      onClick={() => fileRef.current?.click()}
                    >
                      <UploadFileOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </>
              )}
            </Box>

            {!editing && (
              <Paper
                elevation={0}
                variant="outlined"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.25,
                  px: 0.5,
                  py: 0.25,
                  borderRadius: 999,
                  bgcolor: "action.hover",
                  borderColor: "divider",
                }}
              >
                <Tooltip title="ערוך">
                  <IconButton
                    size="small"
                    onClick={() => setEditing(true)}
                    sx={{ p: 0.5, "&:hover": { bgcolor: "action.selected" } }}
                  >
                    <EditOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>

                <Box
                  sx={{
                    width: 1,
                    height: 18,
                    bgcolor: "divider",
                    borderRadius: 1,
                  }}
                />

                <Tooltip title="מחק">
                  <IconButton
                    size="small"
                    onClick={() => onDelete?.(form.id)}
                    sx={{
                      p: 0.5,
                      color: "error.main",
                      "&:hover": { bgcolor: "action.selected" },
                    }}
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Paper>
            )}
          </Box>

          {/* grid */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(4, 1fr)" },
              gap: 1.25,
              mb: 1.5,
            }}
          >
            {/* Date */}
            <EditRow
              editing={editing}
              label="תאריך"
              view={formatDate(form.date)}
              input={
                <CompactTextField
                  type="date"
                  value={toDateInput(form.date)}
                  onChange={(e) =>
                    ch("date", fromDateInput(e.target.value) as any)
                  }
                  InputLabelProps={{ shrink: true }}
                />
              }
            />
            {/* Session */}
            <EditRow
              editing={editing}
              label="סשן"
              view={form.session}
              input={
                <CompactSelect
                  value={form.session || ""}
                  onChange={(e) => ch("session", e.target.value as any)}
                >
                  {SESSIONS.map((s) => (
                    <MenuItem key={s} value={s}>
                      {s}
                    </MenuItem>
                  ))}
                </CompactSelect>
              }
            />
            {/* Trade Type */}
            <EditRow
              editing={editing}
              label="סוג עסקה"
              view={form.tradeType?.startsWith("לונג") ? "לונג" : "שורט"}
              input={
                <CompactSelect
                  value={form.tradeType || ""}
                  onChange={(e) => ch("tradeType", e.target.value as any)}
                >
                  {TRADE_TYPES.map((t) => (
                    <MenuItem key={t} value={t}>
                      {t}
                    </MenuItem>
                  ))}
                </CompactSelect>
              }
            />
            {/* RR (left as free text — provide options if you have them) */}
            <EditRow
              editing={editing}
              label="יחס RR"
              view={form.rr ?? "—"}
              input={
                <CompactTextField
                  type="text"
                  value={form.rr ?? ""}
                  onChange={(e) => ch("rr", e.target.value as any)}
                />
              }
            />
            {/* Trend Main */}
            <EditRow
              editing={editing}
              label="מגמה ראשית"
              view={form.trendMain?.replace("מגמת ", "")}
              input={
                <CompactSelect
                  value={form.trendMain || ""}
                  onChange={(e) => ch("trendMain", e.target.value as any)}
                >
                  {TREND_MAIN.map((t) => (
                    <MenuItem key={t} value={t}>
                      {t}
                    </MenuItem>
                  ))}
                </CompactSelect>
              }
            />
            {/* Trend Secondary */}
            <EditRow
              editing={editing}
              label="מגמה משנית"
              view={form.trendSecondary?.replace("מגמת ", "")}
              input={
                <CompactSelect
                  value={form.trendSecondary || ""}
                  onChange={(e) => ch("trendSecondary", e.target.value as any)}
                >
                  {TREND_SECONDARY.map((t) => (
                    <MenuItem key={t} value={t}>
                      {t}
                    </MenuItem>
                  ))}
                </CompactSelect>
              }
            />
            {/* TF Block */}
            <EditRow
              editing={editing}
              label="בלוק גדול"
              view={form.tfBlock}
              input={
                <CompactSelect
                  value={form.tfBlock || ""}
                  onChange={(e) => ch("tfBlock", e.target.value as any)}
                >
                  {TF_BLOCK.map((t) => (
                    <MenuItem key={t} value={t}>
                      {t}
                    </MenuItem>
                  ))}
                </CompactSelect>
              }
            />
            {/* TF Entry */}
            <EditRow
              editing={editing}
              label="כניסה"
              view={form.tfEntry}
              input={
                <CompactSelect
                  value={form.tfEntry || ""}
                  onChange={(e) => ch("tfEntry", e.target.value as any)}
                >
                  {TF_ENTRY.map((t) => (
                    <MenuItem key={t} value={t}>
                      {t}
                    </MenuItem>
                  ))}
                </CompactSelect>
              }
            />
          </Box>

          {/* notes */}
          <Paper
            variant="outlined"
            sx={{ p: 1, borderRadius: 2, bgcolor: "action.hover" }}
          >
            {editing ? (
              <CompactTextField
                fullWidth
                multiline
                minRows={2}
                value={form.notes || ""}
                onChange={(e) => ch("notes", e.target.value as any)}
                InputProps={{
                  sx: {
                    fontSize: 14,
                    display: "flex",
                    alignItems: "center",
                    py: 0.5,
                  },
                }}
              />
            ) : (
              <Stack direction="row" spacing={1}>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  הערות:
                </Typography>
                <Typography variant="body2">{form.notes || "—"}</Typography>
              </Stack>
            )}
          </Paper>

          {editing && (
            <Box
              sx={{
                mt: 1,
                display: "flex",
                gap: 1,
                justifyContent: "flex-end",
              }}
            >
              <Button size="small" onClick={cancel} disabled={saving}>
                ביטול
              </Button>
              <Button
                size="small"
                variant="contained"
                onClick={save}
                disabled={saving}
              >
                {saving ? "שומר..." : "שמירה"}
              </Button>
            </Box>
          )}
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
              src={imageUrl}
              alt="Trade screenshot"
              sx={{
                width: "100%",
                height: "auto",
                maxHeight: 600,
                objectFit: "contain",
                borderRadius: 2,
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
