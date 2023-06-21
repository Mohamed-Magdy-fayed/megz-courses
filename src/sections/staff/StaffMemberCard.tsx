import {
  Avatar,
  Box,
  Card,
  CardContent,
  Divider,
  Stack,
  SvgIcon,
  Typography,
} from "@mui/material";
import { StaffMember } from "@/pages/staff";
import { ArrowForwardIosRounded, TaskAltRounded } from "@mui/icons-material";

export const StaffMemberCard = ({
  staffMember,
}: {
  staffMember: StaffMember;
}) => {
  return (
    <Card
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <CardContent>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            pb: 3,
          }}
        >
          <Avatar src={staffMember.image} variant="square" />
        </Box>
        <Typography align="center" gutterBottom variant="h5">
          {staffMember.name}
        </Typography>
        <Typography align="center" variant="body1">
          {staffMember.jobDescription}
        </Typography>
      </CardContent>
      <Box sx={{ flexGrow: 1 }} />
      <Divider />
      <Stack
        alignItems="center"
        direction="row"
        justifyContent="space-between"
        spacing={2}
        sx={{ px: 2, py: 1 }}
      >
        <Stack
          alignItems="center"
          direction="row"
          spacing={1}
          className="cursor-pointer select-none p-2 hover:bg-slate-50"
        >
          <SvgIcon color="action" fontSize="small">
            <ArrowForwardIosRounded />
          </SvgIcon>
          <Typography color="text.secondary" display="inline" variant="body2">
            View Profile
          </Typography>
        </Stack>
        <Stack alignItems="center" direction="row" spacing={1}>
          <SvgIcon color="action" fontSize="small">
            <TaskAltRounded />
          </SvgIcon>
          <Typography color="text.secondary" display="inline" variant="body2">
            {staffMember.tasksDone} Tasks Done
          </Typography>
        </Stack>
      </Stack>
    </Card>
  );
};
