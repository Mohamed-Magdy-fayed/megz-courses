import { useCallback, FormEventHandler } from "react";
import {
  Button,
  CardContent,
  CardHeader,
  Checkbox,
  Divider,
  FormControlLabel,
  Stack,
  Typography,
  Unstable_Grid2 as Grid,
  Box,
} from "@mui/material";
import { PaperContainer } from "@/components/ui/PaperContainers";

export const SettingsNotifications = () => {
  const handleSubmit: FormEventHandler = useCallback((event) => {
    event.preventDefault();
  }, []);

  return (
    <form onSubmit={handleSubmit}>
      <PaperContainer>
        <CardHeader
          subheader="Manage the notifications"
          title="Notifications"
        />
        <Divider />
        <CardContent>
          <Grid container spacing={6} wrap="wrap">
            <Grid xs={12} sm={6} md={4}>
              <Stack spacing={1}>
                <Typography variant="h6">Notifications</Typography>
                <Stack>
                  <FormControlLabel
                    control={<Checkbox defaultChecked />}
                    label="Email"
                  />
                  <FormControlLabel
                    control={<Checkbox defaultChecked />}
                    label="Push Notifications"
                  />
                  <FormControlLabel
                    control={<Checkbox />}
                    label="Text Messages"
                  />
                  <FormControlLabel
                    control={<Checkbox defaultChecked />}
                    label="Phone calls"
                  />
                </Stack>
              </Stack>
            </Grid>
            <Grid md={4} sm={6} xs={12}>
              <Stack spacing={1}>
                <Typography variant="h6">Messages</Typography>
                <Stack>
                  <FormControlLabel
                    control={<Checkbox defaultChecked />}
                    label="Email"
                  />
                  <FormControlLabel
                    control={<Checkbox />}
                    label="Push Notifications"
                  />
                  <FormControlLabel
                    control={<Checkbox defaultChecked />}
                    label="Phone calls"
                  />
                </Stack>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
        <Divider />
        <Box component="div" className="flex justify-end p-4">
          <Button variant="contained" className="bg-primary">
            Save
          </Button>
        </Box>
      </PaperContainer>
    </form>
  );
};
