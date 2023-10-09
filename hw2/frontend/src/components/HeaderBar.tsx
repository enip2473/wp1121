// import MenuIcon from "@mui/icons-material/Menu";
import AppBar from "@mui/material/AppBar";
// import IconButton from "@mui/material/IconButton";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { useNavigate } from 'react-router-dom';

export default function HeaderBar() {
  const navigate = useNavigate();

  const handleNavigation = () => {
    navigate('/');
  };

  return (
    <AppBar position="static" onClick={handleNavigation} sx={{
        cursor: 'pointer',
        '&:hover': {
          backgroundColor: '#555',  // Darken the color on hover
        },
      }}
    >
      <Toolbar>
        <Typography variant="h5" component="div" sx={{ flexGrow: 1 }}>
          WP Music
        </Typography>
      </Toolbar>
    </AppBar>
  );
}
