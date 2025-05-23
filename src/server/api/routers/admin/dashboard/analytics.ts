import {
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc";

export const analyticsRouter = createTRPCRouter({
  getDeviceTraffic: protectedProcedure.query(async ({ ctx }) => {
    // Group users by device type and count
    const deviceCounts = await ctx.prisma.user.groupBy({
      by: ["device"],
      _count: { device: true },
    });

    // Map to chart data format
    const chartData = [
      { device: "Desktop", visitors: 0, fill: "var(--color-desktop)" },
      { device: "Mobile", visitors: 0, fill: "var(--color-mobile)" },
      { device: "Tablet", visitors: 0, fill: "var(--color-tablet)" },
    ];

    deviceCounts.forEach(({ device, _count }) => {
      if (device === "Desktop" || device === "Mobile" || device === "Tablet") {
        const entry = chartData.find((d) => d.device === device);
        if (entry) entry.visitors = _count.device;
      }
    });

    return chartData;
  }),
});
