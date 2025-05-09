import { generateTimestamps, generateCreatorUpdator } from "@/lib/seed/utils/helpers";
import { logError, logInfo, logSuccess } from "@/lib/seed/utils/logger";
import { connectDB } from "@/lib/seed/utils/connect";
import { Document, ObjectId, WithId } from "mongodb";
import { systemFormData } from "@/lib/seed/data/forms";
import { seedCourses } from "@/lib/seed/seeders/content/seedCourses";
import { seedLevels } from "@/lib/seed/seeders/content/seedLevels";
import { seedMaterials } from "@/lib/seed/seeders/content/seedMaterials";

export const seedForms = async (
  courses: Awaited<ReturnType<typeof seedCourses>>["courses"],
  levels: Awaited<ReturnType<typeof seedLevels>>["levels"],
  materials: Awaited<ReturnType<typeof seedMaterials>>["materials"],
) => {
  logInfo("Seeding Forms...");

  const { db, client } = await connectDB();
  const SystemForms = db.collection("SystemForm");
  const SystemFormItems = db.collection("SystemFormItem");
  const ItemQuestions = db.collection("ItemQuestion");
  const ItemQuestionOptions = db.collection("ItemQuestionOption");

  const { placementTest, finalTest, assignment, quiz } = systemFormData;
  type FormType = typeof systemFormData["assignment" | "quiz" | "placementTest" | "finalTest"]

  const calculateTotalScore = (formItems: { questions: { points: number }[] }[]) =>
    formItems.reduce((total, item) => total + item.questions.reduce((sum, q) => sum + q.points, 0), 0);

  const forms: WithId<Document>[] = [];
  const allItems: WithId<Document>[] = [];
  const allQuestions: WithId<Document>[] = [];
  const allOptions: WithId<Document>[] = [];
  const fullForms: { courseId: ObjectId | null; courseLevelId: ObjectId | null; materialItemId: ObjectId | null; createdBy: string; updatedBy: string; createdAt: Date; updatedAt: Date; _id: ObjectId; items: { createdAt: Date; updatedAt: Date; _id: ObjectId; questions: { createdAt: Date; updatedAt: Date; _id: ObjectId; options: { createdAt: Date; updatedAt: Date; _id: ObjectId; value: string; isCorrect: boolean; itemQuestionId: ObjectId; }[]; type: "Choice" | "Text"; choiceType: "Radio" | "Checkbox"; required: boolean; questionText: string; points: number; shuffle: boolean; itemId: ObjectId; }[]; type: "QuestionItem" | "TextItem"; title: string; imageUrl: string | null; altText: string; caption: string; systemFormId: ObjectId; }[]; title: string; description: string; type: "PlacementTest" | "FinalTest" | "Quiz" | "Assignment"; totalScore: number }[] = [];

  const processFormType = (
    formData: FormType,
    parentIds: ObjectId[],
    parentField: "courseId" | "courseLevelId" | "materialItemId"
  ) => {
    if (!parentIds.length) return [];

    const timestamps = generateTimestamps();
    const creatorUpdator = generateCreatorUpdator();

    for (const parentId of parentIds) {
      const formId = new ObjectId();
      forms.push({
        _id: formId,
        title: formData.title,
        description: formData.description,
        type: formData.type,
        totalScore: calculateTotalScore(formData.items),
        [parentField]: parentId,
        ...timestamps,
        ...creatorUpdator
      });

      // Prepare items
      const items = formData.items.map(item => {
        const itemId = new ObjectId();
        allItems.push({
          _id: itemId,
          type: item.type,
          title: item.title,
          imageUrl: item.imageUrl,
          altText: "image",
          caption: "caption",
          systemFormId: formId,
          ...timestamps
        });

        // Prepare questions and options
        const questions = item.questions.map(question => {
          const questionId = new ObjectId();
          allQuestions.push({
            _id: questionId,
            type: question.type,
            choiceType: question.choiceType,
            required: question.required,
            questionText: question.questionText,
            points: question.points,
            shuffle: question.shuffle,
            itemId,
            ...timestamps
          });

          // Prepare options
          const options = question.options.map(option => {
            allOptions.push({
              _id: new ObjectId(),
              value: option.value,
              isCorrect: option.isCorrect,
              itemQuestionId: questionId,
              ...timestamps
            });

            return {
              _id: new ObjectId(),
              value: option.value,
              isCorrect: option.isCorrect,
              itemQuestionId: questionId,
              ...timestamps
            }
          });

          return {
            _id: questionId,
            options,
            type: question.type,
            choiceType: question.choiceType,
            required: question.required,
            questionText: question.questionText,
            points: question.points,
            shuffle: question.shuffle,
            itemId,
            ...timestamps
          }
        });

        return {
          _id: itemId,
          questions,
          type: item.type,
          title: item.title,
          imageUrl: item.imageUrl,
          altText: "image",
          caption: "caption",
          systemFormId: formId,
          ...timestamps
        }
      });

      fullForms.push({
        _id: formId,
        items,
        title: formData.title,
        description: formData.description,
        type: formData.type,
        totalScore: calculateTotalScore(formData.items),
        courseId: parentField === "courseId" ? parentId : null,
        courseLevelId: parentField === "courseLevelId" ? parentId : null,
        materialItemId: parentField === "materialItemId" ? parentId : null,
        ...timestamps,
        ...creatorUpdator
      })
    }
  };

  processFormType(placementTest, courses.map(c => c._id), 'courseId');
  processFormType(finalTest, levels.map(l => l._id), 'courseLevelId');
  processFormType(assignment, materials.map(m => m._id), 'materialItemId');
  processFormType(quiz, materials.map(m => m._id), 'materialItemId');

  const session = client.startSession();
  try {
    await session.withTransaction(async () => {
      await SystemForms.insertMany(forms, { session });
      await SystemFormItems.insertMany(allItems, { session });
      await ItemQuestions.insertMany(allQuestions, { session });
      await ItemQuestionOptions.insertMany(allOptions, { session });
    });

    logSuccess(`Inserted ${forms.length} Forms`);
  } catch (error) {
    logError(`Error during seeding Forms: ${error}`);
  } finally {
    await session.endSession();
  }

  return {
    placementTests: fullForms.filter(f => f.type === "PlacementTest"),
    finalTests: fullForms.filter(f => f.type === "FinalTest"),
    quizzes: fullForms.filter(f => f.type === "Quiz"),
    assignments: fullForms.filter(f => f.type === "Assignment"),
  };
};