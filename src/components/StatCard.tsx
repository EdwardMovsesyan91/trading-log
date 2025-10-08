import * as React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { SxProps, Theme } from "@mui/material/styles";

export type Bg =
  | { kind: "solid"; color: string }
  | { kind: "gradient"; css: string };

export interface StatCardProps {
  title: string; // e.g., "Win Rate" | "עסקאות רווחיות"
  value: string | number; // e.g., "50%" | 2
  icon: React.ReactNode; // any MUI icon component
  bg: Bg; // solid or gradient background
  ariaLabel?: string; // for a11y; defaults to `${title}: ${value}`
  sx?: SxProps<Theme>;
}

function StatCard({ title, value, icon, bg, ariaLabel, sx }: StatCardProps) {
  const background =
    bg.kind === "solid"
      ? { backgroundColor: bg.color }
      : { backgroundImage: bg.css };

  return (
    <Card
      aria-label={ariaLabel ?? `${title}: ${value}`}
      elevation={6}
      sx={{
        borderRadius: 4,
        color: "#fff",
        overflow: "hidden",
        ...background,
        boxShadow: "0 10px 20px rgba(0,0,0,0.10), 0 6px 6px rgba(0,0,0,0.08)",
        ...sx,
      }}
    >
      <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Box
            sx={{
              flexShrink: 0,
              width: 44,
              height: 44,
              borderRadius: 2,
              bgcolor: "rgba(255,255,255,0.18)",
              display: "grid",
              placeItems: "center",
              backdropFilter: "saturate(180%) blur(2px)",
            }}
          >
            {icon}
          </Box>

          {/* Texts (right aligned for Hebrew) */}
          <Box sx={{ flex: 1, textAlign: "left" }}>
            <Typography
              variant="subtitle1"
              sx={{ opacity: 0.9, fontWeight: 500, lineHeight: 1.2 }}
            >
              {title}
            </Typography>
            <Typography
              variant="h4"
              sx={{ mt: 0.5, fontWeight: 800, lineHeight: 1 }}
            >
              {value}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export default React.memo(StatCard);
