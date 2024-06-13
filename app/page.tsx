"use client";

import React, { useEffect, useState } from "react";
import KakaoMap from "./KakaoMap";

export default function Home() {
  const [newListRequest, setnewListRequest] = useState(false);
  useEffect(() => { }, []);

  return (
    <>
      <div className="w-full h-screen">
        <KakaoMap newListRequest={newListRequest} setnewListRequest={setnewListRequest}></KakaoMap>
        {newListRequest &&
          <button
            className="fixed left-1/2  bottom-20 bg-black text-white rounded-full z-10 py-2 px-4"
            onClick={() => setnewListRequest(false)}
          >
            현재 위치에서 다시 검색
          </button>}
      </div>
    </>
  );
}
