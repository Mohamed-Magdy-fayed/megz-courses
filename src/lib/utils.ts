import { Address, Course, CourseLevel, CourseStatus, ItemQuestion, ItemQuestionOption, Order, SystemForm, SystemFormItem, SystemFormSubmission, SystemFormSubmissionAnswer, User, UserRoles, ZoomGroup, ZoomSession } from "@prisma/client";
import { type ClassValue, clsx } from "clsx";
import { format } from "date-fns";
import { twMerge } from "tailwind-merge";
import { getInitials } from "./getInitials";
import { env } from "@/env.mjs";
import { Row } from "@tanstack/react-table";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getAddress = (address: Address) => `${address?.city || "no city"} - ${address?.state || "no state"} - ${address?.country || "no country"}`;

export const leadsCodeGenerator = () => `Lead-${Date.now()}`

export const orderCodeGenerator = () => `CO-${Date.now()}`

export const hasAccess = (currentUserRole: UserRoles, userRoles: UserRoles[]) => {
  return userRoles.some(t => t === currentUserRole)
}

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

export const formatSizeInGB = (size: number): string => {
  if (size < 1024) {
    return `${size} B`;
  } else if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(2)} KB`;
  } else if (size < 1024 * 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  } else {
    return `${(size / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  }
};

export const formatNumbers = (value: number) => new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(value)
export const formatNumber2Digits = (value: number) => new Intl.NumberFormat("en-US", { minimumIntegerDigits: 2 }).format(value)

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

export type CourseType = Course & {
  levels: CourseLevel[];
  orders: (Order & {
    user: User & {
      courseStatus: CourseStatus[];
      orders: Order[];
    };
  })[];
  courseStatus: CourseStatus[];
}
export const getWaitingList = (course: CourseType): number => {
  return course.courseStatus
    .filter(stat => stat.status === "Waiting" && stat.courseId === course.id)
    .filter((stat, i, self) => i === self.findIndex(({ userId }) => stat.userId === userId))
    .length;
}

export const getLevelWaitingList = (course: CourseType, levelId: string): number => {
  return course.courseStatus
    .filter(stat => stat.status === "Waiting" && stat.courseLevelId === levelId)
    .filter((stat, i, self) => i === self.findIndex(({ userId }) => stat.userId === userId))
    .length
}

export const generateGroupNumnber = (startDate: Date, trainerUserName: string, courseName: string): string => {
  return `${format(startDate, "E_do_MMM_hh:mm_aaa")}_${getInitials(trainerUserName)}_${courseName.replaceAll(" ", "_")}`
}

export const calculateAttendancePercentages = (group: ZoomGroup & { zoomSessions: ZoomSession[] }) => {
  const totalStudents = group.studentIds.length;

  const sessionAttendance = group.zoomSessions.filter(session => session.sessionStatus === "Completed").map(session => {
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

export const getEvalutaionFormFullMark = (questions: ItemQuestion[]) => questions.map(question => question.points).reduce((a, b) => a + b, 0)
export const getSubmissionScoreAndPercentage = (systemForm: SystemForm, submissions: SystemFormSubmission[]) => {
  const submissionScore = submissions.find(submission => submission.systemFormId === systemForm.id)?.totalScore || 0
  return {
    score: submissionScore || 0,
    percentage: formatPercentage(submissionScore / systemForm.totalScore * 100)
  }
}

export const getSubmissionScore = (questions: (ItemQuestion & { options: ItemQuestionOption[] })[], answers: SystemFormSubmission["answers"]) => {
  return questions.map(question => answers.some(answer => answer.questionId === question.id && answer.isCorrect) ? question.points : 0).reduce((a, b) => a + b, 0)
}

export const isQuestionCorrect = (question: ItemQuestion & { options: ItemQuestionOption[] }, submission: SystemFormSubmission) => {
  return submission.answers.some(ans => ans.questionId === question.id && ans.isCorrect)
}

export const getEvalutaionStatus = (formDueDate: Date, submitted: boolean = false) => {
  const now = new Date()
  let value = submitted ? "Submitted" : (formDueDate.getTime() - now.getTime()) < 0 ? "Due now" : "Upcoming"
  return value
}

export const getZoomSessionDays = (startDay: number) => {
  switch (startDay) {
    case 0:
      return [1, 4] as const;
    case 1:
      return [2, 5] as const;
    case 2:
      return [3, 7] as const;
    case 3:
      return [4, 1] as const;
    case 4:
      return [5, 2] as const;
    case 6:
      return [7, 3] as const;
    default:
      return [7, 3] as const;
  }
}

export const getGroupSessionDays = (startDay: number) => {
  switch (startDay) {
    case 0:
      return [0, 3] as const;
    case 1:
      return [1, 4] as const;
    case 2:
      return [2, 6] as const;
    case 3:
      return [3, 0] as const;
    case 4:
      return [4, 1] as const;
    case 6:
      return [6, 2] as const;
    default:
      return [6, 2] as const;
  }
}

export const isTimePassed = (testTime: number) => {
  const currentTime = new Date().getTime();
  // Calculate the time difference in milliseconds
  const timeDifference = currentTime - testTime;

  // Convert minutes to milliseconds (minutes * 60 seconds * 1000 milliseconds)
  const thirtyMinutesInMilliseconds = parseInt(env.NEXT_PUBLIC_PLACEMENT_TEST_TIME) * 60 * 1000;

  // Check if the time difference is greater than minutes
  return timeDifference > thirtyMinutesInMilliseconds;
}
export const isTimeNow = (testTime: number) => {
  const currentTime = new Date().getTime();
  // Calculate the time difference in milliseconds
  const timeDifference = testTime - currentTime;

  // Convert minutes to milliseconds (minutes * 60 seconds * 1000 milliseconds)
  const thirtyMinutesInMilliseconds = parseInt(env.NEXT_PUBLIC_PLACEMENT_TEST_TIME) * 60 * 1000;

  // Check if the time difference is less than 30 minutes
  return timeDifference < thirtyMinutesInMilliseconds;
}

export const getRating = (questions: (ItemQuestion & { options: ItemQuestionOption[] })[], answers: SystemFormSubmissionAnswer[]): number => {
  let points = 0

  for (let i = 0; i < answers.length; i++) {
    const answer = answers[i];
    const question = questions.find(question => question.id === answer?.questionId)

    if (question) {
      if (answer?.isCorrect) points += question.points
    }
  }
  return points
}

export function filterFn<T>(row: Row<T & { createdAt: Date }>, columnId: string, filterValue: any) {
  const val = row.original.createdAt
  const startDate = new Date(filterValue.split("|")[0])
  const endDate = new Date(filterValue.split("|")[1])
  return val.getTime() >= startDate.getTime() && val.getTime() <= endDate.getTime()
}
