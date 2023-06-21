import { Box, Container, Stack, Typography } from "@mui/material";
import { SettingsNotifications } from "src/sections/settings/SettingsNotifications";
import { SettingsPassword } from "src/sections/settings/SettingsPassword";
import { Layout as DashboardLayout } from "src/layouts/dashboard/layout";

const Page = () => (
  <DashboardLayout>
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        py: 8,
      }}
    >
      <Container maxWidth="lg">
        <Stack spacing={3}>
          <Typography variant="h4">Settings</Typography>
          <SettingsNotifications />
          <SettingsPassword />
        </Stack>
      </Container>
    </Box>
  </DashboardLayout>
);

export default Page;
