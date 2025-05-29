import {
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc";
import { z } from "zod";

export const analyticsRouter = createTRPCRouter({
  getDeviceTraffic: protectedProcedure
    .input(z.object({ from: z.date(), to: z.date() }).optional())
    .query(async ({ ctx, input }) => {
      // If a date range is provided, filter users by createdAt
      const where = input?.from && input?.to
        ? {
          createdAt: {
            gte: input.from,
            lte: input.to,
          },
        }
        : {};

      // Group users by device type and count, filtered by date if provided
      const deviceCounts = await ctx.prisma.user.groupBy({
        by: ["device"],
        _count: { device: true },
        where,
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

  getSalesPerMonth: protectedProcedure
    .input(z.object({ from: z.date(), to: z.date() }).optional())
    .query(async ({ ctx, input }) => {
      const now = new Date();
      const thisYear = now.getFullYear();
      const lastYear = thisYear - 1;

      // Optional date range
      const from = input?.from ?? new Date(lastYear, 0, 1);
      const to = input?.to ?? new Date(thisYear, 11, 31, 23, 59, 59);

      // Get all orders in the range for both years
      const orders = await ctx.prisma.order.findMany({
        where: {
          createdAt: {
            gte: from,
            lte: to,
          },
          status: { not: 'Cancelled' },
        },
        select: {
          amount: true,
          createdAt: true,
        },
      });

      // Aggregate sales per month for this year and last year
      const months = Array.from({ length: 12 }, (_, i) => i); // 0 = Jan, 11 = Dec

      const result = months.map(month => {
        const thisYearSum = orders
          .filter(
            o =>
              o.createdAt.getFullYear() === thisYear &&
              o.createdAt.getMonth() === month
          )
          .reduce((sum, o) => sum + (o.amount ?? 0), 0);

        const lastYearSum = orders
          .filter(
            o =>
              o.createdAt.getFullYear() === lastYear &&
              o.createdAt.getMonth() === month
          )
          .reduce((sum, o) => sum + (o.amount ?? 0), 0);

        return {
          month: new Date(2000, month, 1).toLocaleString('default', { month: 'short' }),
          thisYear: thisYearSum,
          lastYear: lastYearSum,
        };
      });

      const thisMonth = result[now.getMonth()]?.thisYear || 0;
      const prevMonth = result[now.getMonth() - 1]?.thisYear || 0;
      const trend = prevMonth === 0 ? 0 : ((thisMonth - prevMonth) / prevMonth) * 100;

      return {
        result, trend, asd: {
          thisMonth,
          prevMonth,
          trend,
        }
      };
    }),
});
