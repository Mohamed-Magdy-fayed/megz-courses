export type GoogleFormType = {
    formRespondUrl: string;
    formId: string;
    title: string;
    questions: GoogleFormQuestionType[];
};

export type GoogleFormQuestionType = {
    questionText: string;
    questionImage: GoogleFormQuestionImageType | "no image";
    questionPoints: number;
    questionOptions: GoogleFormQuestionOptionType[];
    correctAnswers: GoogleFormCorrectAnswerType[];
};

export type GoogleFormQuestionImageType = {
    contentUri: string;
    properties: {
        alignment: string;
        width: number;
    };
};

export type GoogleFormQuestionOptionType = {
    value: string;
};

export type GoogleFormCorrectAnswerType = {
    value: string;
};