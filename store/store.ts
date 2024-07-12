import { create } from "zustand";
import type { PlacesSearchResultItem } from "@/types/kakao";
import type { TypePlace } from "@/types/place";

interface State {
  $place: {
    searchDistance: number;
    refCoords: { lat: number; lng: number };

    centerChanged: boolean;
    setcenterChanged: (centerChanged: boolean) => void;
    searchRequest: boolean;
    setSearchRequest: (searchRequest: boolean) => void;

    searchResults: TypePlace[];
    setSearchResults: (results: TypePlace[]) => void;
  };
}

const useStore = create<State>((set) => ({
  $place: {
    searchDistance: 18000,
    // 덕수궁 광명문: 37.5653926 126.9757768
    refCoords: { lat: 37.5653926, lng: 126.9757768 },

    centerChanged: false,
    setcenterChanged: (centerChanged) =>
      set((state) => ({ $place: { ...state.$place, centerChanged } })),
    searchRequest: false,
    setSearchRequest: (searchRequest) =>
      set((state) => ({ $place: { ...state.$place, searchRequest } })),

    searchResults: [],
    setSearchResults: (results) =>
      set((state) => ({
        $place: { ...state.$place, searchResults: results },
      })),
  },
}));

export default useStore;
