import type { AlertColor } from "@mui/material";
import { create } from "zustand";

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
