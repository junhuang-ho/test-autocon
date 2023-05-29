import { useAppStates } from "~/contexts/AppStates";
import { useAuthentication } from "~/contexts/Authentication";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";

import ConnectButton from "../authentication/ConnectButton";
import ConnectOptions from "../authentication/ConnectOptions";

export const HEIGHT_HEADER = 70;

const Header = () => {
  const { isConnected, logout } = useAuthentication();

  return (
    <Stack
      alignItems="center"
      justifyContent="center"
      spacing={1}
      sx={{
        position: "fixed",
        height: HEIGHT_HEADER,
        width: "100%",
        backgroundColor: "background.paper",
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ px: 2, width: "100%" }}
      >
        <Box sx={{ p: 1 }}></Box>
        <Stack direction="row" alignItems="center" justifyContent="center">
          <ConnectButton />
          <Box sx={{ p: 1 }}></Box>
          <button
            disabled={!logout}
            onClick={async () => {
              await logout?.();
            }}
          >
            logout
          </button>
        </Stack>
      </Stack>
      <ConnectOptions />
    </Stack>
  );
};

export default Header;
