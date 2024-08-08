import { useRef } from "react";
import { Box, TextField, Button } from "@mui/material";

export default function JoinRoom() {
  const joinRoomRef = useRef();

  function handleJoinRoom() {
    const roomId = joinRoomRef.current?.value;
    console.log(roomId);
  }

  return (
    <div className="px-4 sm:px-20 max-w-[900px] w-full flex gap-5 justify-center items-center">
      <Box className="flex-1" component="form" noValidate autoComplete="off">
        <TextField
          className="w-full"
          inputRef={joinRoomRef}
          label="Room ID"
          variant="outlined"
        />
      </Box>
      <Button className="h-fit" variant="outlined" onClick={handleJoinRoom}>
        Join Room
      </Button>
    </div>
  );
}
