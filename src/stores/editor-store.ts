import { create } from "zustand";

interface EditorState {
  isSaving: boolean;
  lastSavedAt: Date | null;
  setIsSaving: (isSaving: boolean) => void;
  setLastSavedAt: (date: Date | null) => void;
}

export const useEditorStore = create<EditorState>()((set) => ({
  isSaving: false,
  lastSavedAt: null,
  setIsSaving: (isSaving) => set({ isSaving }),
  setLastSavedAt: (lastSavedAt) => set({ lastSavedAt }),
}));
