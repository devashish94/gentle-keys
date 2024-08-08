import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import {createTheme, CssBaseline, ThemeProvider} from "@mui/material";
import Typing from "./pages/Typing.jsx";
import TopBar from "./components/ui/TopBar.jsx";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <div className={"min-h-screen h-fit w-screen flex flex-col bg-zinc-700"}>
        <TopBar />
        <div className={"h-fit"}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/race" element={<Typing />} />
          </Routes>
        </div>

      </div>
    </ThemeProvider>
  );
}

export default App;
