import { env } from "@/env.mjs";
import { validLeadInteractionsType, validLeadSources, validSessionStatuses } from "@/lib/enumsTypes";
import { courses, salesAgentsData, systemFormData, trainersData } from "@/lib/mockData/data";
import { generateGroupNumnber, getGroupSessionDays, getSubmissionScore, leadsCodeGenerator, orderCodeGenerator } from "@/lib/utils";
import { Course, CourseStatuses, DefaultStage, Devices, OrderStatus, Prisma, PrismaClient, SessionStatus, SystemFormTypes } from "@prisma/client";

export const generateSalesAgents = async (prisma: PrismaClient) => {
    const addedAgents = await prisma.$transaction(
        salesAgentsData.map(agent => (
            prisma.user.create({
                data: {
                    name: agent.name,
                    email: agent.email,
                    emailVerified: new Date(),
                    hashedPassword: agent.password,
                    phone: agent.phone,
                    image: agent.image,
                    SalesAgent: { create: {} },
                    userRoles: [agent.agentType],
                    ...generateTimestamps(),
                },
            })
        ))
    );

    return addedAgents
}

export const generateTrainers = async (prisma: PrismaClient) => {
    const addedTrainers = await prisma.$transaction(
        trainersData.map(trainer => (
            prisma.user.create({
                data: {
                    name: trainer.name,
                    email: trainer.email,
                    emailVerified: new Date(),
                    hashedPassword: trainer.password,
                    phone: trainer.phone,
                    image: trainer.image,
                    teacher: trainer.trainerRole === "Teacher" ? { create: {} } : undefined,
                    tester: trainer.trainerRole === "Tester" ? { create: {} } : undefined,
                    userRoles: [trainer.trainerRole],
                    ...generateTimestamps(),
                },
            })
        ))
    );

    return addedTrainers
}

export const generateCourses = async (prisma: PrismaClient) => {
    const addedCourses = await prisma.$transaction(
        courses.map(course => (
            prisma.course.create({
                data: {
                    name: course.name,
                    slug: course.slug,
                    image: course.image,
                    description: course.description,
                    groupPrice: course.groupPrice,
                    privatePrice: course.privatePrice,
                    instructorPrice: course.instructorPrice,
                    createdAt: course.createdAt,
                    updatedAt: course.updatedAt,
                },
                include: { levels: true }
            })
        ))
    );

    return addedCourses
};

export const generateLevels = async (prisma: PrismaClient) => {
    const addedLevels = await prisma.$transaction(
        courses.flatMap(course => course.levels.map(level => (
            prisma.courseLevel.create({
                data: {
                    name: level.name,
                    slug: level.slug,
                    course: { connect: { slug: course.slug } },
                    ...generateTimestamps(),
                },
            })
        )))
    );

    return addedLevels
};

export const generateMaterials = async (prisma: PrismaClient) => {
    const createdCourses = await prisma.course.findMany({ include: { levels: true } })

    const addedMaterials = await prisma.$transaction(
        courses.flatMap(course => course.levels.flatMap(level => level.materials.map((item, idx) => prisma.materialItem.create({
            data: {
                title: item.title,
                subTitle: item.subTitle,
                slug: item.slug,
                sessionOrder: idx + 1,
                uploads: item.uploads,
                type: "Upload",
                courseLevel: { connect: { id: createdCourses.find(c => c.slug === course.slug)?.levels.find(lvl => level.slug === lvl.slug)?.id } },
                ...generateTimestamps(),
            },
        }))))
    );

    return addedMaterials
};

