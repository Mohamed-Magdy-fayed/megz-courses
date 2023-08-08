import { api } from "@/lib/api";
import {
  Box,
  Container,
  Stack,
  Unstable_Grid2 as Grid,
  CircularProgress,
} from "@mui/material";
import { useSession } from "next-auth/react";
import { Layout as DashboardLayout } from "src/layouts/dashboard/layout";
import { Account } from "@/components/accountComponents/Account";
import { AccountDetails } from "@/components/accountComponents/AccountDetails";
import { ConceptTitle } from "@/components/ui/Typoghraphy";

const Page = () => {
  const session = useSession();

  const user = api.users.getUserByEmail.useQuery({
    email: session.data?.user.email || "",
  }).data?.user;

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
              <ConceptTitle>Account</ConceptTitle>
            </div>
            <Grid container spacing={3}>
              {user ? (
                <Grid xs={12} md={6} lg={4}>
                  <Account user={user} />
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
          </Stack>
        </Container>
      </Box>
    </DashboardLayout>
  );
};

export default Page;
