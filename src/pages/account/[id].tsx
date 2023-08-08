import { Account } from "@/components/accountComponents/Account";
import { AccountDetails } from "@/components/accountComponents/AccountDetails";
import { api } from "@/lib/api";
import { KeyboardDoubleArrowLeft } from "@mui/icons-material";
import {
  Box,
  CircularProgress,
  Container,
  Grid,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { useRouter } from "next/router";
import React from "react";
import AppLayout from "@/layouts/AppLayout";

export default function Page() {
  const router = useRouter();
  const id = router.query.id as string;

  const userQuery = api.users.getUserById.useQuery({ id });
  const user = userQuery.data?.user;

  const loading = userQuery.isLoading;

  return (
    <AppLayout>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
        }}
      >
        <Container maxWidth="lg">
          <Stack spacing={3}>
            <Stack direction="row" className="items-center gap-4">
              <IconButton onClick={() => router.back()}>
                <KeyboardDoubleArrowLeft></KeyboardDoubleArrowLeft>
              </IconButton>
              <Typography variant="h4">Account</Typography>
            </Stack>
            <div>
              <Grid container spacing={3}>
                {loading || !user ? (
                  <Grid item xs={12} md={6} lg={4}>
                    <CircularProgress></CircularProgress>
                  </Grid>
                ) : (
                  <>
                    <Grid item xs={12} md={6} lg={4}>
                      <Account user={user} />
                    </Grid>
                    <Grid item xs={12} md={6} lg={8}>
                      <AccountDetails user={user} />
                    </Grid>
                  </>
                )}
              </Grid>
            </div>
          </Stack>
        </Container>
      </Box>
    </AppLayout>
  );
}
