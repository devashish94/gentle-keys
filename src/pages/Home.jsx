import { Button, Typography } from "@mui/material";
import JoinRoom from "../components/HomePage/JoinRoom";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  function handleCreateRoom() {
    navigate("/race");
  }

  return (
    <div className="p-6 h-full flex flex-col gap-6 items-center">
      <JoinRoom />
      <Typography variant="h6" component="div">
        Or
      </Typography>
      <Button onClick={handleCreateRoom} variant="outlined">
        Create Room
      </Button>
    </div>
  );
}
