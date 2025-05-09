import { ItemQuestionType, ItemType, QuestionChoiceType, SystemFormTypes } from "@prisma/client";

export const systemFormData = {
    placementTest: {
        title: "Travel Essentials Placement Test",
        description: "Assess your understanding of basic travel-related English vocabulary and phrases.",
        type: SystemFormTypes.PlacementTest,
        items: [
            {
                type: ItemType.QuestionItem,
                title: "Common Travel Phrases",
                imageUrl: "/travel_phrases.jpg",
                questions: [
                    {
                        questionText: "What should you say if you want to ask for directions?",
                        required: true,
                        shuffle: true,
                        points: 5,
                        type: ItemQuestionType.Choice,
                        choiceType: QuestionChoiceType.Radio,
                        options: [
                            { value: "Where is the nearest station?", isCorrect: true },
                            { value: "Can I have the menu, please?", isCorrect: false },
                            { value: "What time is it?", isCorrect: false },
                        ],
                    },
                    {
                        questionText: "How do you say 'thank you' in English?",
                        required: true,
                        shuffle: false,
                        points: 5,
                        type: ItemQuestionType.Choice,
                        choiceType: QuestionChoiceType.Radio,
                        options: [
                            { value: "Goodbye", isCorrect: false },
                            { value: "Thank you", isCorrect: true },
                            { value: "Hello", isCorrect: false },
                        ],
                    },
                ],
            },
        ],
    },
    finalTest: {
        title: "Advanced Travel English Final Test",
        description: "Evaluate your mastery of advanced travel English skills.",
        type: SystemFormTypes.FinalTest,
        items: [
            {
                type: ItemType.QuestionItem,
                title: "Complex Situations at the Airport",
                imageUrl: "/airport_complex.jpg",
                questions: [
                    {
                        questionText: "What would you say if your luggage is lost?",
                        required: true,
                        shuffle: true,
                        points: 10,
                        type: ItemQuestionType.Choice,
                        choiceType: QuestionChoiceType.Radio,
                        options: [
                            { value: "I want a ticket, please.", isCorrect: false },
                            { value: "My luggage is missing. Can you help me?", isCorrect: true },
                            { value: "What gate should I go to?", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                type: ItemType.TextItem,
                title: "Booking a Hotel Room",
                imageUrl: null,
                questions: [
                    {
                        questionText: "Complete the phrase: 'I'd like to ______ a room for two nights.'",
                        required: true,
                        shuffle: false,
                        points: 15,
                        type: ItemQuestionType.Text,
                        choiceType: QuestionChoiceType.Radio,
                        options: [
                            { value: "book", isCorrect: true },
                        ],
                    },
                ],
            },
        ],
    },
    quiz: {
        title: "Transportation Vocabulary Quiz",
        description: "Check your knowledge of transportation-related English terms.",
        type: SystemFormTypes.Quiz,
        items: [
            {
                type: ItemType.QuestionItem,
                title: "Understanding Directions",
                imageUrl: "/directions.jpg",
                questions: [
                    {
                        questionText: "The phrase 'turn left' means to move to your left side.",
                        required: true,
                        shuffle: false,
                        points: 5,
                        type: ItemQuestionType.Choice,
                        choiceType: QuestionChoiceType.Checkbox,
                        options: [
                            { value: "True", isCorrect: true },
                            { value: "False", isCorrect: false },
                        ],
                    },
                ],
            },
        ],
    },
    assignment: {
        title: "Email Writing Basics Assignment",
        description: "Practice writing professional emails in English.",
        type: SystemFormTypes.Assignment,
        items: [
            {
                type: ItemType.QuestionItem,
                title: "Compose a Formal Email",
                imageUrl: null,
                questions: [
                    {
                        questionText: "Write a formal email introducing yourself to a potential client.",
                        required: true,
                        shuffle: false,
                        points: 20,
                        type: ItemQuestionType.Text,
                        choiceType: QuestionChoiceType.Radio,
                        options: [],
                    },
                ],
            },
        ],
    },
};