import { create } from "zustand";
// import type { PlacesSearchResultItem } from "@/types/kakao";
import type { TypePlace } from "@/types/place";

interface State {
  $place: {
    searchDistance: number;
    searchDistanceMin: number;
    SearchDistanceMax: number;

    googleSearchDistance: number;
    refCoords: { lat: number; lng: number };

    centerChanged: boolean;
    setcenterChanged: (centerChanged: boolean) => void;
    searchRequest: boolean;
    setSearchRequest: (searchRequest: boolean) => void;

    detailPlace: TypePlace | null;
    setDetailPlace: (place: TypePlace) => void;

    searchResults: TypePlace[];
    setSearchResults: (results: TypePlace[]) => void;
  };
}

const useStore = create<State>((set) => ({
  $place: {
    // 25000(서울) / 80400(경기도)
    searchDistance: 25000,
    searchDistanceMin: 25000,
    SearchDistanceMax: 80400,

    googleSearchDistance: 2000,
    // 덕수궁 광명문: 37.5653926 126.9757768 - 18km (서울)
    // 미음나루: 37.5864428 127.1702517 - 80.4km (경기도)
    refCoords: { lat: 37.5864428, lng: 127.1702517 },

    centerChanged: false,
    setcenterChanged: (centerChanged) =>
      set((state) => ({ $place: { ...state.$place, centerChanged } })),
    searchRequest: false,
    setSearchRequest: (searchRequest) =>
      set((state) => ({ $place: { ...state.$place, searchRequest } })),

    detailPlace: null,
    setDetailPlace: (place) =>
      set((state) => ({ $place: { ...state.$place, detailPlace: place } })),

    searchResults: [],
    setSearchResults: (results) =>
      set((state) => ({
        $place: { ...state.$place, searchResults: results },
      })),
  },
}));

export default useStore;
