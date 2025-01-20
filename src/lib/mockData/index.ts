import { generateAssignments, generateCourses, generateCourseStatuses, generateFinals, generateLeads, generateLevels, generateMaterials, generatePlacements, generatePlacementTests, generatePlacementTestsSubmissions, generateQuizs, generateSalesAgents, generateTrainers, generateUserNotes, generateZoomGroups } from "@/lib/mockData/dataGenerators"
import { PrismaClient } from "@prisma/client"

export const LetsGo = async (prisma: PrismaClient) => {
    const agents = await generateSalesAgents(prisma)
    const trainers = await generateTrainers(prisma)
    const courses = await generateCourses(prisma)
    const levels = await generateLevels(prisma)
    const materials = await generateMaterials(prisma)
    const placementTestsForms = await generatePlacements(prisma)
    const finalTests = await generateFinals(prisma)
    const quizzes = await generateQuizs(prisma)
    const assignments = await generateAssignments(prisma)
    const leads = await generateLeads(courses, prisma)
    const courseStatuses = await generateCourseStatuses(prisma)
    const userNotes = await generateUserNotes(prisma)
    const zoomGroups = await generateZoomGroups(prisma)
    const placementTests = await generatePlacementTests(prisma)
    const placementTestsSubmissions = await generatePlacementTestsSubmissions(prisma)

    return {
        agents,
        trainers,
        courses,
        levels,
        materials,
        placementTestsForms,
        finalTests,
        quizzes,
        assignments,
        leads,
        courseStatuses,
        userNotes,
        zoomGroups,
        placementTests,
        placementTestsSubmissions,
    }
}