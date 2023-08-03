import type { AlertColor } from "@mui/material";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface ToastState {
  open: boolean;
  msg: string;
  type: AlertColor;
  success: (msg: string) => void;
  error: (msg: string) => void;
  info: (msg: string) => void;
  close: () => void;
}

export const useToastStore = create<ToastState>()((set) => ({
  open: false,
  msg: "",
  type: "info",
  success: (msg) => set((state) => ({ open: true, msg, type: "success" })),
  error: (msg) => set((state) => ({ open: true, msg, type: "error" })),
  info: (msg) => set((state) => ({ open: true, msg, type: "info" })),
  close: () => set(() => ({ open: false })),
}));

export type ActiveLinkType =
  | ""
  | "students"
  | "staff"
  | "content"
  | "account"
  | "settings"
  | "login"
  | "register"
  | "404"
  | null;

interface SideNavState {
  opened: boolean;
  activeLink: ActiveLinkType;
  setActiveLink: (link: ActiveLinkType) => void;
  openNav: () => void;
  closeNav: () => void;
}

export const useNavStore = create<SideNavState>()((set) => ({
  opened: false,
  activeLink: null,
  setActiveLink: (link) =>
    set((state) => ({ opened: false, activeLink: link })),
  openNav: () => set((state) => ({ opened: true })),
  closeNav: () => set((state) => ({ opened: false })),
}));

export interface Card {
  id: string;
  name: string;
}

export interface Area {
  id: string;
  img: string;
  card: Card | null;
  correctAnswer: string;
}

export interface DraggingState {
  selectedCard: Card | null;
  usedCards: Card[];
  cards: Card[];
  areas: Area[];
  submission: {
    completed: boolean;
    correctAreas: Area[];
    attempts: number;
    highestScore: number;
  };
  addSelection: (card: Card, areaId: string) => void;
  removeSelection: (areaId: string) => void;
  addUsedCard: (card: Card) => void;
  clearAnswers: () => void;
  setSelectedCard: (card: Card | null) => void;
  submit: () => void;
}

export const useDraggingStore = create<DraggingState>()(
  persist(
    (set) => ({
      selectedCard: null,
      usedCards: [],
      cards: [
        {
          id: "Shoeshine service",
          name: "Shoeshine service",
        },
        {
          id: "Airport shuttle",
          name: "Airport shuttle",
        },
        {
          id: "Bell service",
          name: "Bell service",
        },
        {
          id: "Laundry service",
          name: "Laundry service",
        },
        {
          id: "Room service",
          name: "Room service",
        },
        {
          id: "Wake-up service",
          name: "Wake-up service",
        },
      ],
      areas: [
        {
          id: "area1",
          img: "/sessionImages/Picture2.jpg",
          card: null,
          correctAnswer: "Laundry service",
        },
        {
          id: "area2",
          img: "/sessionImages/Picture3.jpg",
          card: null,
          correctAnswer: "Room service",
        },
        {
          id: "area3",
          img: "/sessionImages/Picture4.jpg",
          card: null,
          correctAnswer: "Shoeshine service",
        },
        {
          id: "area5",
          img: "/sessionImages/Picture6.jpg",
          card: null,
          correctAnswer: "Bell service",
        },
        {
          id: "area6",
          img: "/sessionImages/Picture7.jpg",
          card: null,
          correctAnswer: "Wake-up service",
        },
        {
          id: "area7",
          img: "/sessionImages/Picture8.jpg",
          card: null,
          correctAnswer: "Airport shuttle",
        },
      ],
      submission: {
        attempts: 0,
        completed: false,
        correctAreas: [],
        highestScore: 0,
      },
      addSelection: (card, areaId) =>
        set((state) => {
          const area = state.areas.filter((area) => area.id === areaId)[0];
          const cardInArea = area?.card;
          const newAreas = state.areas.map((area) =>
            area.id === areaId ? { ...area, card } : { ...area }
          );
          const remainingCards = cardInArea
            ? state.usedCards.filter((card) => card.id !== cardInArea?.id)
            : state.usedCards;
          return { areas: newAreas, usedCards: [...remainingCards, card] };
        }),
      removeSelection: (areaId) =>
        set((state) => {
          const newAreas = state.areas.map((area) =>
            area.id === areaId ? { ...area, card: null } : { ...area }
          );
          const usedCardId = state.areas.filter((area) => area.id === areaId)[0]
            ?.card?.id;

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
      setSelectedCard: (card) => set((state) => ({ selectedCard: card })),
      submit: () =>
        set((state) => {
          const correctAreas = state.areas.filter(
            (area) => area.card?.id === area.correctAnswer
          );

          return {
            submission: {
              attempts: state.submission.attempts + 1,
              completed: true,
              correctAreas: correctAreas,
              highestScore: (correctAreas.length / state.areas.length) * 100,
            },
          };
        }),
    }),
    { name: "name", storage: createJSONStorage(() => sessionStorage) }
  )
);
