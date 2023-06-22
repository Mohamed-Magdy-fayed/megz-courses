import { api } from "@/utils/api";
import {
  Box,
  Container,
  Stack,
  Typography,
  Unstable_Grid2 as Grid,
  CircularProgress,
} from "@mui/material";
import { useSession } from "next-auth/react";
import { Layout as DashboardLayout } from "src/layouts/dashboard/layout";
import { Account } from "src/sections/account/Account";
import { AccountDetails } from "src/sections/account/AccountDetails";
import { useEffect, useState } from "react";

const Page = () => {
  const session = useSession();

  const user = api.account.getByEmail.useQuery({
    email: session.data?.user.email || "",
  }).data?.user;

  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState(user?.image);

  return (
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
            <div>
              <Typography variant="h4">Account</Typography>
            </div>
            <div>
              <Grid container spacing={3}>
                {user ? (
                  <Grid xs={12} md={6} lg={4}>
                    <Account loading={loading} user={user} />
                  </Grid>
                ) : (
                  <Grid xs={12} md={12} lg={12}>
                    <CircularProgress></CircularProgress>
                  </Grid>
                )}
                <Grid xs={12} md={6} lg={8}>
                  {user ? (
                    <AccountDetails user={user} />
                  ) : (
                    <Grid xs={12} md={12} lg={12}>
                      <CircularProgress></CircularProgress>
                    </Grid>
                  )}
                </Grid>
              </Grid>
            </div>
          </Stack>
        </Container>
      </Box>
    </DashboardLayout>
  );
};

export default Page;
