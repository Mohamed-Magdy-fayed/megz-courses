import { z } from "zod";
import {
    createTRPCRouter,
    protectedProcedure,
} from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { hasPermission } from "@/server/permissions";
import { validSystemFormTypes, validItemQuestionTypes, validItemTypes, validQuestionChoiceTypes } from "@/lib/enumsTypes";
import { getGoogleFormDetails } from "@/lib/googleApis";
import { createFormItemData, getFormTotalPoints } from "@/lib/customFormsUtils";

export const systemFormsRouter = createTRPCRouter({
    getSystemForms: protectedProcedure
        .query(async ({ ctx }) => {
            const systemForms = await ctx.prisma.systemForm.findMany({
                include: {
                    items: { include: { questions: true } },
                    submissions: { include: { student: true } }
                }
            });

            return { systemForms };
        }),
    getFormByMaterialSlug: protectedProcedure
        .input(z.object({
            slug: z.string(),
            type: z.enum(validSystemFormTypes).optional()
        }))
        .query(async ({ ctx, input: { slug, type } }) => {
            const systemForms = await ctx.prisma.systemForm.findFirst({
                where: { materialItem: { slug }, type },
                include: {
                    items: { include: { questions: true } },
                    submissions: { include: { student: true } }
                }
            });

            return { systemForms };
        }),
    createSystemForm: protectedProcedure
        .input(
            z.object({
                title: z.string(),
                description: z.string(),
                materialId: z.string().optional(),
                levelId: z.string().optional(),
                courseSlug: z.string().optional(),
                type: z.enum(validSystemFormTypes),
                items: z.array(z.object({
                    type: z.enum(validItemTypes),
                    title: z.string(),
                    imageUrl: z.string().optional(),
                    questions: z.array(z.object({
                        questionText: z.string(),
                        required: z.boolean(),
                        shuffle: z.boolean(),
                        points: z.number(),
                        type: z.enum(validItemQuestionTypes),
                        choiceType: z.enum(validQuestionChoiceTypes),
                        options: z.array(z.object({
                            value: z.string(),
                            isCorrect: z.boolean(),
                        })),
                    }))
                })),
            })
        )
        .mutation(async ({ input: { courseSlug, levelId, materialId, title, description, items, type }, ctx }) => {
            if (type === "PlacementTest") {
                const course = await ctx.prisma.course.findFirst({ where: { slug: courseSlug }, include: { systemForms: true, levels: { include: { systemForms: true, materialItems: { include: { systemForms: true } } } } } })
                if (course?.systemForms.some(form => form.type === type)) throw new TRPCError({ code: "BAD_REQUEST", message: "Unable to multible forms of the same type!" })
            }
            if (type === "FinalTest") {
                const level = await ctx.prisma.courseLevel.findFirst({ where: { id: levelId }, include: { systemForms: true, materialItems: { include: { systemForms: true } } } })
                if (level?.systemForms.some(form => form.type === type)) throw new TRPCError({ code: "BAD_REQUEST", message: "Unable to multible forms of the same type!" })
            }
            if (type === "Assignment" || type === "Quiz") {
                const item = await ctx.prisma.materialItem.findFirst({ where: { id: materialId }, include: { systemForms: true } })
                if (item?.systemForms.some(form => form.type === type)) throw new TRPCError({ code: "BAD_REQUEST", message: "Unable to multible forms of the same type!" })
            }

            const totalScore = items.map(item => item.questions.map(q => q.points).reduce((a, b) => a + b, 0)).reduce((a, b) => a + b, 0)

            const systemForm = await ctx.prisma.systemForm.create({
                data: {
                    title,
                    description,
                    type,
                    totalScore,
                    course: courseSlug ? {
                        connect: {
                            slug: courseSlug
                        }
                    } : undefined,
                    courseLevel: levelId ? {
                        connect: {
                            id: levelId
                        }
                    } : undefined,
                    materialItem: materialId ? {
                        connect: {
                            id: materialId
                        }
                    } : undefined,
                    items: {
                        create: items.map(({ questions, title, type, imageUrl }) => ({
                            type,
                            title,
                            imageUrl,
                            altText: "image",
                            caption: "caption",
                            questions: {
                                create: questions.map(question => ({
                                    questionText: question.questionText,
                                    type: question.type,
                                    points: question.points,
                                    required: question.required,
                                    shuffle: question.shuffle,
                                    choiceType: question.choiceType,
                                    options: {
                                        create: question.options.map(({ isCorrect, value }) => ({
                                            value,
                                            isCorrect,
                                        }))
                                    },
                                }))
                            }
                        }))
                    },
                    createdBy: ctx.session.user.email,
                    updatedBy: ctx.session.user.email,
                },
            });

            return {
                systemForm,
            };
        }),
    createGoogleForm: protectedProcedure
        .input(
            z.object({
                clientId: z.string(),
                formUrl: z.string(),
                materialId: z.string().optional(),
                levelId: z.string().optional(),
                courseSlug: z.string().optional(),
                type: z.enum(validSystemFormTypes),
            })
        )
        .mutation(async ({ input: { clientId, formUrl, courseSlug, levelId, materialId, type }, ctx }) => {
            if (type === "PlacementTest") {
                const course = await ctx.prisma.course.findFirst({ where: { slug: courseSlug }, include: { systemForms: true, levels: { include: { systemForms: true, materialItems: { include: { systemForms: true } } } } } })
                if (course?.systemForms.some(form => form.type === type)) throw new TRPCError({ code: "BAD_REQUEST", message: "Unable to multible forms of the same type!" })
            }
            if (type === "FinalTest") {
                const level = await ctx.prisma.courseLevel.findFirst({ where: { id: levelId }, include: { systemForms: true, materialItems: { include: { systemForms: true } } } })
                if (level?.systemForms.some(form => form.type === type)) throw new TRPCError({ code: "BAD_REQUEST", message: "Unable to multible forms of the same type!" })
            }
            if (type === "Assignment" || type === "Quiz") {
                const item = await ctx.prisma.materialItem.findFirst({ where: { id: materialId }, include: { systemForms: true } })
                if (item?.systemForms.some(form => form.type === type)) throw new TRPCError({ code: "BAD_REQUEST", message: "Unable to multible forms of the same type!" })
            }

            const formData = await getGoogleFormDetails(formUrl, clientId)

            const { info, items } = formData
            if (!items) throw new TRPCError({ code: "BAD_REQUEST", message: "No items on the selected form!" })

            const googleForm = await ctx.prisma.systemForm.create({
                data: {
                    title: info?.title || "No Title",
                    description: info?.description || "",
                    type,
                    totalScore: getFormTotalPoints(items),
                    googleFormUrl: formUrl,
                    googleClient: { connect: { id: clientId } },
                    course: courseSlug ? {
                        connect: {
                            slug: courseSlug
                        }
                    } : undefined,
                    courseLevel: levelId ? {
                        connect: {
                            id: levelId
                        }
                    } : undefined,
                    materialItem: materialId ? {
                        connect: {
                            id: materialId
                        }
                    } : undefined,
                    items: {
                        create: items.map(item => createFormItemData(item))
                    },
                    updatedBy: ctx.session.user.email,
                    createdBy: ctx.session.user.email,
                },
                include: { items: { include: { questions: { include: { options: true } } } } }
            });

            return {
                googleForm,
                formData,
            };
        }),
    editGoogleForm: protectedProcedure
        .input(
            z.object({
                id: z.string(),
                clientId: z.string(),
                formUrl: z.string(),
            })
        )
        .mutation(async ({ input: { id, clientId, formUrl }, ctx }) => {
            const formData = await getGoogleFormDetails(formUrl, clientId)

            const { info, items } = formData
            if (!items) throw new TRPCError({ code: "BAD_REQUEST", message: "No items on the selected form!" })

            const updatedGoogleForm = await ctx.prisma.systemForm.update({
                where: { id },
                data: {
                    title: info?.title || "No Title",
                    description: info?.description || "",
                    totalScore: getFormTotalPoints(items),
                    googleFormUrl: formUrl,
                    googleClient: { connect: { id: clientId } },
                    items: {
                        create: items.map(item => createFormItemData(item))
                    },
                    updatedBy: ctx.session.user.email,
                },
                include: { items: { include: { questions: { include: { options: true } } } } }
            });

            return {
                updatedGoogleForm,
            };
        }),
    editSystemForm: protectedProcedure
        .input(
            z.object({
                id: z.string(),
                title: z.string(),
                description: z.string(),
                items: z.array(z.object({
                    type: z.enum(validItemTypes),
                    title: z.string(),
                    questions: z.array(z.object({
                        points: z.number(),
                        questionText: z.string(),
                        required: z.boolean(),
                        shuffle: z.boolean(),
                        type: z.enum(validItemQuestionTypes),
                        choiceType: z.enum(validQuestionChoiceTypes),
                        options: z.array(z.object({
                            value: z.string(),
                            isCorrect: z.boolean(),
                        })
                        ),
                    }))
                })),
            })
        )
        .mutation(
            async ({
                ctx,
                input: { id, title, description, items },
            }) => {
                const updatedSystemForm = await ctx.prisma.systemForm.update({
                    where: {
                        id: id,
                    },
                    data: {
                        title,
                        description,
                        items: {
                            create: items.map(({ questions, title, type }) => ({
                                type,
                                title,
                                questions: {
                                    create: questions.map(q => ({
                                        questionText: q.questionText,
                                        points: q.points,
                                        required: q.required,
                                        shuffle: q.shuffle,
                                        type: q.type,
                                        choiceType: q.choiceType,
                                        options: {
                                            create: q.options.map(({ isCorrect, value }) => ({
                                                isCorrect,
                                                value,
                                            }))
                                        },
                                    })),
                                }
                            }))
                        },
                        updatedBy: ctx.session.user.email
                    },
                });

                return { updatedSystemForm };
            }
        ),
    deleteSystemForms: protectedProcedure
        .input(z.array(z.string()))
        .mutation(async ({ input, ctx }) => {
            console.log(ctx.session.user.userRoles);

            if (!hasPermission(ctx.session.user, "courses", "update")) throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not authorized to take this action, please contact your Admin!" })
            const deletedSystemForms = await ctx.prisma.systemForm.deleteMany({
                where: {
                    id: {
                        in: input,
                    },
                },
            });

            return { deletedSystemForms };
        }),
});
