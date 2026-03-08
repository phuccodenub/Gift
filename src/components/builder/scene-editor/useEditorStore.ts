import { create } from "zustand";
import type { SceneElement } from "@/types/gift";

const MAX_HISTORY = 20;
const DRAFT_KEY_PREFIX = "giftcraft:draft:flower-tree:v1";

interface EditorState {
  elements: SceneElement[];
  selectedId: string | null;
  history: SceneElement[][];
  historyIndex: number;

  setElements: (elements: SceneElement[]) => void;
  selectElement: (id: string | null) => void;
  updateElement: (id: string, patch: Partial<SceneElement>) => void;
  updateTransform: (id: string, transform: SceneElement["transform"]) => void;
  addElement: (element: SceneElement) => void;
  removeElement: (id: string) => void;
  duplicateElement: (id: string) => void;
  moveLayer: (id: string, direction: "up" | "down") => void;
  undo: () => void;
  redo: () => void;
  loadDraft: () => void;
  saveDraft: () => void;
  clearDraft: () => void;
  resetToDefault: (defaults: SceneElement[]) => void;
}

function pushHistory(
  state: { history: SceneElement[][]; historyIndex: number },
  elements: SceneElement[],
) {
  const trimmed = state.history.slice(0, state.historyIndex + 1);
  const next = [...trimmed, elements].slice(-MAX_HISTORY);
  return { history: next, historyIndex: next.length - 1 };
}

export const useEditorStore = create<EditorState>((set, get) => ({
  elements: [],
  selectedId: null,
  history: [[]],
  historyIndex: 0,

  setElements: (elements) =>
    set((s) => ({
      elements,
      ...pushHistory(s, elements),
    })),

  selectElement: (id) => set({ selectedId: id }),

  updateElement: (id, patch) =>
    set((s) => {
      const elements = s.elements.map((el) =>
        el.id === id ? { ...el, ...patch } : el,
      );
      return { elements, ...pushHistory(s, elements) };
    }),

  updateTransform: (id, transform) =>
    set((s) => {
      const elements = s.elements.map((el) =>
        el.id === id ? { ...el, transform } : el,
      );
      return { elements, ...pushHistory(s, elements) };
    }),

  addElement: (element) =>
    set((s) => {
      const elements = [...s.elements, element];
      return { elements, ...pushHistory(s, elements) };
    }),

  removeElement: (id) =>
    set((s) => {
      const elements = s.elements.filter((el) => el.id !== id);
      const selectedId = s.selectedId === id ? null : s.selectedId;
      return { elements, selectedId, ...pushHistory(s, elements) };
    }),

  duplicateElement: (id) =>
    set((s) => {
      const source = s.elements.find((el) => el.id === id);
      if (!source) return s;
      const copy: SceneElement = {
        ...source,
        id: `${source.id}-copy-${Date.now()}`,
        transform: {
          ...source.transform,
          x: source.transform.x + 20,
          y: source.transform.y + 20,
        },
      };
      const elements = [...s.elements, copy];
      return { elements, selectedId: copy.id, ...pushHistory(s, elements) };
    }),

  moveLayer: (id, direction) =>
    set((s) => {
      const idx = s.elements.findIndex((el) => el.id === id);
      if (idx < 0) return s;
      const swapIdx = direction === "up" ? idx + 1 : idx - 1;
      if (swapIdx < 0 || swapIdx >= s.elements.length) return s;
      const elements = [...s.elements];
      [elements[idx], elements[swapIdx]] = [elements[swapIdx], elements[idx]];
      const reindexed = elements.map((el, i) => ({ ...el, zIndex: i + 1 }));
      return { elements: reindexed, ...pushHistory(s, reindexed) };
    }),

  undo: () =>
    set((s) => {
      if (s.historyIndex <= 0) return s;
      const newIndex = s.historyIndex - 1;
      return { elements: s.history[newIndex], historyIndex: newIndex };
    }),

  redo: () =>
    set((s) => {
      if (s.historyIndex >= s.history.length - 1) return s;
      const newIndex = s.historyIndex + 1;
      return { elements: s.history[newIndex], historyIndex: newIndex };
    }),

  loadDraft: () => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY_PREFIX);
      if (!raw) return;
      const parsed = JSON.parse(raw) as SceneElement[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        set((s) => ({ elements: parsed, ...pushHistory(s, parsed) }));
      }
    } catch {
      // ignore corrupt drafts
    }
  },

  saveDraft: () => {
    try {
      const { elements } = get();
      localStorage.setItem(DRAFT_KEY_PREFIX, JSON.stringify(elements));
    } catch {
      // ignore storage errors
    }
  },

  clearDraft: () => {
    try {
      localStorage.removeItem(DRAFT_KEY_PREFIX);
    } catch {
      // ignore
    }
  },

  resetToDefault: (defaults) =>
    set((s) => ({
      elements: defaults,
      selectedId: null,
      ...pushHistory(s, defaults),
    })),
}));
