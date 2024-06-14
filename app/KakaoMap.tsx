"use client";

import { use, useEffect, useState } from "react";
import { Map, MapMarker } from "react-kakao-maps-sdk";
import type {
  PlacesSearchResult,
  Status,
  Pagination,
  PlacesSearchResultItem,
} from "@/types/kakao";
import useCurrentLocation from "@/hooks/useCurrentLocation";

type KakaoMapProps = {
  newListRequest: boolean;
  setnewListRequest: (newListRequest: boolean) => void;
};

export default function KakaoMap({
  newListRequest,
  setnewListRequest,
}: KakaoMapProps) {
  const initLocation = useCurrentLocation();

  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [changedLocation, setChangedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [isKakaoLoaded, setIsKakaoLoaded] = useState(false);

  const [searchKeyword, setSearchKeyword] = useState("클라이밍");
  const [searchResults, setSearchResults] = useState<PlacesSearchResultItem[]>(
    []
  );

  useEffect(() => {
    window.kakao.maps.load(() => {
      setIsKakaoLoaded(true);
    });
  }, []);

  /**
   * @description
   * page 에서 newListRequest 요청 시 (지도 중심이 변경된 후 사용자가 새로운 리스트를 요청)
   */
  useEffect(() => {
    if (isKakaoLoaded && changedLocation) {
      placeSearch(
        new kakao.maps.LatLng(changedLocation.lat, changedLocation.lng)
      );
    }
  }, [newListRequest]);

  /**
   * @description
   * 위치 초기화
   */
  useEffect(() => {
    if (initLocation) {
      setUserLocation(initLocation);
    }
  }, [initLocation]);

  /**
   * @description
   * 위치 초기화 후 장소 검색
   */
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
    if (status === kakao.maps.services.Status.OK) {
      setSearchResults(result.map((item: any) => item));
    }
  };

  // 지도 중심 변경
  const onCenterChanged = (map: kakao.maps.Map) => {
    setnewListRequest(true);
    setChangedLocation({
      lat: map.getCenter().getLat(),
      lng: map.getCenter().getLng(),
    });
  };
  return (
    <>
      {/* <input
        type="text"
        value={searchKeyword}
        onChange={(e) => setSearchKeyword(e.target.value)}
      />
      <button className="text-white" onClick={() => placeSearch()}>
        Search
      </button> */}
      {userLocation && (
        <Map
          id="map"
          level={5}
          center={userLocation}
          style={{ width: "100%", height: "100%" }}
          onCenterChanged={onCenterChanged}
        >
          {searchResults.map((result, idx) => (
            <MapMarker
              key={idx}
              position={{ lng: Number(result.x), lat: Number(result.y) }}
            >
              <div>{result.place_name}</div>
            </MapMarker>
          ))}
        </Map>
      )}
    </>
  );
}
