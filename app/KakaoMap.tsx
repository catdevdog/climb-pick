import React, { useEffect, useState, useCallback, use } from "react";
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

  const { places, searchPlaces } = useSearchPlaces(searchKeyword);

  const [selectedPlace, setSelectedPlace] = useState<TypePlace>();
  const [isKakaoLoaded, setIsKakaoLoaded] = useState(false);

  // 사용자 현재 위치
  const [useCoord, setUserCoord] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // 지도에 표시할 마커 위치
  const [displayCoord, setDisplayCoord] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // Kakao 지도 SDK 로드 확인
  useEffect(() => {
    window.kakao.maps.load(() => setIsKakaoLoaded(true));
  }, []);

  // 첫 진입시 사용자 위치 설정, 로그인 정보 저장
  useEffect(() => {
    if (initLocation && user) {
      console.log("initLocation", initLocation);
      setUserCoord(initLocation);
      setDisplayCoord(initLocation);
      saveUser(user.uid, initLocation.lat, initLocation.lng);
    }
  }, [initLocation, user]);

  // 사용자 위치 설정 시 장소 검색
  useEffect(() => {
    if (isKakaoLoaded && useCoord) {
      searchPlaces($place.refCoords.lat, $place.refCoords.lng);
    }
  }, [isKakaoLoaded, useCoord]);

  // 검색 요청에 따른 장소 검색
  useEffect(() => {
    if ($place.searchRequest && displayCoord) {
      // searchPlaces($place.refCoords.lat, $place.refCoords.lng);
      // $place.setSearchRequest(false);
    }
  }, [$place.searchRequest, displayCoord]);

  /**
   * 지도 중심 변경 핸들러
   * @param map 카카오 맵 객체
   */
  const onCenterChanged = (map: kakao.maps.Map) => {
    // $place.setcenterChanged(true);
    // setDisplayCoord({
    //   lat: map.getCenter().getLat(),
    //   lng: map.getCenter().getLng(),
    // });
  };

  /**
   * 장소 선택 핸들러
   * @param place 선택된 장소 정보
   */
  const onSelectPlace = (place: TypePlace) => {
    setSelectedPlace(place);
  };

  /**
   * 마커 드래그 종료 핸들러
   * @param marker kakao.maps.Marker 객체
   */
  const onMarkerDragEnd = (marker: kakao.maps.Marker) => {
    const position = marker.getPosition();
    setDisplayCoord({
      lat: position.getLat(),
      lng: position.getLng(),
    });
    // $place.setcenterChanged(true);
  };

  const onMapClick = (
    map: kakao.maps.Map,
    mouseEvent: kakao.maps.event.MouseEvent
  ) => {
    const latlng = mouseEvent.latLng;
    setDisplayCoord({
      lat: latlng.getLat(),
      lng: latlng.getLng(),
    });
  };

  if (locationError) {
    return <div>위치를 가져오는데 실패했습니다: {locationError}</div>;
  }

  if (!useCoord) {
    return <div>위치를 가져오는 중...</div>;
  }

  return (
    displayCoord && (
      <Map
        id="map"
        level={5}
        center={displayCoord}
        style={{ width: "100%", height: "100%" }}
        onCenterChanged={onCenterChanged}
        isPanto={true}
        onClick={(_, mouseEvent) => onMapClick(_, mouseEvent)}
      >
        {$place.refCoords && (
          <Circle
            center={{ lat: $place.refCoords.lat, lng: $place.refCoords.lng }}
            radius={$place.searchDistance}
            strokeWeight={3} // 두께
            strokeColor={"#ff0000"} // 색깔
            strokeOpacity={0.3} // 불투명도
            strokeStyle={"solid"} // 스타일
            fillColor={"#000000"} // 채우기 색깔
            fillOpacity={0} // 채우기 불투명도
          />
        )}
        <MapMarker
          draggable
          onDragEnd={onMarkerDragEnd}
          position={{
            lat: displayCoord.lat,
            lng: displayCoord.lng,
          }}
          image={{
            src: "/images/location_my.svg",
            size: { width: 50, height: 50 },
            options: { offset: { x: 25, y: 50 } },
          }}
          zIndex={100}
        />
        {places.map((place, idx) => (
          <React.Fragment key={`${place.name}_${idx}`}>
            <MapMarker
              position={{
                lat: place.location.lat,
                lng: place.location.lng,
              }}
              image={{
                src: "/images/data.svg",
                size: { width: 25, height: 25 },
                options: { offset: { x: 12.5, y: 25 } },
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
    )
  );
}
