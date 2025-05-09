import { logError, logInfo, logSuccess } from "@/lib/seed/utils/logger";
import { connectDB } from "@/lib/seed/utils/connect";
import { generateTimestamps } from "@/lib/seed/utils/helpers";
import { Document, ObjectId, WithId } from "mongodb";
import { faker } from "@faker-js/faker";
import { courses } from "@/lib/seed/data/courses";

export const seedCourses = async () => {
  logInfo("Seeding Courses...");

  const { db, client } = await connectDB();
  const coursesCollection = db.collection("Course");
  const productsCollection = db.collection("Product");
  const productItemsCollection = db.collection("ProductItem");

  // Process all courses in sequence to maintain references
  const seededCourses: { createdAt: Date; updatedAt: Date; _id: ObjectId; name: string; slug: string; image: string; description: string; groupPrice: number; privatePrice: number; instructorPrice: number; }[] = []
  const seededProducts: WithId<Document>[] = []
  const seededProductItems: WithId<Document>[] = []

  for (const courseData of courses) {
    const courseId = new ObjectId()
    const productId = new ObjectId()
    const productItemId = new ObjectId()
    const image = faker.image.url()
    const timeStamps = generateTimestamps();

    // 1. First create the Product
    seededProducts.push({
      _id: productId,
      name: courseData.name,
      description: courseData.description,
      image,
      groupPrice: courseData.groupPrice,
      privatePrice: courseData.privatePrice,
      isActive: true,
      ...timeStamps
    });

    // 2. Then create the Course
    seededCourses.push({
      _id: courseId,
      name: courseData.name,
      slug: courseData.slug,
      image,
      description: courseData.description,
      groupPrice: courseData.groupPrice,
      privatePrice: courseData.privatePrice,
      instructorPrice: courseData.instructorPrice,
      ...timeStamps
    });

    // 3. Finally create the ProductItem linking them
    seededProductItems.push({
      _id: productItemId,
      productId,
      courseId,
      courseLevelId: null,
      ...timeStamps
    });
  }

  // After building seededProducts, seededCourses, seededProductItems arrays
  const session = client.startSession();
  try {
    await session.withTransaction(async () => {
      await coursesCollection.insertMany(seededCourses, { session });
      await productsCollection.insertMany(seededProducts, { session });
      await productItemsCollection.insertMany(seededProductItems, { session });
    });

    logSuccess(`Inserted ${seededProducts.length} Products`);
    logSuccess(`Inserted ${seededCourses.length} Courses`);
    logSuccess(`Inserted ${seededProductItems.length} ProductItems`);

  } catch (error) {
    logError(`Error during seeding Courses: ${error}`);
  } finally {
    await session.endSession();
  }

  return {
    courses: seededCourses,
    products: seededProducts,
    productItems: seededProductItems,
  };
};