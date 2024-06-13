"use client";

import { useEffect, useState } from "react";
import { Map, MapMarker } from "react-kakao-maps-sdk";
import type {
  PlacesSearchResult,
  Status,
  Pagination,
  PlacesSearchResultItem,
} from "@/types/kakao";
import useCurrentLocation from "@/hooks/useCurrentLocation";

const KakaoMap: React.FC = () => {
  const userLocation = useCurrentLocation();
  const [isKakaoLoaded, setIsKakaoLoaded] = useState(false);

  const [searchKeyword, setSearchKeyword] = useState("클라이밍");
  const [searchResults, setSearchResults] = useState<
    { lat: number; lng: number }[]
  >([]);

  useEffect(() => {
    const checkKakaoLoaded = () => {
      if (window.kakao && window.kakao.maps) {
        window.kakao.maps.load(() => {
          setIsKakaoLoaded(true);
        });
      } else {
        setTimeout(checkKakaoLoaded, 100);
      }
    };

    checkKakaoLoaded();
  }, []);

  useEffect(() => {
    if (isKakaoLoaded && userLocation) {
      placeSearch();
    }
  }, [isKakaoLoaded, userLocation]);

  const placeSearch = (location?: kakao.maps.LatLng) => {
    // locaiton이 없으면 현재 위치로 검색

    if (!window.kakao || !window.kakao.maps) return;

    const ps = new window.kakao.maps.services.Places();
    const searchOption = {
      location: new window.kakao.maps.LatLng(
        userLocation!.lat,
        userLocation!.lng
      ),
    };

    ps.keywordSearch(searchKeyword, placeMarkerSet, {
      location: location || searchOption.location,
    });
  };

  const placeMarkerSet = (
    result: PlacesSearchResult,
    status: Status,
    pagination: Pagination
  ) => {
    if (status === window.kakao.maps.services.Status.OK) {
      setSearchResults(
        result.map((place: PlacesSearchResultItem) => ({
          lat: Number(place.y),
          lng: Number(place.x),
        }))
      );
    }
  };

  return (
    <>
      <input
        type="text"
        value={searchKeyword}
        onChange={(e) => setSearchKeyword(e.target.value)}
      />
      <button className="text-white" onClick={() => placeSearch()}>
        Search
      </button>
      {userLocation && (
        <Map
          id="map"
          center={userLocation}
          level={5}
          style={{ width: "100%", height: "100%" }}
        >
          {searchResults.map((result, idx) => (
            <MapMarker key={idx} position={result} />
          ))}
        </Map>
      )}
    </>
  );
};

export default KakaoMap;
