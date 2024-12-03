import type { Question } from "@prisma/client";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type ActiveLinkType =
  | ""
  | "dashboard"
  | "retintions"
  | "notes"
  | "groups"
  | "orders"
  | "students"
  | "edu_team"
  | "ops_team"
  | "leads"
  | "chat_agents"
  | "content"
  | "leads"
  | "config"
  | "account"
  | "privacy"
  | "terms"
  | "documentation"
  | "support"
  | "404"
  | null;

interface SideNavState {
  Opened: boolean;
  activeLink: ActiveLinkType;
  setActiveLink: (link: ActiveLinkType) => void;
  openNav: () => void;
  closeNav: () => void;
}

export const useNavStore = create<SideNavState>()((set) => ({
  Opened: false,
  activeLink: null,
  setActiveLink: (link) =>
    set(() => ({ Opened: false, activeLink: link })),
  openNav: () => set(() => ({ Opened: true })),
  closeNav: () => set(() => ({ Opened: false })),
}));

export interface AnswerCard {
  id: string;
  text: string;
}

export interface AnswerArea {
  img: string;
  card: AnswerCard | null;
  correctAnswer: string;
}

export interface DraggingState {
  selectedCard: AnswerCard | null;
  usedCards: AnswerCard[];
  cards: AnswerCard[];
  areas: AnswerArea[];
  submission: {
    Completed: boolean;
    correctAreas: AnswerArea[];
    attempts: number;
    highestScore: number;
  };
  addSelection: (card: AnswerCard, areaId: string) => void;
  removeSelection: (areaId: string) => void;
  addUsedCard: (card: AnswerCard) => void;
  clearAnswers: () => void;
  setSelectedCard: (card: AnswerCard | null) => void;
  submit: () => void;
  setCards: (cards: AnswerCard[]) => void;
  setAreas: (areas: AnswerArea[]) => void;
}

export const useDraggingStore = create<DraggingState>()(
  persist(
    (set) => {
      return {
        selectedCard: null,
        usedCards: [],
        cards: [],
        areas: [],
        submission: {
          attempts: 0,
          Completed: false,
          correctAreas: [],
          highestScore: 0,
        },
        addSelection: (card, areaImage) =>
          set((state) => {
            const area = state.areas.filter(
              (area) => area.img === areaImage
            )[0];
            const cardInArea = area?.card;
            const newAreas = state.areas.map((area) =>
              area.img === areaImage ? { ...area, card } : { ...area }
            );
            const remainingCards = cardInArea
              ? state.usedCards.filter((card) => card.id !== cardInArea?.id)
              : state.usedCards;
            return { areas: newAreas, usedCards: [...remainingCards, card] };
          }),
        removeSelection: (areaImage) =>
          set((state) => {
            const newAreas = state.areas.map((area) =>
              area.img === areaImage ? { ...area, card: null } : { ...area }
            );
            const usedCardId = state.areas.filter(
              (area) => area.img === areaImage
            )[0]?.card?.id;

            return {
              areas: newAreas,
              usedCards: [
                ...state.usedCards.filter((card) => card.id !== usedCardId),
              ],
            };
          }),
        addUsedCard: (card) => {
          set((state) => {
            if (state.usedCards.includes(card)) {
              return { usedCards: [...state.usedCards] };
            } else {
              return { usedCards: [...state.usedCards, card] };
            }
          });
        },
        clearAnswers: () => {
          set((state) => ({
            usedCards: [],
            areas: state.areas.map((area) => ({ ...area, card: null })),
          }));
        },
        setSelectedCard: (card) => set(() => ({ selectedCard: card })),
        setCards: (cards) => set(() => ({ cards })),
        setAreas: (areas) => set(() => ({ areas })),
        submit: () =>
          set((state) => {
            const correctAreas = state.areas.filter(
              (area) => area.card?.text === area.correctAnswer
            );

            return {
              submission: {
                attempts: state.submission.attempts + 1,
                Completed: true,
                correctAreas: correctAreas,
                highestScore: (correctAreas.length / state.areas.length) * 100,
              },
            };
          }),
      };
    },
    { name: "name", storage: createJSONStorage(() => sessionStorage) }
  )
);

