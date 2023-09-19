import { create } from "zustand";

interface ExportTriggerState {
    triggered: boolean
    exportTrigger: () => void;
}

export const useExport = create<ExportTriggerState>()((set) => ({
    triggered: false,
    exportTrigger: () => set((state) => {
        return { triggered: !state.triggered }
    }),
}));