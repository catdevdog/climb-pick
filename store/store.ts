// store.ts
import { create } from 'zustand';
import type { PlacesSearchResultItem } from '@/types/kakao';

interface State {
    $place: {
        searchResults: PlacesSearchResultItem[],
        setSearchResults: (results: PlacesSearchResultItem[]) => void;
    }
}

const useStore = create<State>((set) => ({
    $place: {
        searchResults: [],
        setSearchResults: (results) => set((state) => ({
            $place: { ...state.$place, searchResults: results },
        })),
    },
}));

export default useStore;
