import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { CircularProgress } from "@mui/material";
import { useToastStore } from "@/zustand/store";
import { api } from "@/lib/api";

export default function RegisterForm() {
  const [loading, setLoading] = React.useState(false);
  const toast = useToastStore((state) => state);

  const registerMutation = api.auth.register.useMutation();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = data.get("name")?.toString();
    const email = data.get("email")?.toString();
    const password = data.get("password")?.toString();

    if (!name || !email || !password) {
      return toast.error("please fill all the data");
    }

    setLoading(true);
    registerMutation.mutate(
      { name, email, password },
      {
        onSuccess(data) {
          if (data.user)
            toast.success(`user (${data.user.name}) created successfully`);
          if (data.error) toast.error(data.error.message);
        },
        onSettled() {
          setLoading(false);
        },
      }
    );
  };
  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign up
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                autoComplete="given-name"
                name="name"
                required
                fullWidth
                id="name"
                label="Name"
                autoFocus
                aria-required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                aria-required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="new-password"
                aria-required
              />
            </Grid>
          </Grid>
          <Button
            disabled={loading}
            type="submit"
            fullWidth
            variant="contained"
            className="bg-primary normal-case disabled:text-slate-700"
            sx={{ mt: 3, mb: 2 }}
          >
            {loading && (
              <CircularProgress
                size={20}
                className="absolute left-4 text-slate-700"
              />
            )}
            Sign Up
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
