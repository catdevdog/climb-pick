"use client";

import React, { useEffect, useState } from "react";
import KakaoMap from "./KakaoMap";
import useStore from '../store/store';

export default function Home() {
  const { searchResults } = useStore();

  const [newListRequest, setnewListRequest] = useState(false);
  useEffect(() => { console.log(searchResults) }, [searchResults]);

  return (
    <>
      <div className="w-full h-screen">
        <KakaoMap
          newListRequest={newListRequest}
          setnewListRequest={setnewListRequest}
        ></KakaoMap>
        {newListRequest && (
          <button
            className="fixed left-1/2 transform -translate-x-1/2 bottom-20 bg-black text-white text-md rounded-full z-10 py-2 px-4 font-LINESeedKR font-bold"
            onClick={() => setnewListRequest(false)}
          >
            현재 위치에서 검색
          </button>
        )}
      </div>
    </>
  );
}
