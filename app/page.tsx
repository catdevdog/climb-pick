'use client';
import React, { useEffect } from 'react';
import KakaoMap from './KakaoMap';

export default function Home() {
  useEffect(() => {
  }, []);

  return (
    <>
      <div className="w-full h-screen">
        <KakaoMap></KakaoMap>
      </div>
    </>
  );
}