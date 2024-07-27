"use client";

import React, { useEffect, useState, useCallback } from "react";
import KakaoMap from "../../components/KakaoMap";
import useStore from "../../store/store";
import Button from "@/components/Button";
import SearchResultsList from "@/components/SearchResultsList";
import { useRouter } from "next/navigation";
import Detail from "@/components/Detail";
import MostNearPlace from "@/components/MostNearPlace";
import Modal from "@/components/Modal";

export default function Home() {
  const { $place } = useStore();
  const [openList, setOpenList] = useState(false);
  const router = useRouter();
  const [openModal, setOpenModal] = useState(false);
  const [openCoordButtons, setOpenCoordButtons] = useState(false);
  const [openAnimation, setOpenAnimation] = useState(false);

  useEffect(() => {
    if ($place.searchResults.length > 0) {
      // setOpenList(true);
    }
  }, [$place.searchResults]);

  /**
   * 검색 결과 목록 토글 핸들러
   */
  const toggleList = useCallback(() => {
    setOpenList((prev) => !prev);
  }, []);

  /**
   * 재검색 요청 핸들러
   */
  const handleReSearch = useCallback(() => {
    $place.setSearchRequest(true);
  }, [$place]);

  /**
   * 다중 좌표 스토어 저장 함수
   */
  const handleSaveSelectedCoords = (color: string) => {
    const coords = $place.selectedCoords;
    const selectedIdx = coords.findIndex((item) => item.color === color);
    if (selectedIdx > -1) {
      coords.splice(selectedIdx, 1);
      $place.setSelectedCoords(coords);
    } else {
      $place.setSelectedCoords([...coords, { coord: { lat: $place.currentMapCenter.lat, lng: $place.currentMapCenter.lng }, color: color }]);
    }
  }


  const checkStore = () => {
    console.log($place);
  }

  return (
    <>
      <div className="w-full h-screen relative">
        <div id="search-map" className="hidden"></div>
        <KakaoMap />
        <Button color="black"
          size="medium"
          className="fixed z-10 right-5 bottom-5"
          onClick={checkStore}
        >
          store console
        </Button>

        {openList && (
          <Button
            color="info"
            size="medium"
            className="fixed z-10 left-1/2 transform -translate-x-1/2 bottom-5"
            onClick={handleReSearch}
          >
            Google Map 검색
          </Button>
        )}

        {false && $place.searchResults.length > 0 && (
          <Button
            color="info"
            size="medium"
            icon
            className="fixed z-10 bottom-5 left-5 rounded-full"
            onClick={toggleList}
          >
            <i className="material-symbols-outlined">
              {openList ? "close" : "menu"}
            </i>
          </Button>
        )}

        <Button
          color="black"
          size="medium"
          icon
          className="fixed z-20 left-5 bottom-5"
          onClick={() => { setOpenCoordButtons(!openCoordButtons) }}
        >
          <i className="material-symbols-outlined">
            {openCoordButtons ? 'close' : 'add_location_alt'}
          </i>
        </Button>

        <div className={`fixed z-10 overflow-hidden ${openCoordButtons ? 'left-16 w-full' : 'left-5 w-1'} bottom-5 flex gap-1 duration-300`}>
          {
            ($place.coordColors.map((item, idx) => {
              return (
                <Button
                  key={item}
                  color={item as any}
                  size="medium"
                  icon
                  onClick={() => { handleSaveSelectedCoords(item) }}
                >
                  <i className="material-symbols-outlined">
                    add_location_alt
                  </i>
                </Button>
              )
            })
            )
          }
        </div>

        {$place.detailPlace && <Detail />}
        {openList && <SearchResultsList results={$place.searchResults} />}
        {$place.mostNearPlace.data && <MostNearPlace />}
      </div>
      <Modal title="비교 위치 추가하기" isOpen={openModal} onClose={() => { setOpenModal(false) }}>
        <div>
          <p>위치 추가 로직 필요</p>
        </div>
      </Modal>
    </>
  );
}
