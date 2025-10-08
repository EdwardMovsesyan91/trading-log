import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import Tooltip from "@mui/material/Tooltip";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useThemeStore } from "../stores/useThemeStore";

export default function Header() {
  const mode = useThemeStore((s) => s.mode);
  const toggle = useThemeStore((s) => s.toggle);

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        color="transparent"
        sx={{
          borderBottom: (t) => `1px solid ${t.palette.divider}`,
          backdropFilter: "saturate(140%) blur(6px)",
        }}
      >
        <Toolbar sx={{ minHeight: 64, px: { xs: 1, sm: 2 } }}>
          <Box sx={{ flexGrow: 1 }} />

          <Tooltip title={mode === "dark" ? "מצב בהיר" : "מצב כהה"}>
            <IconButton aria-label="toggle theme" onClick={toggle}>
              {mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ pb: 2 }}>
        <Box
          sx={{
            mt: 1.5,
            mb: 1.5,
            px: { xs: 2.5, sm: 3.5, md: 4 },
            py: { xs: 2.5, sm: 3 },
            borderRadius: 4,
            color: "#fff",
            backgroundImage:
              "linear-gradient(90deg, #5C6AC4 0%, #7B61FF 45%, #4285F4 100%)",
            boxShadow:
              "0 14px 28px rgba(0,0,0,.12), 0 10px 10px rgba(0,0,0,.08)",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2.5,
              flexDirection: "row-reverse",
            }}
          >
            <Box sx={{ textAlign: "left", flex: 1 }}>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                יומן מסחר אישי
              </Typography>
              <Typography
                variant="subtitle1"
                sx={{ mt: 0.5, opacity: 0.95, fontWeight: 500 }}
              >
                נהל את העסקאות שלך בצורה מקצועית ועקוב אחר הביצועים
              </Typography>
            </Box>
          </Box>
        </Box>
      </Container>
    </>
  );
}
