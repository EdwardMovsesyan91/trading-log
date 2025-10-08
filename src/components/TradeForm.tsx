import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import SaveIcon from "@mui/icons-material/Save";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { he } from "date-fns/locale";
import Grid from "@mui/material/Grid";
import { createTrade } from "../api/trades";
import Stack from "@mui/material/Stack";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

const SESSIONS = ["לונדון", "ניו-יורק"] as const;
const PAIRS = ["EUR-USD", "GBP-USD"] as const;
const TREND_MAIN = ["מגמת עליות", "מגמת ירידות"] as const;
const TREND_SECONDARY = ["מגמת עליות", "מגמת ירידות"] as const;
const TF_BLOCK = ["4H", "1H", "30m", "15m"] as const;
const TF_ENTRY = ["15m", "5m", "3m", "1m"] as const;
const TRADE_TYPES = ["לונג 🟢", "שורט 🔴"] as const;
const RESULTS = ["TP ✅", "SL ❌"] as const;

const schema = z.object({
  date: z
    .date({ error: "יש לבחור תאריך" })
    .nullable()
    .refine((v) => v != null, { message: "יש לבחור תאריך" }),
  session: z.enum(SESSIONS, { error: "בחר סשן" }),
  pair: z.enum(PAIRS, { error: "בחר צמד" }),
  trendMain: z.enum(TREND_MAIN, { error: "בחר מגמה ראשית" }),
  trendSecondary: z.enum(TREND_SECONDARY, { error: "בחר מגמה משנית" }),
  tfBlock: z.enum(TF_BLOCK, { error: "בחר טיים פריים בלוק גדול" }),
  tfEntry: z.enum(TF_ENTRY, { error: "בחר טיים פריים כניסה" }),
  tradeType: z.enum(TRADE_TYPES, { error: "בחר סוג עסקה" }),
  result: z.enum(RESULTS, { error: "בחר תוצאה" }),
  rr: z.string().optional(),
  notes: z.string().max(1000).optional(),
  screenshot: z
    .any()
    .refine(
      (f) =>
        !f ||
        f instanceof File ||
        (Array.isArray(f) && f[0] instanceof File) ||
        (f as FileList)?.length >= 0,
      "קובץ לא תקין"
    )
    .optional(),
});

type FormValues = z.infer<typeof schema>;

