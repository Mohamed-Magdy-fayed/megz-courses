import { signIn } from "next-auth/react";
import React, { useState } from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { useToastStore } from "@/zustand/store";
import { CircularProgress } from "@mui/material";

export default function LoginForm() {
  const [loading, setLoading] = useState(false);
  const toast = useToastStore((state) => state);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setLoading(true);
    signIn("credentials", {
      email: data.get("email"),
      password: data.get("password"),
      redirect: false,
    })
      .then((res) => {
        if (res?.error) {
          toast.error(res.error);
        }

        if (res?.ok && !res?.error) {
          toast.success("logged in");
        }
      })
      .finally(() => setLoading(false));
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
          Sign in
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            disabled={loading}
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
          />
          <TextField
            disabled={loading}
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
          />
          <Button
            disabled={loading}
            type="submit"
            fullWidth
            variant="contained"
            className="bg-primary disabled:text-slate-700"
            sx={{ mt: 3, mb: 2 }}
          >
            {loading && (
              <CircularProgress
                size={20}
                className="absolute left-4 normal-case text-slate-700"
              />
            )}
            Sign In
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
