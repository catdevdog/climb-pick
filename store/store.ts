import { create } from 'zustand';
import type { PlacesSearchResultItem } from '@/types/kakao';

interface State {
    $place: {
        searchDistance: number;

        centerChanged: boolean;
        setcenterChanged: (centerChanged: boolean) => void;
        searchRequest: boolean;
        setSearchRequest: (searchRequest: boolean) => void;

        searchResults: PlacesSearchResultItem[],
        setSearchResults: (results: PlacesSearchResultItem[]) => void;
    }
}

const useStore = create<State>((set) => ({
    $place: {
        searchDistance: 1500,

        centerChanged: false,
        setcenterChanged: (centerChanged) => set((state) => ({ $place: { ...state.$place, centerChanged } })),
        searchRequest: false,
        setSearchRequest: (searchRequest) => set((state) => ({ $place: { ...state.$place, searchRequest } })),

        searchResults: [],
        setSearchResults: (results) => set((state) => ({
            $place: { ...state.$place, searchResults: results },
        })),
    },
}));

export default useStore;
