import {
  PaidRounded,
  People,
  List,
  Straight,
  South,
} from "@mui/icons-material";
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
} from "@mui/material";

const states = [
  {
    title: "Budget",
    value: 24000,
    marker: { after: false, value: "$" },
    difference: { increased: true, value: 12 },
    icon: <PaidRounded className="text-slate-50"></PaidRounded>,
    iconColor: "bg-red-500",
  },
  {
    title: "Total students",
    value: 1600,
    difference: { increased: false, value: 16 },
    icon: <People className="text-slate-50"></People>,
    iconColor: "bg-green-500",
  },
  {
    title: "Tasks progress",
    value: 75.5,
    icon: <List className="text-slate-50"></List>,
    marker: { after: true, value: "%" },
    progress: true,
    iconColor: "bg-orange-500",
  },
  {
    title: "Total Income",
    value: 15000,
    marker: { after: false, value: "$" },
    icon: <PaidRounded className="text-slate-50"></PaidRounded>,
    iconColor: "bg-indigo-500",
  },
];

export default function StatesOverview() {
  return (
    <>
      {states.map((state) => (
        <Card
          key={state.title}
          className="col-span-12 rounded-2xl bg-white p-2 shadow drop-shadow-sm md:col-span-6 lg:col-span-3"
        >
          <CardContent className="flex flex-col gap-4">
            <Typography
              sx={{ fontSize: 14 }}
              color="text.secondary"
              gutterBottom
            >
              {state.title}
            </Typography>
            <Typography className="text-3xl font-bold" component="div">
              {!state.marker?.after && state.marker?.value}
              {state.value > 1000 ? state.value / 1000 : state.value}
              {state.value > 1000 ? "k" : ""}
              {state.marker?.after && state.marker?.value}
            </Typography>
            {state.difference && (
              <Box component="div" className="flex items-center gap-2">
                <Typography
                  className={
                    state.difference.increased
                      ? "text-green-500"
                      : "text-red-500"
                  }
                >
                  {state.difference.increased ? (
                    <Straight></Straight>
                  ) : (
                    <South></South>
                  )}{" "}
                  {state.difference.value}%
                </Typography>{" "}
                <Typography color="text.secondary">since last month</Typography>
              </Box>
            )}
            {state.progress && (
              <LinearProgress
                value={state.value}
                variant="determinate"
              ></LinearProgress>
            )}
            <Box
              component="div"
              className={`absolute right-4 top-4 rounded-full p-4 ${state.iconColor}`}
            >
              {state.icon}
            </Box>
          </CardContent>
        </Card>
      ))}
    </>
  );
}
