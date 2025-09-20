import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AppState, CSVRow, ColumnMapping, ReviewAction } from "./types";

interface CSVStore extends AppState {
  // Actions
  setCSVData: (data: CSVRow[]) => void;
  setColumnMapping: (mapping: ColumnMapping) => void;
  setCurrentIndex: (index: number) => void;
  reviewItem: (action: ReviewAction, item?: CSVRow) => void;
  moveItemBetweenLists: (
    item: CSVRow,
    from: ReviewAction,
    to: ReviewAction
  ) => void;
  reorderList: (
    listType: ReviewAction,
    startIndex: number,
    endIndex: number
  ) => void;
  resetApp: () => void;
}

const initialState: AppState = {
  csvData: [],
  columnMapping: {
    psNumber: "",
    title: "",
    description: "",
    organisation: "",
    theme: "",
  },
  currentIndex: 0,
  acceptedItems: [],
  doableItems: [],
  rejectedItems: [],
};

export const useCSVStore = create<CSVStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setCSVData: (data) => set({ csvData: data }),

      setColumnMapping: (mapping) => set({ columnMapping: mapping }),

      setCurrentIndex: (index) => set({ currentIndex: index }),

      reviewItem: (action, item) => {
        const state = get();
        const currentItem = item || state.csvData[state.currentIndex];
        if (!currentItem) return;

        const updates: Partial<AppState> = {};

        // Check if item already exists in any list and remove it first
        const existingInAccepted = state.acceptedItems.find(
          (i) => i.id === currentItem.id
        );
        const existingInDoable = state.doableItems.find(
          (i) => i.id === currentItem.id
        );
        const existingInRejected = state.rejectedItems.find(
          (i) => i.id === currentItem.id
        );

        // Remove from all lists first to prevent duplicates
        updates.acceptedItems = state.acceptedItems.filter(
          (i) => i.id !== currentItem.id
        );
        updates.doableItems = state.doableItems.filter(
          (i) => i.id !== currentItem.id
        );
        updates.rejectedItems = state.rejectedItems.filter(
          (i) => i.id !== currentItem.id
        );

        // Add to appropriate list
        switch (action) {
          case "accept":
            updates.acceptedItems = [...updates.acceptedItems, currentItem];
            break;
          case "doable":
            updates.doableItems = [...updates.doableItems, currentItem];
            break;
          case "reject":
            updates.rejectedItems = [...updates.rejectedItems, currentItem];
            break;
        }

        // Move to next item if reviewing current item
        if (!item && state.currentIndex < state.csvData.length - 1) {
          updates.currentIndex = state.currentIndex + 1;
        }

        set(updates);
      },

      moveItemBetweenLists: (item, from, to) => {
        const state = get();
        const updates: Partial<AppState> = {};

        // Remove from ALL lists first to prevent duplicates
        updates.acceptedItems = state.acceptedItems.filter(
          (i) => i.id !== item.id
        );
        updates.doableItems = state.doableItems.filter((i) => i.id !== item.id);
        updates.rejectedItems = state.rejectedItems.filter(
          (i) => i.id !== item.id
        );

        // Add to target list
        switch (to) {
          case "accept":
            updates.acceptedItems = [...updates.acceptedItems, item];
            break;
          case "doable":
            updates.doableItems = [...updates.doableItems, item];
            break;
          case "reject":
            updates.rejectedItems = [...updates.rejectedItems, item];
            break;
        }

        set(updates);
      },

      reorderList: (listType, startIndex, endIndex) => {
        const state = get();
        let list: CSVRow[];

        switch (listType) {
          case "accept":
            list = [...state.acceptedItems];
            break;
          case "doable":
            list = [...state.doableItems];
            break;
          case "reject":
            list = [...state.rejectedItems];
            break;
        }

        const [removed] = list.splice(startIndex, 1);
        list.splice(endIndex, 0, removed);

        const updates: Partial<AppState> = {};
        switch (listType) {
          case "accept":
            updates.acceptedItems = list;
            break;
          case "doable":
            updates.doableItems = list;
            break;
          case "reject":
            updates.rejectedItems = list;
            break;
        }

        set(updates);
      },

      resetApp: () => set(initialState),
    }),
    {
      name: "csv-review-storage",
      partialize: (state) => ({
        csvData: state.csvData,
        columnMapping: state.columnMapping,
        currentIndex: state.currentIndex,
        acceptedItems: state.acceptedItems,
        doableItems: state.doableItems,
        rejectedItems: state.rejectedItems,
      }),
    }
  )
);
