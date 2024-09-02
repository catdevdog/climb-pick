import { create } from "zustand";
// import type { PlacesSearchResultItem } from "@/types/kakao";
import type { TypePlace } from "@/types/place";

interface State {
  $place: {
    openMap: boolean;
    setOpenMap: (openMap: boolean) => void;

    searchDistance: number;
    searchDistanceMin: number;
    SearchDistanceMax: number;

    googleSearchDistance: number;

    // 현재 검색 중인 좌표 (GCP)
    currentSearchSectionCoords: { lat: number; lng: number };
    setCurrentSearchSectionCoords: (coords: {
      lat: number;
      lng: number;
    }) => void;
    currentSearchSectionDistance: number;
    setCurrentSearchSectionDistance: (distance: number) => void;

    refCoords: { lat: number; lng: number };

    coordColors: string[];
    selectedCoords: { coord: { lat: number; lng: number }; color: string }[];
    setSelectedCoords: (
      coords: { coord: { lat: number; lng: number }; color: string }[]
    ) => void;

    currentMapCenter: { lat: number; lng: number };
    setCurrentMapCenter: (center: { lat: number; lng: number }) => void;

    mostNearPlace: {
      data: TypePlace | null;
      distance: number;
    };
    setMostNearPlace: (place: TypePlace, distance: number) => void;

    sortedPlaces: {
      data: TypePlace;
      distance: number;
    }[];
    setSortedPlaces: (places: { data: TypePlace; distance: number }[]) => void;

    selectedDetailPlace: TypePlace | null;
    setSelectedDetailPlace: (place: TypePlace | null) => void;
    moveTrigger: boolean;
    setMoveTrigger: (trigger: boolean) => void;

    centerChanged: boolean;
    setcenterChanged: (centerChanged: boolean) => void;
    searchRequest: boolean;
    setSearchRequest: (searchRequest: boolean) => void;

    detailPlace: TypePlace | null;
    setDetailPlace: (place: TypePlace | null) => void;

    // 검색 결과
    searchResults: TypePlace[];
    setSearchResults: (results: TypePlace[]) => void;

    // 사용자 검색 결과
    userSearchResults: TypePlace[];
    setUserSearchResults: (results: TypePlace[]) => void;
  };
}

const useStore = create<State>((set) => ({
  $place: {
    openMap: false,
    setOpenMap: (openMap) =>
      set((state) => ({ $place: { ...state.$place, openMap: openMap } })),

    // DB검색 반경 25000(서울) / 80400(경기도)
    searchDistance: 25000,
    searchDistanceMin: 25000,
    SearchDistanceMax: 80400,

    // API 검색 반경 2000m
    googleSearchDistance: 80400,

    // 검색 기준 좌표
    // 덕수궁 광명문: 37.5653926 126.9757768 - 18km (서울)
    // 미음나루: 37.5864428 127.1702517 - 80.4km (경기도)
    refCoords: { lat: 37.5864428, lng: 127.1702517 },

    // 현재 검색 중인 좌표 (GCP)
    currentSearchSectionCoords: { lat: 0, lng: 0 },
    setCurrentSearchSectionCoords: (coords) =>
      set((state) => ({
        $place: { ...state.$place, currentSearchSectionCoords: coords },
      })),
    currentSearchSectionDistance: 0,
    setCurrentSearchSectionDistance: (distance) =>
      set((state) => ({
        $place: { ...state.$place, currentSearchSectionDistance: distance },
      })),

    // 선택된 기준 좌표 리스트
    coordColors: ["secondary", "warning", "danger"],
    selectedCoords: [],
    setSelectedCoords: (coords) =>
      set((state) => ({ $place: { ...state.$place, selectedCoords: coords } })),

    // 현재 지도 중심 좌표
    currentMapCenter: { lat: 0, lng: 0 },
    setCurrentMapCenter: (center) =>
      set((state) => ({
        $place: { ...state.$place, currentMapCenter: center },
      })),

    mostNearPlace: {
      data: null,
      distance: 0,
    },
    setMostNearPlace: (place, distance) =>
      set((state) => ({
        $place: { ...state.$place, mostNearPlace: { data: place, distance } },
      })),

    sortedPlaces: [],
    setSortedPlaces: (places) =>
      set((state) => ({ $place: { ...state.$place, sortedPlaces: places } })),

    selectedDetailPlace: null,
    setSelectedDetailPlace: (place) =>
      set((state) => ({
        $place: { ...state.$place, selectedDetailPlace: place },
      })),

    moveTrigger: false,
    setMoveTrigger: (trigger) =>
      set((state) => ({ $place: { ...state.$place, moveTrigger: trigger } })),

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

    userSearchResults: [],
    setUserSearchResults: (results) =>
      set((state) => ({
        $place: { ...state.$place, userSearchResults: results },
      })),
  },
}));

export default useStore;
