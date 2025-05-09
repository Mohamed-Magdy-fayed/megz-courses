import { env } from "@/env.mjs";
import { seedLeads } from "@/lib/seed/seeders/operations/seedLeads";
import { generateTimestamps } from "@/lib/seed/utils/helpers";
import { logError, logInfo, logSuccess } from "@/lib/seed/utils/logger";
import { orderCodeGenerator } from "@/lib/utils";
import { faker } from "@faker-js/faker";
import { connectDB } from "@/lib/seed/utils/connect";
import { ObjectId } from "mongodb";
import { seedCourses } from "@/lib/seed/seeders/content/seedCourses";
import { orderStatusDistribution } from "@/lib/seed/data/utils";
import { seedLevels } from "@/lib/seed/seeders/content/seedLevels";

export const seedOrders = async (
  content: Awaited<ReturnType<typeof seedCourses>>,
  leads: Awaited<ReturnType<typeof seedLeads>>["convertedLeads"],
  levels: Awaited<ReturnType<typeof seedLevels>>["levels"],
) => {
  logInfo("Seeding Orders...");

  const { db, client } = await connectDB();
  const orderCollection = db.collection("Order");
  const courseStatusCollection = db.collection("CourseStatus");

  const paymentLink = `${env.PAYMOB_BASE_URL}/unifiedcheckout/?publicKey=${env.PAYMOB_PUBLIC_KEY}&clientSecret=intentResponse.client_secret`;

  const fullorders: { createdAt: Date; updatedAt: Date; agentId: ObjectId; _id: ObjectId; amount: any; orderNumber: string; paymentLink: string; status: string; productId: ObjectId; leadId: ObjectId; userId: any; }[] = []
  const ordersToInsert: { createdAt: Date; updatedAt: Date; _id: ObjectId; amount: any; orderNumber: string; paymentLink: string; status: string; productId: ObjectId; leadId: ObjectId; userId: any; }[] = []
  const courseStatusToInsert: { createdAt: Date; updatedAt: Date; _id: ObjectId; status: string; courseId: any; userId: any; orderId: ObjectId; isPrivate: boolean; courseLevelId: ObjectId | null }[] = []

  leads.forEach(lead => {
    if (!lead.userId) return [];

    const selectedProducts = faker.helpers.arrayElements(content.products, { min: 1, max: 3 });

    return selectedProducts.forEach(product => {
      const timestamps = generateTimestamps(lead.updatedAt);
      const isPrivate = faker.helpers.weightedArrayElement([
        { value: true, weight: 30 },
        { value: false, weight: 70 }
      ]);
      const orderNumber = orderCodeGenerator(timestamps.updatedAt);
      const orderStatus = faker.helpers.weightedArrayElement(orderStatusDistribution);

      let courseStatus;
      if (orderStatus === "Cancelled") courseStatus = "Cancelled" as const;
      else if (orderStatus === "Refunded") courseStatus = "Refunded" as const;
      else if (orderStatus === "Pending") courseStatus = "OrderCreated" as const;
      else if (timestamps.createdAt < new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000)) courseStatus = "Completed" as const
      else courseStatus = faker.helpers.arrayElement([
        "OrderPaid", "PlacementTest",
        "Waiting", "Ongoing", "Postponded"
      ] as const);

      const orderId = new ObjectId();
      const courseStatusId = new ObjectId();
      const courseId = content.productItems.find(pi => pi.productId === product._id)?.courseId
      const courseLevelId = ["Waiting", "Ongoing", "Postponded", "Completed"].includes(courseStatus)
        ? faker.helpers.arrayElement(levels.filter(lvl => lvl.courseId === courseId))._id
        : null

      courseStatusToInsert.push({
        _id: courseStatusId,
        status: courseStatus,
        courseId,
        courseLevelId,
        userId: lead.userId,
        orderId,
        isPrivate,
        ...timestamps,
      })

      ordersToInsert.push({
        _id: orderId,
        amount: isPrivate ? product.privatePrice : product.groupPrice,
        orderNumber,
        paymentLink,
        status: orderStatus,
        productId: product._id,
        leadId: lead._id,
        userId: lead.userId,
        ...timestamps
      });

      fullorders.push({
        _id: orderId,
        amount: isPrivate ? product.privatePrice : product.groupPrice,
        orderNumber,
        paymentLink,
        status: orderStatus,
        productId: product._id,
        leadId: lead._id,
        userId: lead.userId,
        agentId: lead.assigneeId,
        ...timestamps
      });
    }, { count: { min: 1, max: 3 } });
  });

  const session = client.startSession();

  try {
    await session.withTransaction(async () => {
      await orderCollection.insertMany(ordersToInsert, { session });
      await courseStatusCollection.insertMany(courseStatusToInsert, { session });
    });

    logSuccess(`Inserted ${ordersToInsert.length} Orders`);
    logSuccess(`Inserted ${courseStatusToInsert.length} Course Statuses`);

  } catch (error) {
    logError(`Error during seeding Orders: ${error}`);
  } finally {
    await session.endSession();
  }

  return {
    orders: fullorders,
    courseStatuses: courseStatusToInsert,
    placementTestsStatuses: courseStatusToInsert.filter(s => ["PlacementTest", "Completed", "Waiting", "Ongoing", "Postponded"].includes(s.status)),
  };
};