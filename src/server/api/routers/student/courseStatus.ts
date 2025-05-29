import { z } from "zod";
import {
    createTRPCRouter,
    protectedProcedure,
} from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";

import { hasPermission } from "@/server/permissions";
import { LevelColumn } from "@/components/student/myCoursesComponents/course-components/levels-columns";
import { SessionStatus } from "@prisma/client";

export const courseStatusRouter = createTRPCRouter({
    getByCourse: protectedProcedure
        .input(z.object({
            courseSlug: z.string()
        }))
        .query(async ({ ctx, input: { courseSlug } }) => {
            // Get all courseStatus records for this user and course, including level, group, sessions, assignments, quizzes, final test, teacher, and certificate
            const courseStatus = await ctx.prisma.courseStatus.findMany({
                where: {
                    user: { id: ctx.session.user.id },
                    course: { slug: courseSlug },
                },
                include: {
                    level: {
                        include: {
                            materialItems: true,
                            zoomGroups: {
                                where: {
                                    course: { slug: courseSlug },
                                    students: { some: { id: ctx.session.user.id } }
                                },
                                include: {
                                    zoomSessions: {
                                        include: {
                                            assignments: {
                                                where: { studentId: ctx.session.user.id },
                                                include: { systemForm: true }
                                            },
                                            quizzes: {
                                                where: { studentId: ctx.session.user.id },
                                                include: { systemForm: true }
                                            },
                                        },
                                    },
                                    teacher: {
                                        include: {
                                            user: true,
                                        },
                                    },
                                    finalTests: {
                                        where: { studentId: ctx.session.user.id },
                                        include: { systemForm: true }
                                    },
                                },
                            },
                            certificates: {
                                where: { userId: ctx.session.user.id },
                            },
                        },
                    },
                },
            });

            // Transform the data for the frontend
            const levels = courseStatus.map((status) => {
                const level = status.level;
                if (!level) return null;
                const levelSlug = level.slug;

                const allGroups = level.zoomGroups ?? [];
                const group = allGroups.find(g =>
                    g.studentIds.includes(ctx.session.user.id)
                ) || allGroups[0];
                const groupStatus = group?.groupStatus || "Cancelled";
                const groupId = group?.id || "";

                const sessions = group?.zoomSessions ?? [];
                const sessionCount = sessions.length;

                const attendedSessions = sessions.filter(s =>
                    s.attenders && s.attenders.includes(ctx.session.user.id)
                ).length;
                const attendance = sessionCount > 0 ? Math.round((attendedSessions / sessionCount) * 100) : 0;

                const completedSessions = sessions.filter(s =>
                    s.sessionStatus === "Completed"
                ).length;

                const missedSessions = `${sessionCount - attendedSessions} / ${sessionCount}`;

                const allAssignments = sessions.flatMap(s => s.assignments ?? []);
                const allQuizzes = sessions.flatMap(s => s.quizzes ?? []);

                const assignmentScore = allAssignments.reduce((sum, a) => sum + (a.totalScore ?? 0), 0);
                const assignmentTotal = allAssignments.reduce((sum, a) => sum + (a.systemForm?.totalScore ?? 0), 0);
                const avgAssignmentScore = allAssignments.length
                    ? `${Math.round(assignmentScore / allAssignments.length)} / ${Math.round(assignmentTotal / allAssignments.length)}`
                    : "-";

                const quizScore = allQuizzes.reduce((sum, q) => sum + (q.totalScore ?? 0), 0);
                const quizTotal = allQuizzes.reduce((sum, q) => sum + (q.systemForm?.totalScore ?? 0), 0);
                const avgQuizScore = allQuizzes.length
                    ? `${Math.round(quizScore / allQuizzes.length)} / ${Math.round(quizTotal / allQuizzes.length)}`
                    : "-";

                // Final test (from group.finalTests)
                const finalTest = group?.finalTests?.[0];
                const finalTestPoints = finalTest?.totalScore ?? 0;
                const finalTestTarget = finalTest?.systemForm?.totalScore ?? 0;
                const finalTestScore = finalTestTarget ? (finalTestPoints / finalTestTarget * 100) : 0;

                // Certificate
                const certificate = level.certificates?.[0];
                const certificateUrl = certificate && `/student/my_courses/${courseSlug}/${levelSlug}/certificates/${certificate.id}`;

                // Teacher
                const teacherName = group?.teacher?.user?.name ?? "-";

                // Group type
                const groupType: LevelColumn["groupType"] = status.isPrivate ? "Private" : "Group";

                // Progress: completed sessions / total sessions
                const progress = sessionCount > 0 ? Math.round((completedSessions / sessionCount) * 100) : 0;

                return {
                    id: level.id,
                    name: level.name,
                    courseSlug,
                    levelSlug,
                    groupStatus,
                    groupId,
                    progress,
                    attendance,
                    missedSessions,
                    avgAssignmentScore,
                    avgQuizScore,
                    finalTestScore,
                    certificateUrl,
                    teacherName,
                    groupType,
                    debug: { group }
                };
            }).filter(lvl => lvl !== null);

            // --- Calculate totals/averages for the summary row ---
            function parseScore(score: string): [number, number] {
                if (!score || score === "-" || !score.includes("/")) return [0, 0];
                const [num, denom] = score.split('/').map(s => parseInt(s.trim(), 10));
                if (!num || !denom) return [0, 0]
                return [isNaN(num) ? 0 : num, isNaN(denom) ? 0 : denom];
            }

            function avgOfValid(innerLevels: typeof levels, key: "attendance" | "progress") {
                const valid = innerLevels.map(lvl => lvl[key]).filter(v => typeof v === "number" && !isNaN(v));
                return valid.length ? Math.round(valid.reduce((a, b) => a + (b ?? 0), 0) / valid.length) : 0;
            }

            function sumMissedSessions(innerLevels: typeof levels) {
                let totalMissed = 0, totalSessions = 0;
                innerLevels.forEach(lvl => {
                    if (lvl.missedSessions && lvl.missedSessions.includes("/")) {
                        const [missed, total] = lvl.missedSessions.split('/').map(s => parseInt(s.trim(), 10));
                        if (!missed || !total) return ""
                        if (!isNaN(missed) && !isNaN(total) && total > 0) {
                            totalMissed += missed;
                            totalSessions += total;
                        }
                    }
                });
                return totalSessions > 0 ? `${totalMissed} / ${totalSessions}` : "";
            }

            function avgScore(innerLevels: typeof levels, key: "avgAssignmentScore" | "avgQuizScore"): string {
                // Collect valid [num, denom] pairs
                const validScores = innerLevels
                    .map(lvl => parseScore(lvl[key]))
                    .filter(([num, denom]) => denom > 0);

                if (!validScores.length) return "-";

                // Average the percentages
                const avgPercent = validScores.reduce((sum, [num, denom]) => sum + (num / denom), 0) / validScores.length;

                // Use the average denominator for display (or you can use the first, or just show as percent)
                const avgDenom = Math.round(validScores.reduce((sum, [, denom]) => sum + denom, 0) / validScores.length);
                const avgNum = Math.round(avgPercent * avgDenom);

                return `${avgNum} / ${avgDenom}`;
            }

            const avgAttendance = avgOfValid(levels, "attendance");
            const avgProgress = avgOfValid(levels, "progress");
            const avgAssignmentScore = avgScore(levels, "avgAssignmentScore");
            const avgQuizScore = avgScore(levels, "avgQuizScore");
            const missedSessions = sumMissedSessions(levels);

            const teacherName = levels[levels.length - 1]?.teacherName || "";
            const groupStatus = levels[levels.length - 1]?.groupStatus || "Cancelled";
            const groupType = levels[levels.length - 1]?.groupType || "Group";

            const totalRow: LevelColumn = {
                id: "total",
                name: "Course Average",
                courseSlug,
                levelSlug: "",
                groupStatus,
                groupId: "",
                progress: avgProgress,
                attendance: avgAttendance,
                missedSessions,
                avgAssignmentScore,
                avgQuizScore,
                finalTestScore: 0,
                certificateUrl: "",
                teacherName,
                groupType,
            };

            // Return levels with the total row appended
            return { levels: [...levels, totalRow] };
        }),
    getLevelSessions: protectedProcedure
        .input(z.object({
            courseSlug: z.string(),
            levelSlug: z.string(),
        }))
        .query(async ({ ctx, input: { courseSlug, levelSlug } }) => {
            // Find the group for this user in this level
            const group = await ctx.prisma.zoomGroup.findFirst({
                where: {
                    course: { slug: courseSlug },
                    courseLevel: { slug: levelSlug },
                    students: { some: { id: ctx.session.user.id } },
                },
                include: {
                    teacher: { include: { user: true } },
                    zoomSessions: {
                        include: {
                            materialItem: true,
                            assignments: { where: { studentId: ctx.session.user.id } },
                            quizzes: { where: { studentId: ctx.session.user.id } },
                        },
                        orderBy: { sessionDate: "asc" },
                    },
                    finalTests: { where: { studentId: ctx.session.user.id } },
                    courseLevel: {
                        include: {
                            certificates: { where: { userId: ctx.session.user.id } },
                        },
                    },
                },
            });

            if (!group) throw new TRPCError({ code: "NOT_FOUND", message: "Group not found" });

            // Final test
            const finalTest = group.finalTests?.[0];
            const finalTestLink = `/student/my_courses/${courseSlug}/${levelSlug}/final_test`;
            const finalTestScore = finalTest?.totalScore ?? null;
            const finalTestSubmitted = !!finalTest;

            // Certificate
            const certificate = group.courseLevel?.certificates?.[0];
            const certificateUrl = certificate
                ? `/student/my_courses/${courseSlug}/${levelSlug}/certificate`
                : null;

            // Prepare sessions data
            const sessions = group.zoomSessions.map((session) => {
                const assignment = session.assignments?.[0];
                const quiz = session.quizzes?.[0];
                return {
                    id: session.id,
                    title: session.materialItem?.title ?? "Session",
                    sessionLink: session.materialItem
                        ? `/student/my_courses/${courseSlug}/${levelSlug}/session/${session.id}`
                        : undefined,
                    assignmentLink: session.materialItem
                        ? `/student/my_courses/${courseSlug}/${levelSlug}/assignment/${session.id}`
                        : undefined,
                    quizLink: session.materialItem
                        ? `/student/my_courses/${courseSlug}/${levelSlug}/quiz/${session.id}`
                        : undefined,
                    assignmentScore: assignment?.totalScore ?? null,
                    quizScore: quiz?.totalScore ?? null,
                    contentLinks: session.materialItem?.uploads ?? [],
                    sessionStatus: session.sessionStatus,
                };
            });

            const testSession = {
                id: group.id,
                title: "Final Test",
                sessionLink: `/student/my_courses/${courseSlug}/${levelSlug}/final_test`,
                contentLinks: [],
                sessionStatus: finalTestSubmitted ? "Completed" : "Scheduled" as SessionStatus,
                assignmentLink: undefined,
                quizLink: undefined,
                assignmentScore: undefined,
                quizScore: undefined,
            }

            return {
                group: {
                    id: group.id,
                    groupNumber: group.groupNumber,
                    teacherName: group.teacher?.user?.name ?? "-",
                },
                sessions: [...sessions, testSession],
                finalTest: {
                    link: finalTestLink,
                    score: finalTestScore,
                    submitted: finalTestSubmitted,
                },
                certificateUrl,
            };
        }),
});
