import { create } from "zustand";

interface ToastState {
  message?: string;
  show: (message: string) => void;
  clear: () => void;
}

export const useToast = create<ToastState>((set) => ({
  show: (message) => {
    set({ message });
    window.setTimeout(() => set({ message: undefined }), 4000);
  },
  clear: () => set({ message: undefined }),
}));
