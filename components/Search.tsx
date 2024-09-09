import React, { use, useEffect } from "react";
import { useState } from "react";
import useStore from "@/store/store";
import Button from "@/components/Button";
import { sortPlacesByDistance, calculateDistance } from "@/utils";
import { TypePlace } from "@/types/place";

export default function Search() {
  const { $place } = useStore();

  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [isOpened, setIsOpened] = useState<boolean>(false);
  const [searchResult, setSearchResult] = useState<
    { data: TypePlace; distance: number }[]
  >([]);

  // 검색어 변경 시
  useEffect(() => {
    if (searchKeyword.length > 0) {
      const searchResult = $place.searchResults.filter(
        (place) =>
          place.name.includes(searchKeyword) ||
          place.address.includes(searchKeyword)
      );
      const sortedPlaces = sortPlacesByDistance(
        searchResult,
        $place.selectedCoords[0].coord
      );

      const sortedWithDistance = sortedPlaces.map((place) => {
        const distance = calculateDistance(
          $place.selectedCoords[0].coord.lat,
          $place.selectedCoords[0].coord.lng,
          place.location.lat,
          place.location.lng
        );
        return { data: place, distance };
      });

      setSearchResult(sortedWithDistance);
    }
  }, [searchKeyword]);

  useEffect(() => {
    setIsOpened(searchResult.length > 0 && searchKeyword.length > 0);
  }, [searchKeyword, searchResult]);

  // 가까운 장소 리스트 렌더링 함수
  const renderNearPlaceList = () => {
    return (
      searchResult &&
      searchKeyword && (
        <>
          <div
            className={`bg-white shadow-lg rounded-md overflow-y-auto max-h-80 ${
              isOpened ? "rounded-tl-none rounded-tr-none" : ""
            }`}
          >
            {searchResult.map((place, idx) => (
              <div
                className="flex justify-between items-start border-b border-gray-200 m-3 pb-2 cursor-pointer"
                key={`${place.data.name}_${idx}`}
                onClick={() => {
                  $place.setSelectedDetailPlace(place.data);
                  $place.setDetailPlace(place.data);
                  $place.setMoveTrigger(true);
                }}
              >
                <div className="flex items-center flex-wrap">
                  <span className="text-sm font-bold mr-2">{idx + 1}. </span>
                  <span className="text-sm">{place.data.name}</span>
                  <span className="text-xs text-gray-500 mx-2">
                    {place.distance.toFixed(2)}km
                  </span>
                  <span className="text-xs text-gray-500">
                    {place.data.address}
                  </span>
                </div>
              </div>
            ))}
          </div>
          {isOpened && renderListToggleButton()}
        </>
      )
    );
  };

  const renderListToggleButton = () => {
    return (
      <Button
        icon
        color="black"
        size="small"
        onClick={() => {
          setIsOpened(false);
          setSearchKeyword("");
        }}
        className="relative left-1/2 -translate-x-1/2 top-2"
      >
        <i className="material-symbols-outlined">
          {isOpened ? "close" : "menu"}
        </i>
      </Button>
    );
  };

  return (
    <div className="fixed z-50 top-14 left-2 right-2 h-10 ">
      <div
        className={`flex gap-2 items-center p-2 rounded-md shadow-md bg-white ${
          isOpened ? "rounded-b-none" : ""
        }`}
      >
        <input
          onChange={(e) => setSearchKeyword(e.target.value)}
          type="text"
          className="w-full h-full focus:outline-none text-sm"
          placeholder="검색어를 입력하세요"
        />
        <i className="material-symbols-outlined">search</i>
      </div>
      {isOpened && <hr />}
      {renderNearPlaceList()}
    </div>
  );
}
