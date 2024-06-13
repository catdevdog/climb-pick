"use client";

import { useEffect, useState } from "react";
import { Map, MapMarker } from "react-kakao-maps-sdk";
import type {
  PlacesSearchResult,
  Status,
  Pagination,
  PlacesSearchResultItem,
} from "@/types/kakao";

const KakaoMap: React.FC = () => {
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  }>();
  const [searchKeyword, setSearchKeyword] = useState("클라이밍");
  const [searchResults, setSearchResults] = useState<
    { lat: number; lng: number }[]
  >([]);

  // mounted
  useEffect(() => {
    alert(
      "위치 정보 테스트 배포 1 \n현재 위치 정보 : navigator.geolocation.getCurrentPosition"
    );

    // const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY;
    // const url = `https://www.googleapis.com/geolocation/v1/geolocate?key=${apiKey}`;

    // /**
    //  * @description 현재 위치를 가져오는 API 호출 (첫 진입 시)
    //  * @api https://developers.google.com/maps/documentation/geolocation/overview
    //  */
    // fetch(url, {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify({}),
    // })
    //   .then((response) => response.json())
    //   .then((data) => {
    //     const lat = data.location.lat;
    //     const lng = data.location.lng;

    //     // 현재 위치 저장
    //     setUserLocation({ lat, lng });

    //     console.log("Latitude: " + lat + ", Longitude: " + lng);
    //   })
    //   .catch((error) => {
    //     console.error("Error:", error);
    //   });
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {},
        { enableHighAccuracy: true }
      );
    }
  }, []);

  const handleSearch = async () => {
    const searchOption = {
      location: new kakao.maps.LatLng(userLocation!.lat, userLocation!.lng),
    };
    const ps = new kakao.maps.services.Places();
    ps.keywordSearch(searchKeyword, placesSearchCB, searchOption);
  };

  // 장소검색이 완료됐을 때 호출되는 콜백함수 입니다
  function placesSearchCB(
    result: PlacesSearchResult,
    status: Status,
    pagination: Pagination
  ) {
    console.log(result, status, pagination);

    if (status === kakao.maps.services.Status.OK) {
      setSearchResults(
        result.map((place: PlacesSearchResultItem) => ({
          lat: Number(place.y),
          lng: Number(place.x),
        }))
      );
    }
  }

  return (
    <>
      <input
        type="text"
        value={searchKeyword}
        onChange={(e) => setSearchKeyword(e.target.value)}
      />
      <button className="text-white" onClick={handleSearch}>
        Search
      </button>
      {userLocation && (
        <Map
          id="map"
          center={userLocation as { lat: number; lng: number }}
          level={5}
          style={{ width: "100%", height: "100%" }}
        >
          {searchResults.map((result, idx) => (
            <MapMarker
              key={idx}
              position={{ lat: result.lat, lng: result.lng }}
            />
          ))}
        </Map>
      )}
    </>
  );
};

export default KakaoMap;
