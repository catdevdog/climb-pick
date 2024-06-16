"use client";

import React, { useEffect, useState } from "react";
import KakaoMap from "./KakaoMap";
import useStore from '../store/store';
import type { PlacesSearchResultItem } from '@/types/kakao';

export default function Home() {
  const { $place } = useStore();
  const [sortSearchResults, setSortSearchResults] = useState<PlacesSearchResultItem[]>([]);
  const [openList, setOpenList] = useState(false);

  const [newListRequest, setnewListRequest] = useState(false);
  useEffect(() => {
    if ($place.searchResults.length > 0) {
      const sortedResults = $place.searchResults.sort((a, b) => Number(a.distance) - Number(b.distance));
      setSortSearchResults(sortedResults);
    }
  }, [$place.searchResults])

  return (
    <>
      <div className="w-full h-screen">
        <KakaoMap
          newListRequest={newListRequest}
          setnewListRequest={setnewListRequest}
        ></KakaoMap>
        {newListRequest && (
          <button
            className="fixed left-1/2 transform -translate-x-1/2 bottom-5 bg-black text-white text-md rounded-full z-10 py-2 px-4 font-LINESeedKR font-bold"
            onClick={() => setnewListRequest(false)}
          >
            현재 위치에서 검색
          </button>
        )}
        {
          sortSearchResults.length > 0 && (
            <button
              className="fixed bottom-5 left-5 bg-black text-white text-md h-10 w-10 flex justify-center items-center rounded-full z-10"
              onClick={() => setOpenList(!openList)}
            >
              <span className="material-symbols-outlined">
                {openList ? 'close' : 'menu'}
              </span>
            </button>
          )
        }
        {
          openList && (
            <div className="bg-white bg-opacity-80 fixed bottom-16 left-5 p-2 rounded-lg z-10 overflow-y-auto h-2/3">
              {
                sortSearchResults.map((result, idx) => (
                  <div key={idx} className="flex justify-between items-center border-gray-200 py-1">
                    <div className="text-sm">{result.place_name}</div>
                    {/* <div className="text-xs">{result.address_name}</div> */}
                    <div className="text-xs pl-5">{result.distance}m</div>
                  </div>
                ))
              }
            </div>
          )
        }
      </div>
    </>
  );
}