export const createSystemForm = async (connector: string, type: SystemFormTypes, prisma: PrismaClient) => {
    const placementTest = systemFormData.placementTest
    const finalTest = systemFormData.finalTest
    const assignment = systemFormData.assignment
    const quiz = systemFormData.quiz

    const form = type === "PlacementTest" ? placementTest : type === "FinalTest" ? finalTest : type === "Quiz" ? quiz : assignment

    const totalScore = form.items.map(item => item.questions.map(q => q.points).reduce((a, b) => a + b, 0)).reduce((a, b) => a + b, 0)

    return prisma.systemForm.create({
        data: {
            title: form.title,
            description: form.description,
            type: form.type,
            totalScore,
            course: type === "PlacementTest" ? {
                connect: {
                    slug: connector
                }
            } : undefined,
            courseLevel: type === "FinalTest" ? {
                connect: {
                    id: connector
                }
            } : undefined,
            materialItem: (type === "Quiz" || type === "Assignment") ? {
                connect: {
                    id: connector
                }
            } : undefined,
            items: {
                create: form.items.map(({ questions, title, type, imageUrl }) => ({
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
            ...generateTimestamps(),
            ...generateCreatorUpdator(),
        },
    })
};

export const generateLeads = async (inputCourses: Course[], prisma: PrismaClient) => {
    const maleNames = [
        "Ahmed", "Karim", "Youssef", "Tamer", "Mohamed", "Sherif", "Omar", "Amr", "Eslam",
        "Khaled", "Mahmoud", "Fadi", "Ziad", "Ramy", "Tarek", "Ali", "Hassan"
    ];

    const femaleNames = [
        "Mona", "Fatima", "Nadia", "Amira", "Reem", "Huda", "Talaat", "Sara",
        "Laila", "Mariam", "Dalia", "Rasha", "Hala", "Mai", "Yasmin", "Sonia",
        "Lina", "Salwa", "Salma"
    ];

    const generateName = (index: number) => {
        const isFemale = index % 2 === 0;
        const firstName = isFemale
            ? femaleNames[Math.floor(Math.random() * femaleNames.length)]
            : maleNames[Math.floor(Math.random() * maleNames.length)];

        const lastName = maleNames[Math.floor(Math.random() * maleNames.length)]

        return `${firstName} ${lastName}`;
    };
    const generateEmail = (index: number, name: string) => {
        return `${name.replace(' ', '').toLowerCase()}${index + 1}@gmail.com`;
    };
    const generatePhone = (index: number) => `201${(10 + index).toString().padStart(8, '0')}`;

    const leadDistribution = {
        Converted: Math.floor(1134 * (0.75 + (Math.random() * (0.05) - 0.025))),
        Qualified: Math.floor(1134 * (0.075 + (Math.random() * (0.015) - 0.0075))),
        Intake: Math.floor(1134 * (0.075 + (Math.random() * (0.015) - 0.0075))),
        Lost: Math.floor(1134 * (0.05 + (Math.random() * (0.01) - 0.005))),
        NotQualified: Math.floor(1134 * (0.05 + (Math.random() * (0.01) - 0.005))),
    };

    const deviceDistribution = {
        Mobile: Math.floor(1134 * 0.48),
        Tablet: Math.floor(1134 * 0.24),
        Desktop: Math.floor(1134 * 0.38),
    };

    const leads = [];
    let currentIndex = 0;

    const notes = [
        "Follow-up on next steps.",
        "Lead not responsive.",
        "Scheduled a demo.",
        "Interested in pricing.",
        "Needs more information about the course."
    ];

    const labels = [
        "High Priority",
        "Needs Follow-up",
        "Qualified Lead",
        "Demo Requested",
        "Not Interested"
    ];

    const interactions = validLeadInteractionsType;

    for (const stage of Object.keys(leadDistribution)) {
        const stageCount = leadDistribution[stage as DefaultStage];


        for (let i = 0; i < stageCount; i++) {
            const name = generateName(currentIndex)
            const email = generateEmail(currentIndex, name);
            const phone = generatePhone(currentIndex);

            leads.push({
                name,
                email,
                phone,
                leadStage: stage,
            });

            currentIndex++;
        }
    }

    const devices: Devices[] = [];
    let deviceIndex = 0;

    for (const [device, count] of Object.entries(deviceDistribution)) {
        for (let i = 0; i < count; i++) {
            devices[deviceIndex++] = device as Devices;
        }
    }

    const agents = await prisma.salesAgent.findMany({ include: { leads: true } })

    const leadLabels = await prisma.$transaction(labels.map(l => prisma.leadLabel.create({ data: { value: l } })))

    const orderStatusDistribution = {
        Paid: Math.floor(2134 * 0.867),
        Pending: Math.floor(2134 * 0.133),
    };

    const statuses: OrderStatus[] = []

    for (const status of Object.keys(orderStatusDistribution)) {
        const statusCount = orderStatusDistribution[status as keyof typeof orderStatusDistribution];

        for (let i = 0; i < statusCount; i++) {
            statuses.push(status as OrderStatus);

            currentIndex++;
        }
    }

    const agentsWithLeadsCount = agents.map(agent => ({
        agentId: agent.id,
        leadsCount: agent.leads.length
    })).sort((a, b) => a.leadsCount - b.leadsCount)

    const generatedLeads = await prisma.$transaction(
        leads.map((lead, i) => {
            const selectedCourse = inputCourses[Math.floor(Math.random() * inputCourses.length)]!;
            const coursePrice = i % 2 === 0 ? selectedCourse.groupPrice : selectedCourse.privatePrice;
            const agentIndex = i % agentsWithLeadsCount.length
            const orderNumber = orderCodeGenerator();
            const paymentLink = `${env.PAYMOB_BASE_URL}/unifiedcheckout/?publicKey=${env.PAYMOB_PUBLIC_KEY}&clientSecret=intentResponse.client_secret`;
            const timeStamps = generateTimestamps()
            const now = new Date()
            const oneMonthAgo = new Date();
            oneMonthAgo.setMonth(now.getMonth() - 1);

            return prisma.lead.create({
                data: {
                    email: lead.email,
                    name: lead.name,
                    phone: lead.phone,
                    code: leadsCodeGenerator(timeStamps.createdAt),
                    isAssigned: false,
                    isAutomated: false,
                    isReminderSet: false,
                    source: validLeadSources[Math.floor(Math.random() * validLeadSources.length)]!,
                    assignee: { connect: { id: agentsWithLeadsCount[agentIndex]?.agentId } },
                    user: {
                        create: {
                            email: lead.email,
                            name: lead.name!,
                            phone: lead.phone,
                            device: devices[i],
                            ...timeStamps,
                        }
                    },
                    orderDetails: lead.leadStage === "Converted" ? {
                        create: {
                            amount: coursePrice,
                            orderNumber,
                            paymentId: "intentResponse.id",
                            paymentLink,
                            course: { connect: { slug: selectedCourse.slug } },
                            user: {
                                connectOrCreate: {
                                    where: { email: lead.email }, create: {
                                        email: lead.email,
                                        name: lead.name!,
                                        phone: lead.phone,
                                        device: devices[i],
                                        ...timeStamps,
                                    }
                                }
                            },
                            status: timeStamps.createdAt < oneMonthAgo ? "Paid" : statuses[i],
                            courseType: { id: selectedCourse.id, isPrivate: i % 2 === 0 ? false : true },
                            ...timeStamps,
                        }
                    } : undefined,
                    leadStage: {
                        connect: { name: lead.leadStage },
                    },
                    interactions: {
                        createMany: {
                            data: interactions.slice(Math.floor(Math.random() * 3)).map(inter => {
                                const interactionType = interactions[Math.floor(Math.random() * interactions.length)]!;
                                const description = notes[Math.floor(Math.random() * notes.length)]!;
                                const agent = agents[Math.floor(Math.random() * agents.length)]!;

                                return {
                                    type: interactionType,
                                    description: description,
                                    salesAgentId: agent.userId,
                                    ...generateTimestamps(timeStamps.createdAt),
                                }
                            })
                        }
                    },
                    labels: {
                        connect: { id: leadLabels[Math.floor(Math.random() * labels.length)]?.id! }
                    },
                    notes: {
                        create: notes.slice(Math.floor(Math.random() * 2)).map(note => ({
                            value: note,
                            ...generateTimestamps(timeStamps.createdAt),
                        }))
                    },
                    ...timeStamps,
                }
            })
        })
    )

    return generatedLeads;
};

export const generatePlacementTests = async (prisma: PrismaClient) => {
    const convertedLeads = await prisma.lead.findMany({
        where: { leadStage: { defaultStage: "Converted" } },
        include: {
            orderDetails: { include: { course: { include: { systemForms: true } }, user: true } },
            assignee: { include: { user: true } }
        }
    })

    const testers = await prisma.tester.findMany({ include: { user: true } })

    return await prisma.$transaction(convertedLeads.map(lead => {
        const timeStamps = generateTimestamps(lead.updatedAt)
        const oralTestTime = new Date(timeStamps.createdAt)
        oralTestTime.setDate(timeStamps.createdAt.getDate() + Math.random() * 23)
        oralTestTime.setMinutes(oralTestTime.getTime() < 30 ? 30 : 60)

        return prisma.placementTest.create({
            data: {
                course: { connect: { id: lead.orderDetails?.course.id } },
                student: { connect: { id: lead.orderDetails?.user.id } },
                tester: { connect: { id: testers[Math.floor(Math.random() * testers.length)]?.id } },
                createdBy: { connect: { id: lead.assignee?.user.id } },
                writtenTest: { connect: { id: lead.orderDetails?.course.systemForms.find(f => f.type === "PlacementTest")?.id } },
                zoomSessions: {
                    create: {
                        sessionDate: oralTestTime,
                        meetingNumber: "77569231226",
                        meetingPassword: "abcd1234",
                        sessionStatus: oralTestTime.getTime() > new Date().getTime() ? "Scheduled" : "Completed",
                    }
                },
                oralTestTime,
                ...timeStamps
            },
        })
    }))
}

export const generatePlacementTestsSubmissions = async (prisma: PrismaClient) => {
    const orders = await prisma.order.findMany({
        include: {
            course: {
                include: {
                    systemForms: { include: { items: { include: { questions: { include: { options: true } } } } } },
                }
            },
            user: {
                include: {
                    courseStatus: {
                        include: {
                            level: {
                                include: {
                                    materialItems: { include: { systemForms: { include: { items: { include: { questions: { include: { options: true } } } } } } } },
                                    systemForms: { include: { items: { include: { questions: { include: { options: true } } } } } }
                                }
                            }
                        }
                    },
                    zoomGroups: { include: { course: true, zoomSessions: true, courseLevel: true } },
                }
            }
        }
    })

    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    return await Promise.all(
        orders.map(async (order) => {
            const course = order.course;
            const level = order.user.courseStatus.find((s) => s.courseId === course.id)?.level;
            const materials = level?.materialItems.flatMap((item) => item.systemForms) || [];
            const zoomGroup = order.user.zoomGroups.find(g => g.course?.id === course.id && g.courseLevel?.id === level?.id)

            const placementTest = course.systemForms[0]!;
            const finalTest = level?.systemForms[0]!;
            const assignments = materials.filter((m) => m.type === "Assignment");
            const quizzes = materials.filter((m) => m.type === "Quiz");

            const generateSubmission = (form: typeof placementTest, user: typeof order.user, courseSlug: string) => {
                const answers = form.items.flatMap((item) => item.questions).map((q) => ({
                    questionId: q.id,
                    selectedAnswers: [q.options[Math.floor(Math.random() * q.options.length)]?.value!],
                    textAnswer: q.type === "Text" ? "Answer" : undefined,
                }));

                const correctedAnswers = answers.map((ans) => ({
                    ...ans,
                    textAnswer: ans.textAnswer || null,
                    isCorrect: ans.selectedAnswers.every((answer) =>
                        form.items.flatMap((item) => item.questions).find((q) => q.id === ans.questionId)?.options.some((o) => o.value === answer && o.isCorrect)
                    ),
                }));

                const zoomGroupId = user.zoomGroups.find((group) => group.course?.slug === courseSlug)?.id;
                const zoomSessionId = user.zoomGroups.find((group) => group.course?.slug === courseSlug)?.zoomSessions.find((session) => session.materialItemId === form.materialItemId)?.id;

                console.log("will create", {
                    data: {
                        answers: correctedAnswers,
                        totalScore: getSubmissionScore(form?.items.flatMap((item) => item.questions), correctedAnswers),
                        student: { connect: { id: user.id } },
                        systemForm: { connect: { id: form.id } },
                        zoomGroup: (form.type === "PlacementTest" || form.type === "FinalTest") && zoomGroupId
                            ? { connect: { id: zoomGroupId } }
                            : undefined,
                        assignmentZoomSession: form.type === "Assignment" && zoomSessionId
                            ? { connect: { id: zoomSessionId } }
                            : undefined,
                        quizZoomSession: form.type === "Quiz" && zoomSessionId
                            ? { connect: { id: zoomSessionId } }
                            : undefined,
                    },
                })

                return prisma.systemFormSubmission.create({
                    data: {
                        answers: correctedAnswers,
                        totalScore: getSubmissionScore(form?.items.flatMap((item) => item.questions), correctedAnswers),
                        student: { connect: { id: user.id } },
                        systemForm: { connect: { id: form.id } },
                        zoomGroup: (form.type === "PlacementTest" || form.type === "FinalTest") && zoomGroupId
                            ? { connect: { id: zoomGroupId } }
                            : undefined,
                        assignmentZoomSession: form.type === "Assignment" && zoomSessionId
                            ? { connect: { id: zoomSessionId } }
                            : undefined,
                        quizZoomSession: form.type === "Quiz" && zoomSessionId
                            ? { connect: { id: zoomSessionId } }
                            : undefined,
                    },
                });
            };

            const transactions: ReturnType<typeof generateSubmission>[] = [];

            if (order.updatedAt < oneMonthAgo) {
                transactions.push(generateSubmission(placementTest, order.user, course.slug));
            }

            if (order.user.zoomGroups.some((group) =>
                group.zoomSessions.every((session) => new Date(session.sessionDate) < new Date()) && group.course?.id === course.id
            )) {
                transactions.push(generateSubmission(finalTest, order.user, course.slug));
            }

            transactions.push(
                ...(assignments.filter((assignment) =>
                    zoomGroup?.zoomSessions.find((session) =>
                        session.sessionStatus === validSessionStatuses[3] && session.materialItemId === assignment.materialItemId
                    )
                ).map((assignment) => generateSubmission(assignment, order.user, course.slug)))
            );

            transactions.push(
                ...(quizzes.filter((quiz) =>
                    zoomGroup?.zoomSessions.find((session) =>
                        session.sessionStatus === validSessionStatuses[3] && session.materialItemId === quiz.materialItemId
                    )
                ).map((quiz) => generateSubmission(quiz, order.user, course.slug)))
            );

            return await prisma.$transaction(transactions);
        })
    );
}

export const generateCourseStatuses = async (prisma: PrismaClient) => {
    const orders = await prisma.order.findMany({ include: { course: { include: { levels: true } } } })

    return await prisma.$transaction(orders.map((order, i) => {
        const now = new Date();
        const twoMonthsAgo = new Date();
        twoMonthsAgo.setMonth(now.getMonth() - 2);

        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(now.getMonth() - 1);

        const thisWeekStart = new Date();
        thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());

        let status: CourseStatuses;

        if (order.createdAt < twoMonthsAgo && order.status === "Paid") {
            status = "Completed";
        } else if (order.createdAt >= twoMonthsAgo && order.createdAt < oneMonthAgo && order.status === "Paid") {
            status = "Ongoing";
        } else if (order.createdAt >= oneMonthAgo && order.createdAt < thisWeekStart && order.status === "Paid") {
            status = "Waiting";
        } else if (order.status === "Pending") {
            status = "OrderCreated";
        } else if (order.status === "Paid") {
            status = "OrderPaid"
        } else {
            status = "Refunded"
        }

        const timeStamps = generateTimestamps(order.updatedAt)

        return prisma.courseStatus.create({
            data: {
                status,
                course: { connect: { id: order.courseId } },
                user: { connect: { id: order.userId } },
                level: timeStamps.updatedAt < new Date() ? { connect: { id: order.course.levels[Math.floor(Math.random() * order.course.levels.length)]?.id } } : undefined,
                ...timeStamps,
            }
        })
    }))
}

export const generateUserNotes = async (prisma: PrismaClient) => {
    const orders = await prisma.order.findMany({ include: { course: true, user: true, lead: { include: { assignee: { include: { user: true } } } } } })

    await prisma.$transaction(orders.map(order => prisma.userNote.create({
        data: {
            sla: 0,
            status: "Closed",
            title: `An Order Placed by ${order.user.name}`,
            type: "Info",
            createdForStudent: { connect: { id: order.user.id } },
            messages: [{
                message: `An order was placed by ${order.lead.assignee?.user.name} for Student ${order.user.name} regarding course ${order.course?.name} for a ${order.courseType.isPrivate ? "private" : "group"} purchase the order is now awaiting payment\nPayment Link: ${order.paymentLink}`,
                updatedAt: new Date(),
                updatedBy: "System"
            }],
            createdByUser: { connect: { id: order.lead.assignee?.user.id } },
            ...generateTimestamps(order.createdAt),
        }
    })))
}

export const generateZoomGroups = async (prisma: PrismaClient) => {
    const orders = await prisma.order.findMany({
        include: {
            course: {
                include: {
                    levels: {
                        include: {
                            materialItems: true
                        }
                    }
                }
            },
            user: { include: { courseStatus: true } },
        }
    });

    const teachers = await prisma.user.findMany({
        where: {
            AND: [
                { userRoles: { has: "Teacher" } },
                { NOT: { userRoles: { has: "Admin" } } }
            ],
        },
        include: { teacher: true }
    });

    const teacherGroups: { orders: typeof orders[number][], teacher: typeof teachers[number], courseId: string, courseName: string, levelId: string, levelName: string }[][] = teachers.map(() => []);
    const createGroup = (teacher: typeof teachers[number], ordersInner: typeof orders[number][], courseId: string, courseName: string, levelId: string, levelName: string) => ({
        orders: ordersInner,
        teacher,
        courseId,
        courseName,
        levelId,
        levelName,
    });

    orders.forEach((order, index) => {
        const teacher = teachers[index % teachers.length]!; // Rotate through teachers

        const courseStatus = order.user.courseStatus.find(
            s => s.courseId === order.courseId && s.userId === order.userId
        );
        if (!courseStatus) return;

        const levelId = courseStatus.courseLevelId!;

        const course = order.course;
        const level = order.course.levels.find(l => l.id === levelId);

        if (!course || !level) return;

        const courseName = course.name;
        const levelName = level.name;

        if (order.courseType.isPrivate) {
            const group = createGroup(teacher, [order], order.courseId, courseName, levelId, levelName);
            teacherGroups[teachers.indexOf(teacher)]?.push(group);
        } else {
            const teacherGroup = teacherGroups[teachers.indexOf(teacher)]!;
            let group = teacherGroup.find(
                g =>
                    g.orders.length < 8 &&
                    g.courseId === order.courseId &&
                    g.levelId === levelId
            );

            if (!group) {
                group = createGroup(teacher, [], order.courseId, courseName, levelId, levelName);
                teacherGroup.push(group);
            }

            group.orders.push(order);
        }
    });

    for (const teacherGroup of teacherGroups) {
        for (const group of teacherGroup) {
            const timeStamps = generateTimestamps()
            const startDate = new Date(timeStamps.createdAt.setMinutes(timeStamps.createdAt.getMinutes() - 30 < 0 ? 0 : 30))
            if (startDate.getDay() === 5) {
                startDate.setDate(startDate.getDate() + 2);
            }
            const level = group.orders.map(({ course, user, courseId, userId }) => course.levels.find(l => l.id === user.courseStatus.find(s => s.courseId === courseId && s.userId === userId)?.courseLevelId))[0];
            const zoomClient = await prisma.zoomClient.findFirst();
            if (!zoomClient) return

            const groupNumber = generateGroupNumnber(startDate, teacherGroup[0]?.teacher.name!, group.courseName);

            const generateZoomSessions = async (startDate: Date, level: any, zoomClientId: string) => {
                const sessions: Prisma.ZoomSessionCreateManyZoomGroupInput[] = [];
                let currentDate = new Date(startDate);
                const startDay = currentDate.getDay();
                const days = getGroupSessionDays(startDay)

                for (let index = 0; index < level.materialItems.length; index++) {
                    const materialItem = level.materialItems[index];
                    while (!sessions[index]) {
                        if (days.some((day) => day === currentDate.getDay())) {
                            const sessionStatus = new Date(currentDate) > new Date()
                                ? SessionStatus.Scheduled
                                : new Date(currentDate) > new Date(new Date().setHours(new Date().getHours() - 2))
                                    ? SessionStatus.Ongoing
                                    : SessionStatus.Completed;

                            sessions.push({
                                sessionStatus,
                                sessionDate: new Date(currentDate),
                                meetingNumber: "77569231226",
                                meetingPassword: "abcd1234",
                                materialItemId: materialItem.id,
                                zoomClientId,
                                attenders: sessionStatus === "Completed" ? {
                                    set: group.orders.map(o => o.user.id).slice(Math.floor(Math.random() * group.orders.length) + 1)
                                } : sessionStatus === "Ongoing" ? {
                                    set: group.orders.map(o => o.user.id).slice(Math.floor(Math.random() * group.orders.length) + 1)
                                } : undefined,
                            });
                        }
                        currentDate.setDate(currentDate.getDate() + 1);
                    }
                }

                return sessions;
            };

            const zoomSessions = await generateZoomSessions(startDate, level, zoomClient.id);

            const courseStatus = await prisma.courseStatus.findFirst({
                where: {
                    AND: [
                        { userId: { in: group.orders.map(o => o.userId) } },
                        { courseId: group.courseId },
                    ]
                },
            });

            const groupStatus = courseStatus?.status === "Completed" ? "Completed" : "Active";

            const zoomGroup = await prisma.zoomGroup.create({
                data: {
                    startDate: startDate,
                    meetingNumber: "1234",
                    meetingPassword: "1234",
                    groupNumber,
                    groupStatus,
                    zoomSessions: {
                        createMany: {
                            data: zoomSessions,
                        },
                    },
                    students: {
                        connect: group.orders.map(o => ({ id: o.userId }))
                    },
                    teacher: { connect: { userId: group.teacher.id } },
                    course: { connect: { id: group.courseId } },
                    courseLevel: { connect: { id: group.levelId } },
                    ...timeStamps
                },
                include: {
                    course: true,
                    zoomSessions: { include: { materialItem: true, zoomClient: true } },
                    students: true,
                    teacher: { include: { user: true } },
                },
            });

            await prisma.$transaction(
                zoomGroup.zoomSessions.map((session, idx) =>
                    prisma.zoomSession.update({
                        where: { id: session.id },
                        data: {
                            meetingNumber: "77569231226",
                            meetingPassword: "abcd1234",
                        }
                    })
                )
            );

            await Promise.all(zoomGroup.students.map(async (student) => {
                await prisma.userNote.create({
                    data: {
                        sla: 0,
                        status: "Closed",
                        title: `Zoom Group Created for Student`,
                        type: "Info",
                        createdForStudent: { connect: { id: student.id } },
                        messages: [{
                            message: `The student was added to a Zoom group ${zoomGroup.groupNumber}`,
                            updatedAt: new Date(),
                            updatedBy: "System"
                        }],
                        createdByUser: { connect: { id: student.id } },
                        ...timeStamps,
                    }
                });
            }));
        }
    }
}

export const generateQuizs = async (prisma: PrismaClient) => {
    const materials = await prisma.materialItem.findMany()

    return await Promise.all(
        materials.map(async material => await createSystemForm(material.id, "Quiz", prisma))
    )
}

export const generateAssignments = async (prisma: PrismaClient) => {
    const materials = await prisma.materialItem.findMany()

    return await Promise.all(
        materials.map(async material => await createSystemForm(material.id, "Assignment", prisma))
    )
}

export const generatePlacements = async (prisma: PrismaClient) => {
    const courses = await prisma.course.findMany()

    return await Promise.all(
        courses.map(async course => await createSystemForm(course.slug, "PlacementTest", prisma))
    )
}

export const generateFinals = async (prisma: PrismaClient) => {
    const levels = await prisma.courseLevel.findMany()

    return await Promise.all(
        levels.map(async level => await createSystemForm(level.id, "FinalTest", prisma))
    )
}

export function generateTimestamps(startDate?: Date) {
    const today = new Date();
    const earliestStartDate = startDate || new Date(today.getFullYear() - 2, today.getMonth(), today.getDate())

    const createdAt = new Date(
        earliestStartDate.getTime() +
        Math.random() * (today.getTime() - earliestStartDate.getTime())
    );

    const updatedAt = new Date(
        createdAt.getTime() +
        Math.random() * (today.getTime() - createdAt.getTime())
    );

    return {
        createdAt,
        updatedAt,
    };
}

export function generateCreatorUpdator() {
    return {
        createdBy: "admin@gmail.com",
        updatedBy: "admin@gmail.com",
    };
}
