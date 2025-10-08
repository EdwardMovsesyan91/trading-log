import StatCard from "./StatCard";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";
import CloseIcon from "@mui/icons-material/Close";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import Grid from "@mui/material/Grid";

export interface StatsRowProps {
  winRate: number; // 0..100
  losses: number;
  wins: number;
  total: number;
}

function formatPercent(n: number) {
  const clamped = Math.max(0, Math.min(100, n));
  return `${clamped}%`;
}

export default function StatsRow({
  winRate,
  losses,
  wins,
  total,
}: StatsRowProps) {
  return (
    <Grid container spacing={2} sx={{ direction: "rtl" }}>
      <Grid size={{ xs: 12, md: 6, lg: 3 }}>
        <StatCard
          title="Win Rate"
          value={formatPercent(winRate)}
          icon={<TrackChangesIcon fontSize="large" />}
          bg={{ kind: "solid", color: "#4285F4" }} // blue
        />
      </Grid>

      <Grid size={{ xs: 12, md: 6, lg: 3 }}>
        <StatCard
          title="עסקאות הפסד"
          value={losses}
          icon={<CloseIcon fontSize="large" />}
          bg={{ kind: "solid", color: "#EF4444" }} // red
        />
      </Grid>

      <Grid size={{ xs: 12, md: 6, lg: 3 }}>
        <StatCard
          title="עסקאות רווחיות"
          value={wins}
          icon={<CheckBoxIcon fontSize="large" />}
          bg={{ kind: "solid", color: "#22C55E" }} // green
        />
      </Grid>

      <Grid size={{ xs: 12, md: 6, lg: 3 }}>
        <StatCard
          title="סה״כ עסקאות"
          value={total}
          icon={<ShowChartIcon fontSize="large" />}
          bg={{
            kind: "gradient",
            css: "linear-gradient(90deg, #5C6AC4 0%, #8B5CF6 100%)",
          }}
        />
      </Grid>
    </Grid>
  );
}
