/**
 * Header component
 * @description 현재 위치를 표시하는 컴포넌트
 */

import React, { useEffect, useState } from "react";
import useStore from "../store/store";
import useGeocoding from "@/hooks/useGeocoding";

export default function Header() {
  const { $place } = useStore();
  const { getAddressFromLatLng } = useGeocoding();

  const [currentAddress, setCurrentAddress] = useState<string | null>(null);

  useEffect(() => {
    if ($place.selectedCoords[0]) {
      getAddressFromLatLng(
        $place.selectedCoords[0].coord.lat,
        $place.selectedCoords[0].coord.lng
      ).then((address) => {
        setCurrentAddress(address);
      });
    }
  }, [$place.selectedCoords[0]]);

  return (
    <>
      <header className="fixed z-40 top-0 left-0 right-0 p-2 bg-white shadow-md">
        <h1 className="flex justify-center items-center text-lg text-center gap-2">
          <span className="material-symbols-outlined">location_searching</span>
          <p>{currentAddress}</p>
        </h1>
      </header>
    </>
  );
}
