import { Prisma, PrismaClient, UserRoles } from "@prisma/client";
import { env } from "@/env.mjs";
import { getCurrentTier, subscriptionTiers } from "@/lib/system";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

async function checkLimit({
  maxAllowed,
  currentCount,
  entityName,
  tierName,
}: {
  maxAllowed: number;
  currentCount: number;
  entityName: string;
  tierName: string;
}) {
  if (!Number.isFinite(maxAllowed)) return;

  if (currentCount >= maxAllowed) {
    throw new Error(`Limit reached: You can only create ${maxAllowed} ${entityName}s with the ${tierName} plan.`);
  }
}

async function getCurrentCount<T extends Prisma.ModelName>(
  model: T,
  roles: UserRoles[] = []
): Promise<number> {
  if (model === "User") {
    return prisma.user.count({
      where: roles.length ? { OR: roles.map((role) => ({ userRoles: { has: role } })) } : {},
    });
  } else if (model === "Course") {
    return prisma.course.count();
  }
  return 0;
}

const extension = Prisma.defineExtension({
  name: "Limitations",
  model: {
    user: {
      async create({ args, query }: { args: Prisma.UserCreateArgs; query: (args: Prisma.UserCreateArgs) => Promise<any> }) {
        const { name: tierName, students, teamMembers, instructors } = getCurrentTier();

        // Check limits for each type of user role
        await Promise.all([
          checkLimit({
            maxAllowed: students,
            currentCount: await getCurrentCount("User", ["Student"]),
            entityName: "Student",
            tierName,
          }),
          checkLimit({
            maxAllowed: teamMembers,
            currentCount: await getCurrentCount("User", ["SalesAgent", "OperationAgent", "ChatAgent"]),
            entityName: "Admin",
            tierName,
          }),
          checkLimit({
            maxAllowed: instructors,
            currentCount: await getCurrentCount("User", ["Teacher", "Tester"]),
            entityName: "instructor",
            tierName,
          }),
        ]);

        return query(args);
      },
    },
    course: {
      async create({ args, query }: { args: Prisma.CourseCreateArgs; query: (args: Prisma.CourseCreateArgs) => Promise<any> }) {
        const { name: tierName, courses } = getCurrentTier();

        await checkLimit({
          maxAllowed: courses,
          currentCount: await getCurrentCount("Course"),
          entityName: "course",
          tierName,
        });

        return query(args);
      },
    },
  },
});

prisma.$extends(extension);