export default function TradeForm({ onSuccess }: { onSuccess?: () => void }) {
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues: {
      date: null,
      session: undefined as unknown as FormValues["session"],
      pair: undefined as unknown as FormValues["pair"],
      trendMain: undefined as unknown as FormValues["trendMain"],
      trendSecondary: undefined as unknown as FormValues["trendSecondary"],
      tfBlock: undefined as unknown as FormValues["tfBlock"],
      tfEntry: undefined as unknown as FormValues["tfEntry"],
      tradeType: undefined as unknown as FormValues["tradeType"],
      rr: "",
      result: undefined as unknown as FormValues["result"],
      notes: "",
      screenshot: undefined,
    },
  });
  const [snack, setSnack] = React.useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });
  const [formKey, setFormKey] = React.useState(0);

  async function onSubmit(values: FormValues) {
    if (!values.date) {
      setSnack({ open: true, message: "יש לבחור תאריך", severity: "error" });
      return;
    }
    const payload = {
      date: (values.date as Date).toISOString(),
      session: values.session,
      pair: values.pair,
      trendMain: values.trendMain,
      trendSecondary: values.trendSecondary,
      tfBlock: values.tfBlock,
      tfEntry: values.tfEntry,
      tradeType: values.tradeType,
      rr: values.rr || undefined,
      result: values.result,
      notes: values.notes || undefined,
      // screenshot upload is not wired yet
      screenshotUrl: undefined as string | undefined,
    } as const;

    try {
      await createTrade(payload as any);
      onSuccess?.();
      reset(
        {
          date: null,
          session: undefined as unknown as FormValues["session"],
          pair: undefined as unknown as FormValues["pair"],
          trendMain: undefined as unknown as FormValues["trendMain"],
          trendSecondary: undefined as unknown as FormValues["trendSecondary"],
          tfBlock: undefined as unknown as FormValues["tfBlock"],
          tfEntry: undefined as unknown as FormValues["tfEntry"],
          tradeType: undefined as unknown as FormValues["tradeType"],
          rr: "",
          result: undefined as unknown as FormValues["result"],
          notes: "",
          screenshot: undefined,
        },
        { keepValues: false }
      );
      setFormKey((k) => k + 1);
      setSnack({
        open: true,
        message: "העסקה נשמרה בהצלחה",
        severity: "success",
      });
    } catch (e: any) {
      setSnack({
        open: true,
        message: e?.message || "שמירה נכשלה",
        severity: "error",
      });
    }
  }

  return (
    <LocalizationProvider
      dateAdapter={AdapterDateFns}
      adapterLocale={he}
      localeText={{
        cancelButtonLabel: "ביטול",
        okButtonLabel: "אישור",
        todayButtonLabel: "היום",
      }}
    >
      <Container key={formKey} maxWidth="lg" disableGutters>
        <Stack sx={{ margin: "0 22px 22px 0" }}>
          <Typography variant="h5">עסקה חדשה</Typography>
        </Stack>

        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Controller
              control={control}
              name="date"
              render={({ field }) => (
                <DatePicker
                  label="תאריך"
                  value={field.value}
                  onChange={field.onChange}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!errors.date,
                      helperText: errors.date?.message,
                    },
                  }}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              select
              fullWidth
              label="סשן"
              defaultValue=""
              error={!!errors.session}
              helperText={errors.session?.message}
              {...register("session")}
            >
              {SESSIONS.map((opt) => (
                <MenuItem key={opt} value={opt}>
                  {opt}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              select
              fullWidth
              label="צמד"
              defaultValue=""
              error={!!errors.pair}
              helperText={errors.pair?.message}
              {...register("pair")}
            >
              {PAIRS.map((opt) => (
                <MenuItem key={opt} value={opt}>
                  {opt}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              select
              fullWidth
              label="מגמה ראשית"
              defaultValue=""
              error={!!errors.trendMain}
              helperText={errors.trendMain?.message}
              {...register("trendMain")}
            >
              {TREND_MAIN.map((opt) => (
                <MenuItem key={opt} value={opt}>
                  {opt}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              select
              fullWidth
              label="מגמה משנית"
              defaultValue=""
              error={!!errors.trendSecondary}
              helperText={errors.trendSecondary?.message}
              {...register("trendSecondary")}
            >
              {TREND_SECONDARY.map((opt) => (
                <MenuItem key={opt} value={opt}>
                  {opt}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              select
              fullWidth
              label="טיים פריים בלוק גדול"
              defaultValue=""
              error={!!errors.tfBlock}
              helperText={errors.tfBlock?.message}
              {...register("tfBlock")}
            >
              {TF_BLOCK.map((opt) => (
                <MenuItem key={opt} value={opt}>
                  {opt}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              select
              fullWidth
              label="טיים פריים כניסה"
              defaultValue=""
              error={!!errors.tfEntry}
              helperText={errors.tfEntry?.message}
              {...register("tfEntry")}
            >
              {TF_ENTRY.map((opt) => (
                <MenuItem key={opt} value={opt}>
                  {opt}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              select
              fullWidth
              label="סוג עסקה"
              defaultValue=""
              error={!!errors.tradeType}
              helperText={errors.tradeType?.message}
              {...register("tradeType")}
            >
              {TRADE_TYPES.map((opt) => (
                <MenuItem key={opt} value={opt}>
                  {opt}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              label="יחס RR"
              placeholder="לדוגמה: 1:2"
              error={!!errors.rr}
              helperText={errors.rr?.message}
              {...register("rr")}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              select
              fullWidth
              label="תוצאה"
              defaultValue=""
              error={!!errors.result}
              helperText={errors.result?.message}
              {...register("result")}
            >
              {RESULTS.map((opt) => (
                <MenuItem key={opt} value={opt}>
                  {opt}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={12}>
            <TextField
              fullWidth
              multiline
              minRows={3}
              label="הערות"
              placeholder="הערות נוספות על העסקה…"
              error={!!errors.notes}
              helperText={errors.notes?.message}
              {...register("notes")}
            />
          </Grid>

          <Grid size={12}>
            <Box>
              <Button
                component="label"
                variant="outlined"
                startIcon={<UploadFileIcon />}
                sx={{ borderRadius: 2 }}
              >
                העלאת צילום מסך
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  {...register("screenshot")}
                />
              </Button>
              {errors.screenshot && (
                <Typography color="error" variant="caption" sx={{ mx: 1 }}>
                  {errors.screenshot.message as string}
                </Typography>
              )}
            </Box>
          </Grid>

          <Grid size={12}>
            <Button
              type="submit"
              onClick={handleSubmit(onSubmit)}
              disabled={isSubmitting || !isDirty}
              fullWidth
              size="large"
              variant="contained"
              endIcon={<SaveIcon />}
              sx={{ borderRadius: 3, mb: 4 }}
            >
              שמור עסקה
            </Button>
          </Grid>
        </Grid>
      </Container>
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
    </LocalizationProvider>
  );
}
