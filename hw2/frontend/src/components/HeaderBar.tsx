// import MenuIcon from "@mui/icons-material/Menu";
import AppBar from "@mui/material/AppBar";
// import IconButton from "@mui/material/IconButton";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";

export default function HeaderBar() {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          WP Music
        </Typography>
      </Toolbar>
    </AppBar>
  );
}
