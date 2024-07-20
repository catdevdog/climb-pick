"use client";

import React, { useEffect, useState, useCallback } from "react";
import KakaoMap from "../components/KakaoMap";
import useStore from "../store/store";
import Button from "@/components/Button";
import SearchResultsList from "@/components/SearchResultsList";
import { useRouter } from "next/navigation";
import Detail from "@/components/Detail";
import MostNearPlace from "@/components/MostNearPlace";

export default function Home() {
  const { $place } = useStore();
  const [openList, setOpenList] = useState(false);
  const router = useRouter();

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

  return (
    <div className="w-full h-screen relative">
      <div id="search-map" className="hidden"></div>
      <KakaoMap />

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

      {$place.searchResults.length > 0 && (
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
        className="fixed z-10 right-5 bottom-5"
        onClick={() => {
          router.push("/data");
        }}
      >
        admin
      </Button>
      {$place.detailPlace && <Detail />}
      {openList && <SearchResultsList results={$place.searchResults} />}
      {$place.mostNearPlace.data && <MostNearPlace />}
    </div>
  );
}
