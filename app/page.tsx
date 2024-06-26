"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import KakaoMap from "./KakaoMap";
import useStore from "../store/store";
import Button from "@/components/Button";
import type { PlacesSearchResultItem } from "@/types/kakao";

export default function Home() {
  const { $place } = useStore();
  const [openList, setOpenList] = useState(false);

  useEffect(() => {
    if ($place.searchResults.length > 0) {
      setOpenList(true);
    }
  }, [$place.searchResults]);

  return (
    <>
      <div className="w-full h-screen">
        {/* <Link href={'/data'}>db test</Link> */}
        <div id="search-map" className="display-none"></div>
        <KakaoMap
        ></KakaoMap>
        {$place.centerChanged && (
          <Button
            color="info"
            size="medium"
            className="fixed z-10 left-1/2 transform -translate-x-1/2 bottom-5"
            onClick={() => $place.setSearchRequest(true)}
          >
            이 지역에서 재검색
          </Button>
        )}
        {$place.searchResults.length > 0 && (
          <Button
            color="info"
            size="medium"
            icon
            className="fixed z-10 bottom-5 left-5 rounded-full"
            onClick={() => setOpenList(!openList)}
          >
            <i className="material-symbols-outlined">
              {openList ? "close" : "menu"}
            </i>
          </Button>
        )}
        {openList && (
          <div className="bg-white bg-opacity-80 fixed bottom-16 left-5 p-2 rounded-lg z-10 overflow-y-auto h-2/3">
            {$place.searchResults.map((result, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center border-gray-200 py-1"
              >
                <div className="flex items-center">
                  <div className="ml-2">
                    <p className="text-sm font-bold">{result.name}</p>
                    <p className="text-xs">{result.vicinity}</p>
                    {/* <p className="text-xs">{result.opening_hours?.open_now ? 'open' : 'closed'}</p> */}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