export interface ControlledPracticeMultichoiceQuestion {
  id: string;
  type: "ControlledPracticeMultichoiceQuestion";
  question: string;
  choices: string[];
  correctAnswer: string;
  studentAnswer: string;
}

export interface ControlledPracticeFillTheGapQuestion {
  id: string;
  type: "ControlledPracticeFillTheGapQuestion";
  question: string;
  correctAnswer: string;
  studentAnswer: string;
}

export interface ControlledPracticeQuestion {
  id: string;
  type: "ControlledPracticeQuestion";
  question: string;
  studentAnswer: string;
}

export interface ControlledPracticeMultichoiceState {
  questions: Question[];
  submission: {
    Completed: boolean;
    correctAnswers: Question[];
    attempts: number;
    highestScore: number;
  };
  setAnswer: (question: Question, answer: string) => void;
  removeAnswer: (question: Question) => void;
  clearAnswers: () => void;
  submit: () => void;
  setQuestions: (questions: Question[]) => void;
}

export const useControlledPracticeMultichoiceStore =
  create<ControlledPracticeMultichoiceState>()(
    persist(
      (set) => {
        return {
          questions: [],
          submission: {
            Completed: false,
            correctAnswers: [],
            attempts: 0,
            highestScore: 0,
          },
          setAnswer: (question, answer) => {
            set((state) => {
              return {
                questions: state.questions.map((q) =>
                  q.id === question.id ? { ...q, studentAnswer: answer } : q
                ),
              };
            });
          },
          removeAnswer: (question) => {
            set((state) => {
              return {
                questions: state.questions.map((q) =>
                  q.id === question.id ? { ...q, studentAnswer: "" } : q
                ),
              };
            });
          },
          clearAnswers: () =>
            set((state) => ({
              questions: state.questions.map((q) => ({
                ...q,
                studentAnswer: "",
              })),
            })),
          submit: () =>
            set((state) => {
              const correctAnswers = state.questions.filter(
                (q) => q.studentAnswer === q.correctAnswer
              );

              console.log({
                submission: {
                  Completed: true,
                  attempts: state.submission.attempts + 1,
                  correctAnswers: correctAnswers,
                  highestScore:
                    (correctAnswers.length / state.questions.length) * 100,
                },
              });

              return {
                submission: {
                  Completed: true,
                  attempts: state.submission.attempts + 1,
                  correctAnswers: correctAnswers,
                  highestScore:
                    (correctAnswers.length / state.questions.length) * 100,
                },
              };
            }),
          setQuestions: (questions) => {
            set(() => ({ questions }));
          },
        };
      },
      {
        name: "ControlledPractice",
        storage: createJSONStorage(() => sessionStorage),
      }
    )
  );

export interface TutorialSteps {
  openMenu: boolean;
  clickContent: boolean;
  createCourse: boolean;
  confirmCreateCourse: boolean;
  manageCourse: boolean;
  createLevel: boolean;
  confirmCreateLevel: boolean;
  manageLevel: boolean;
  createLesson: boolean;
  confirmCreateLesson: boolean;
  manageLesson: boolean;
  createMaterial: boolean;
  confirmCreateMaterial: boolean;
  manageMaterial: boolean;
}

export interface TutorialState {
  skipTutorial: boolean;
  setSkipTutorial: (value: boolean) => void;
  steps: TutorialSteps;
  setStep: (value: boolean, step: string) => void;
}

export const useTutorialStore = create<TutorialState>()(
  persist(
    (set) => {
      return {
        skipTutorial: false,
        steps: {
          openMenu: false,
          clickContent: false,
          createCourse: false,
          confirmCreateCourse: false,
          manageCourse: false,
          createLevel: false,
          confirmCreateLevel: false,
          manageLevel: false,
          createLesson: false,
          confirmCreateLesson: false,
          manageLesson: false,
          createMaterial: false,
          confirmCreateMaterial: false,
          manageMaterial: false,
        },
        setSkipTutorial: (value) => set(() => ({ skipTutorial: value })),
        setStep: (value, step) =>
          set((state) => ({
            steps: {
              ...state.steps,
              [step]: value,
            },
          })),
      };
    },
    {
      name: "TutorialStatus",
      storage: createJSONStorage(() => sessionStorage),
      skipHydration: true,
    }
  )
);
