import React, { useEffect, useState, useCallback } from "react";
import { Map, MapMarker, CustomOverlayMap, Circle } from "react-kakao-maps-sdk";
import useCurrentLocation from "@/hooks/useCurrentLocation";
import useStore from "@/store/store";
import useFirebase from "@/hooks/useFirebase";
import useAuth from "@/hooks/useAuth";
import { TypePlace } from "@/types/place";
import useGooglePlaces from "@/hooks/useGooglePlaces";
import { set } from "firebase/database";

// 카카오맵 컴포넌트 props 타입 정의
type KakaoMapProps = {
  searchKeyword?: string;
};

// 장소 검색 훅
const useSearchPlaces = (searchKeyword: string) => {
  const { $place } = useStore();
  const { getPlaces, savePlaces } = useFirebase();
  const { searchNearbyPlaces } = useGooglePlaces();
  const [places, setPlaces] = useState<TypePlace[]>([]);

  /**
   * 주어진 위치를 기준으로 장소를 검색합니다.
   * @param lat 위도
   * @param lng 경도
   */
  const searchPlaces = async (lat: number, lng: number) => {
    try {
      // Firebase에서 장소 검색
      const firebasePlaces = await getPlaces(
        lat,
        lng,
        $place.searchDistance / 1000
      );

      // TODO: Firebase에 데이터가 1건이라도 있으면 실제 API 데이터와 달라도 Firebase 데이터를 사용하는 현상 수정.
      if (firebasePlaces.length > 0) {
        setPlaces(firebasePlaces);
        $place.setSearchResults(firebasePlaces);
      } else {
        console.debug(
          "저장된 장소가 없습니다. Google Places API를 사용하여 검색합니다."
        );
        // Google Places API를 사용하여 검색
        const googlePlaces = await searchNearbyPlaces(
          lat,
          lng,
          $place.searchDistance,
          searchKeyword
        );
        setPlaces(googlePlaces);
        $place.setSearchResults(googlePlaces);
        savePlaces(googlePlaces);
      }
    } catch (error) {
      console.error("장소 검색 중 오류 발생:", error);
      // 에러 처리 로직 추가
    }
  };

  return { places, searchPlaces };
};

export default function KakaoMap({
  searchKeyword = "클라이밍",
}: KakaoMapProps) {
  const { location: initLocation, error: locationError } = useCurrentLocation();
  const { saveUser } = useFirebase();
  const { $place } = useStore();
  const { user } = useAuth();

  const [isKakaoLoaded, setIsKakaoLoaded] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [changedLocation, setChangedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<TypePlace>();

  const { places, searchPlaces } = useSearchPlaces(searchKeyword);

  // Kakao 지도 SDK 로드 확인
  useEffect(() => {
    window.kakao.maps.load(() => setIsKakaoLoaded(true));
  }, []);

  // 초기 사용자 위치 설정 및 Firebase 데이터 저장
  useEffect(() => {
    if (initLocation && user) {
      setUserLocation(initLocation);
      setChangedLocation(initLocation);
      saveUser(user.uid, initLocation.lat, initLocation.lng);
    }
  }, [initLocation, user]);

  // 사용자 위치 설정 시 장소 검색
  useEffect(() => {
    if (isKakaoLoaded && userLocation) {
      searchPlaces(userLocation.lat, userLocation.lng);
    }
  }, [isKakaoLoaded, userLocation]);

  // 검색 요청에 따른 장소 검색
  useEffect(() => {
    if ($place.searchRequest && changedLocation) {
      searchPlaces(changedLocation.lat, changedLocation.lng);
      $place.setSearchRequest(false);
    }
  }, [$place.searchRequest, changedLocation]);

  /**
   * 지도 중심 변경 핸들러
   * @param map 카카오 맵 객체
   */
  const onCenterChanged = (map: kakao.maps.Map) => {
    $place.setcenterChanged(true);
    setChangedLocation({
      lat: map.getCenter().getLat(),
      lng: map.getCenter().getLng(),
    });
  };

  /**
   * 장소 선택 핸들러
   * @param place 선택된 장소 정보
   */
  const onSelectPlace = (place: TypePlace) => {
    setSelectedPlace(place);
  };

  if (locationError) {
    return <div>위치를 가져오는데 실패했습니다: {locationError}</div>;
  }

  if (!userLocation) {
    return <div>위치를 가져오는 중...</div>;
  }

  return (
    <Map
      id="map"
      level={6}
      center={userLocation}
      style={{ width: "100%", height: "100%" }}
      onCenterChanged={onCenterChanged}
    >
      {changedLocation && (
        <Circle
          center={{
            lat: changedLocation.lat,
            lng: changedLocation.lng,
          }}
          radius={$place.searchDistance}
          strokeWeight={2} // 선의 두께입니다
          strokeColor={"#ff0000"} // 선의 색깔입니다
          strokeOpacity={0.3} // 선의 불투명도 입니다 1에서 0 사이의 값이며 0에 가까울수록 투명합니다
          strokeStyle={"solid"} // 선의 스타일 입니다
          fillColor={"#000000"} // 채우기 색깔입니다
          fillOpacity={0} // 채우기 불투명도 입니다
        />
      )}
      {places.map((place, idx) => (
        <React.Fragment key={`${place.name}_${idx}`}>
          <MapMarker
            position={{
              lat: place.location.lat,
              lng: place.location.lng,
            }}
            image={{
              src: "/images/marker_white.png",
              size: { width: 20, height: 20 },
              options: { offset: { x: 10, y: 10 } },
            }}
          />
          {/* <CustomOverlayMap
            position={{
              lat: place.location.lat,
              lng: place.location.lng,
            }}
            yAnchor={0}
            xAnchor={0}
          >
            <div
              onClick={() => onSelectPlace(place)}
              className={`bg-black ${
                selectedPlace && selectedPlace.name !== place.name
                  ? "bg-opacity-50 -z-10"
                  : "bg-opacity-100 relative z-10"
              } text-white p-1 px-2 rounded-lg rounded-tl-none`}
            >
              <p>{place.name}</p>
            </div>
          </CustomOverlayMap> */}
        </React.Fragment>
      ))}
    </Map>
  );
}
