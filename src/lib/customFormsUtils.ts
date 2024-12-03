import { ItemQuestionType, ItemType, Prisma, QuestionChoiceType, SystemFormTypes } from "@prisma/client";
import { forms_v1 } from "googleapis";

export function getFormTotalPoints(items: forms_v1.Schema$Item[]) {
    return items.map(item => getItemScore(item)).reduce((a, b) => a + b, 0)
}

export function createFormItemData(item: forms_v1.Schema$Item): Prisma.SystemFormItemCreateWithoutSystemFormInput {
    const type: ItemType = item.imageItem ? "ImageItem" :
        item.pageBreakItem ? "PageBreakItem" :
            item.questionGroupItem ? "QuestionGroupItem" :
                item.questionItem ? "QuestionItem" :
                    item.videoItem ? "VideoItem" : "TextItem"
    const title = item.title || item.description || ""

    function createQuestion(question: forms_v1.Schema$Question): Prisma.ItemQuestionCreateWithoutItemInput {
        const questionType: ItemQuestionType = question.choiceQuestion ? "Choice" : "Text"
        const points = question.grading?.pointValue ?? 0
        const required = question.required ?? false
        const choiceType: QuestionChoiceType = question.choiceQuestion?.type === "RADIO" ? "Radio" : "Checkbox"

        function createOptions(question: forms_v1.Schema$Question): Prisma.Enumerable<Prisma.ItemQuestionOptionCreateManyItemQuestionInput> {
            return question.choiceQuestion?.options?.map(option => ({
                value: option.value ?? "",
                isCorrect: question.grading?.correctAnswers?.answers?.some(ans => ans.value === option.value) ?? false
            })) ?? []
        }

        return {
            type: questionType,
            points,
            required,
            questionText: "",
            choiceType,
            options: {
                create: createOptions(question)
            }
        };
    }

    const questions = item.questionItem?.question
        ? [createQuestion(item.questionItem.question)]
        : item.questionGroupItem?.questions
            ? item.questionGroupItem.questions.map(createQuestion)
            : [];

    return {
        type,
        title,
        videoUrl: item.videoItem?.video?.youtubeUri,
        caption: item.videoItem?.caption,
        imageUrl: item.imageItem?.image?.contentUri ?? item.questionItem?.image?.contentUri ?? item.questionGroupItem?.image?.contentUri,
        altText: item.imageItem?.image?.altText ?? item.questionItem?.image?.altText ?? item.questionGroupItem?.image?.altText,
        questions: { create: questions },
    }
}

export function getItemScore(item: forms_v1.Schema$Item) {
    return item.questionGroupItem?.questions?.map(q => q.grading?.pointValue ?? 0).reduce((a, b) => a + b, 0)
        ?? item.questionItem?.question?.grading?.pointValue
        ?? 0
}

export function canAddForm({ course, formType }: { course: Prisma.CourseGetPayload<{ include: { systemForms: true, levels: { include: { systemForms: true, materialItems: { include: { systemForms: true } } } } } }>, formType: SystemFormTypes }): boolean {
    switch (formType) {
        case "PlacementTest":
            return !course.systemForms.some(form => form.type === "PlacementTest");

        case "FinalTest":
            return course.levels.every(level =>
                !level.systemForms.some(form => form.type === "FinalTest")
            );

        case "Assignment":
            return !course.levels.every(level =>
                level.materialItems.every(item =>
                    item.systemForms.some(form => form.type === "Assignment")
                )
            );

        case "Quiz":
            return course.levels.every(level =>
                level.materialItems.every(item =>
                    !item.systemForms.some(form => form.type === "Quiz")
                )
            );
        default:
            return false;
    }
}
