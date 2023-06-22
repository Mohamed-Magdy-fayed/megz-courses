import { Layout as DashboardLayout } from "@/layouts/dashboard/layout";
import { Account } from "@/sections/account/Account";
import { AccountDetails } from "@/sections/account/AccountDetails";
import { api } from "@/utils/api";
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
import React, { useState } from "react";

export default function Page() {
  const router = useRouter();
  const id = router.query.id as string;

  const user = api.account.getById.useQuery({ id }).data?.user;

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
            <Stack direction="row" className="items-center gap-4">
              <IconButton onClick={() => router.back()}>
                <KeyboardDoubleArrowLeft></KeyboardDoubleArrowLeft>
              </IconButton>
              <Typography variant="h4">Account</Typography>
            </Stack>
            <div>
              <Grid container spacing={3}>
                {!user ? (
                  <Grid item xs={12} md={6} lg={4}>
                    <CircularProgress></CircularProgress>
                  </Grid>
                ) : (
                  <>
                    <Grid item xs={12} md={6} lg={4}>
                      <Account loading={loading} user={user} />
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
    </DashboardLayout>
  );
}
