import { Box, Container, Stack } from "@mui/material";
import { SettingsNotifications } from "@/components/settingsComponents/SettingsNotifications";
import { SettingsPassword } from "@/components/settingsComponents/SettingsPassword";
import { Layout as DashboardLayout } from "src/layouts/dashboard/layout";
import { ConceptTitle } from "@/components/ui/Typoghraphy";

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
          <ConceptTitle>Settings</ConceptTitle>
          <SettingsNotifications />
          <SettingsPassword />
        </Stack>
      </Container>
    </Box>
  </DashboardLayout>
);

export default Page;
