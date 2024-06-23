import { Address, Course, EvaluationForm, EvaluationFormQuestion, EvaluationFormSubmission, MaterialItem, Order, User, ZoomGroup, ZoomSession } from "@prisma/client";
import { type ClassValue, clsx } from "clsx";
import { compareAsc, format } from "date-fns";
import { twMerge } from "tailwind-merge";
import { getInitials } from "./getInitials";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getAddress = (address: Address) => `${address?.city || "no city"
  }, ${address?.state || "no state"}, 
${address?.country || "no country"}`;

export const salesOperationCodeGenerator = () => `SO-${Date.now()}`

export const orderCodeGenerator = () => `CO-${Date.now()}`

export const formatPrice = (price: number) => {
  const formattedPrice = new Intl.NumberFormat('en-EG', {
    style: 'currency',
    currency: 'EGP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);

  return formattedPrice;
};


export const formatPercentage = (value: number) => new Intl.NumberFormat("en-US", {
  style: "percent",
  maximumFractionDigits: 2
}).format(value / 100)

export const formatNumbers = (value: number) => new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(value)

export const getLastWeekDate = (now = new Date()) => new Date(
  now.getFullYear(),
  now.getMonth(),
  now.getDate() - 7,
);

export const isGoodState = (difference: number, isLiability: boolean) => (isLiability && difference < 0) || (!isLiability && difference > 0)

type DataObject = {
  createdAt: Date;
  [key: string]: any;
};

export const getDifferenceMargin = <T extends DataObject>(
  data: T[],
  accessor: keyof T,
): {
  difference: number,
  total: number
} => {
  const now = new Date();
  const lastWeekDate = new Date(now);
  lastWeekDate.setDate(now.getDate() - 7);

  let currentWeekTotal = 0;
  let lastWeekTotal = 0;

  for (const item of data) {
    const itemDate = new Date(item.createdAt);
    const value = Number(item[accessor]);

    if (itemDate.getTime() < lastWeekDate.getTime()) {
      lastWeekTotal += accessor === 'id' ? 1 : value;
      currentWeekTotal += accessor === 'id' ? 1 : value;
    }

    if (itemDate.getTime() >= lastWeekDate.getTime()) {
      currentWeekTotal += accessor === 'id' ? 1 : value;
    }
  }

  const change = currentWeekTotal - lastWeekTotal;

  return {
    difference: change,
    total: currentWeekTotal
  };
}

type CourseType = Course & {
  orders: (Order & {
    user: User
  })[]
}
export const getWaitingList = (course: CourseType): number => {
  return course.orders
    .filter(order => order.user.courseStatus
      .find(status => status.courseId === course.id)?.state === "waiting")
    .filter((order, i, self) => i === self.findIndex(({ userId }) => order.user.id === userId))
    .length
}

export const generateGroupNumnber = (startDate: Date, trainerUserName: string, courseName: string): string => {
  return `${format(startDate.getTime(), "E_do_MMM_hh:mm_aaa")}_${getInitials(trainerUserName)}_${courseName.replaceAll(" ", "_")}`
}

export const calculateAttendancePercentages = (group: ZoomGroup & { zoomSessions: ZoomSession[] }) => {
  const totalStudents = group.studentIds.length;

  const sessionAttendance = group.zoomSessions.filter(session => session.sessionDate < new Date()).map(session => {
    const attendedStudents = session.attenders.length;
    const attendancePercentage = (attendedStudents / totalStudents) * 100;
    return {
      sessionId: session.id,
      attendancePercentage
    };
  });

  const overallAttendancePercentage = sessionAttendance.reduce((acc, session) => acc + session.attendancePercentage, 0) / sessionAttendance.length;

  return {
    sessionAttendance,
    overallAttendancePercentage
  };
}

export const getEvalutaionFormFullMark = (questions: EvaluationFormQuestion[]) => questions.map(question => question.points).reduce((a, b) => a + b, 0)
export const getSubmissionScoreAndPercentage = (evaluationForm: EvaluationForm, submissions: EvaluationFormSubmission[]) => {
  const submissionScore = submissions.find(submission => submission.evaluationFormId === evaluationForm.id)?.rating || 0
  return {
    score: submissionScore || 0,
    percentage: formatPercentage(submissionScore / evaluationForm.totalPoints * 100)
  }
}
export const isQuestionCorrect = (question: EvaluationFormQuestion, submission: EvaluationFormSubmission) => {
  return submission.answers.some(answer => answer.questionId === question.id && question.options.some(option => option.text === answer.text && option.isCorrect))
}

export const getEvalutaionStatus = (formDueDate: Date, submitted: boolean = false) => {
  const now = new Date()
  let value = submitted ? "Submitted" : (formDueDate.getTime() - now.getTime()) > 0 ? "Due now" : "Upcoming"

  console.log(value);
  return value
}
