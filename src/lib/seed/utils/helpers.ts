import { femaleNames, maleNames } from "@/lib/seed/data/utils";
import { faker } from "@faker-js/faker";
import { format } from "date-fns";
import { ObjectId } from "mongodb";

export function generateTimestamps(startDate?: Date) {
    const baseDate = startDate || new Date();
    const createdAt = faker.date.between({
        from: faker.date.past({ years: 2, refDate: baseDate }),
        to: baseDate
    });
    const updatedAt = faker.date.between({
        from: createdAt,
        to: baseDate
    });

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

export function generatePhone() {
    const prefixes = [
        '0100', '0101', '0102', '0106',
        '0120', '0121', '0122', '0128',
        '0111', '0112', '0114', '0115',
        '0150', '0151', '0152', '0155',
    ];

    const prefix = faker.helpers.arrayElement(prefixes);
    const number = faker.string.numeric(8);

    return `2${prefix}${number}`;
}

export const generateGroupNumber = (startDate: Date, teacherName: string): string => {
    return `${format(startDate, "do MMM yyyy, hh:mm a")} - ${teacherName}`;
};

export function generateNameAndEmail() {
    const isMale = faker.datatype.boolean();
    const firstName = isMale
        ? faker.helpers.arrayElement(maleNames)
        : faker.helpers.arrayElement(femaleNames);
    const lastName = faker.helpers.arrayElement(maleNames);
    const name = `${firstName} ${lastName}`;
    const email = faker.internet.email({ firstName, lastName: lastName + faker.string.numeric(4) });

    return { firstName, lastName, name, email };
}

export function getRandomFutureSharpDate(baseDate: Date): Date {
    // Step 1: Start from Sunday of the same week
    const day = baseDate.getDay();
    const sunday = new Date(baseDate);
    sunday.setDate(baseDate.getDate() - ((day + 5) % 7));
    sunday.setHours(0, 0, 0, 0);

    // Step 2: Add 0–13 days (same week or next week)
    const dayOffset = faker.number.int({ min: 0, max: 13 });
    const testDate = new Date(sunday);
    testDate.setDate(sunday.getDate() + dayOffset);

    // Step 3: Set to a weekday (Mon–Fri)
    while (testDate.getDay() === 7 || testDate.getDay() === 6) {
        testDate.setDate(testDate.getDate() + 1);
    }

    // Step 4: Choose working hour (e.g., 9–17)
    const hour = faker.helpers.arrayElement([9, 10, 11, 12, 13, 14, 15, 16]);
    const minute = faker.helpers.arrayElement([0, 30]);

    testDate.setHours(hour, minute, 0, 0);

    return testDate;
}

export function getSubmissionScore(questions: { _id: ObjectId; points: number }[], answers: { questionId: ObjectId; isCorrect: boolean }[]) {
    return questions.map(question => answers.some(answer => answer.questionId.equals(question._id) && answer.isCorrect) ? question.points : 0).reduce((a, b) => a + b, 0)
}

export function mapCourseStatusToGroupStatus(courseStatus: string): string {
    switch (courseStatus) {
        case "Ongoing":
            return "Active";
        case "Completed":
            return "Completed";
        case "Postponded":
            return "Paused";
        case "Cancelled":
        case "Refunded":
            return "Cancelled";
        default:
            return "Inactive";
    }
};
