// store.ts
import { create } from 'zustand';
import type {
    PlacesSearchResultItem,
} from "@/types/kakao";

interface State {
    count: number;
    increase: () => void;
    decrease: () => void;

    searchResults: PlacesSearchResultItem[];
}

const useStore = create<State>((set) => ({
    count: 0,
    increase: () => set((state) => ({ count: state.count + 1 })),
    decrease: () => set((state) => ({ count: state.count - 1 })),

    searchResults: [],
}));

export default useStore;
