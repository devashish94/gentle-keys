import {
  Box,
  Toolbar,
  IconButton,
  Typography,
  Link,
  AppBar,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import GitHubIcon from "@mui/icons-material/GitHub";

export default function TopBar() {
  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <IconButton sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flex: 1 }} to="/">
            Gentle Keys
          </Typography>
          <Link href="https://github.com/devashish94/gentle-keys">
            <IconButton>
              <GitHubIcon />
            </IconButton>
          </Link>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
