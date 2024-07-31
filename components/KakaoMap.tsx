import React, { useEffect, useState } from "react";
import { Map, MapMarker, CustomOverlayMap, Circle } from "react-kakao-maps-sdk";
import useCurrentLocation from "@/hooks/useCurrentLocation";
import useStore from "@/store/store";
import useFirebase from "@/hooks/useFirebase";
import useAuth from "@/hooks/useAuth";
import { TypePlace } from "@/types/place";
import useSearchPlaces from "@/hooks/useSearchPlaces";
import { calculateDistance, searchClosetLocation } from "@/utils";
import Image from "next/image";

// 카카오맵 컴포넌트 props 타입 정의
type KakaoMapProps = {
  searchKeyword?: string;
};

export default function KakaoMap({
  searchKeyword = "클라이밍",
}: KakaoMapProps) {
  // 훅 및 상태 초기화
  const { location: initLocation, error: locationError } = useCurrentLocation();
  const { saveUser } = useFirebase();
  const { $place } = useStore();
  const { user } = useAuth();
  const { places, searchPlaces, searchGooglePlaces } =
    useSearchPlaces(searchKeyword);

  // 상태 관리
  const [selectedPlace, setSelectedPlace] = useState<TypePlace>();
  const [isKakaoLoaded, setIsKakaoLoaded] = useState(false);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>();
  const [userCoord, setUserCoord] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [displayCoord, setDisplayCoord] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // Kakao 지도 SDK 로드 확인
  useEffect(() => {
    window.kakao.maps.load(() => setIsKakaoLoaded(true));
  }, []);

  // 초기 위치 설정 및 사용자 정보 저장
  useEffect(() => {
    if (initLocation && user) {
      console.log("초기 위치:", initLocation);
      setUserCoord(initLocation);
      setDisplayCoord(initLocation);
      saveUser(user.uid, initLocation.lat, initLocation.lng);
    }
  }, [initLocation, user]);

  // 사용자 위치 설정 시 장소 검색
  useEffect(() => {
    if (isKakaoLoaded && userCoord) {
      searchPlaces($place.refCoords.lat, $place.refCoords.lng);
    }
  }, [isKakaoLoaded, userCoord]);

  // 검색 요청에 따른 장소 검색
  useEffect(() => {
    if ($place.searchRequest && displayCoord) {
      console.log("구글 장소 검색 요청");
      searchGooglePlaces(displayCoord.lat, displayCoord.lng);
      $place.setSearchRequest(false);
    }
  }, [$place.searchRequest, displayCoord]);

  // 선택 좌표 변경 시 가장 가까운 장소 정렬
  useEffect(() => {
    if (displayCoord) {
      $place.setSelectedCoords([{ coord: displayCoord, color: "info" }]);
    }
    if (
      displayCoord &&
      places.length > 0 &&
      $place.selectedCoords.length === 1
    ) {
      const sortedPlaces = [...places].sort((a, b) => {
        const aDistance = calculateDistance(
          displayCoord.lat,
          displayCoord.lng,
          a.location.lat,
          a.location.lng
        );
        const bDistance = calculateDistance(
          displayCoord.lat,
          displayCoord.lng,
          b.location.lat,
          b.location.lng
        );
        return aDistance - bDistance;
      });

      $place.setMostNearPlace(
        sortedPlaces[0],
        calculateDistance(
          displayCoord.lat,
          displayCoord.lng,
          sortedPlaces[0].location.lat,
          sortedPlaces[0].location.lng
        )
      );
    }
  }, [displayCoord, places]);

  // 가장 가까운 장소 변경 시 상세 정보 설정
  useEffect(() => {
    if ($place.mostNearPlace.data) {
      // console.log("가장 가까운 장소:", $place.mostNearPlace.data);
    }
  }, [$place.mostNearPlace]);

  // 여러 장소 기준 가장 가까운 장소 검색
  useEffect(() => {
    console.log("선택된 좌표:", $place.selectedCoords);
    if ($place.selectedCoords.length > 1) {
      const selectedCoords = $place.selectedCoords.map((item) => item.coord);
      const closestLocation = searchClosetLocation(selectedCoords, places);
      if (closestLocation) {
        $place.setMostNearPlace(
          closestLocation,
          calculateDistance(
            selectedCoords[0].lat,
            selectedCoords[0].lng,
            closestLocation.location.lat,
            closestLocation.location.lng
          )
        );
      }
    }
  }, [$place.selectedCoords]);

  // 지도 이벤트 핸들러
  const onCenterChanged = (map: kakao.maps.Map) => {
    $place.setCurrentMapCenter({
      lat: map.getCenter().getLat(),
      lng: map.getCenter().getLng(),
    });
  };

  const onSelectPlace = (place: TypePlace) => {
    setSelectedPlace(place);
    console.log("선택된 장소:", place.name, place);
    $place.setDetailPlace(place);
  };

  const onMarkerDragEnd = (
    marker: kakao.maps.Marker,
    color: string,
    idx: number
  ) => {
    const position = marker.getPosition();
    if (idx === 0 && $place.selectedCoords.length === 1) {
      setDisplayCoord({
        lat: position.getLat(),
        lng: position.getLng(),
      });
    }
    const coords = $place.selectedCoords;
    const selectedIdx = coords.findIndex((item) => item.color === color);
    if (selectedIdx > -1) {
      coords.splice(selectedIdx, 1);
    }
    $place.setSelectedCoords([
      ...coords,
      {
        coord: { lat: position.getLat(), lng: position.getLng() },
        color: color,
      },
    ]);
  };

  const onMapClick = (
    _: kakao.maps.Map,
    mouseEvent: kakao.maps.event.MouseEvent
  ) => {
    if ($place.selectedCoords.length === 1) {
      const latlng = mouseEvent.latLng;
      setDisplayCoord({
        lat: latlng.getLat(),
        lng: latlng.getLng(),
      });
    }
  };

  const onDrag = (map: kakao.maps.Map) => {
    setMapCenter({
      lat: map.getCenter().getLat(),
      lng: map.getCenter().getLng(),
    });
  };

  // 오류 처리 및 로딩 상태
  if (locationError) {
    return <div>위치를 가져오는데 실패했습니다: {locationError}</div>;
  }

  if (!userCoord) {
    return <div>위치를 가져오는 중...</div>;
  }

  // 지도 렌더링
  return (
    displayCoord && (
      <Map
        id="map"
        level={5}
        center={displayCoord}
        style={{ width: "100%", height: "100%" }}
        onCenterChanged={onCenterChanged}
        isPanto={true}
        onClick={onMapClick}
        onDrag={onDrag}
        onZoomChanged={onDrag}
      >
        {/* 중앙 마커 */}
        {mapCenter && (
          <MapMarker
            position={mapCenter}
            image={{
              src: "/images/icons/center.svg",
              size: { width: 30, height: 30 },
              options: { offset: { x: 15, y: 15 } },
            }}
            zIndex={100}
          />
        )}

        {/* 검색 반경 표시 */}
        {$place.refCoords && (
          <Circle
            center={{ lat: $place.refCoords.lat, lng: $place.refCoords.lng }}
            radius={$place.SearchDistanceMax}
            strokeWeight={3}
            strokeColor={"#ff0000"}
            strokeOpacity={0.3}
            strokeStyle={"solid"}
            fillColor={"#000000"}
            fillOpacity={0}
          />
        )}

        {/* 선택된 좌표 마커 */}
        {$place.selectedCoords.map((item, idx) => (
          <MapMarker
            key={`${item.color}_${idx}`}
            draggable
            onDragEnd={(e) => onMarkerDragEnd(e, item.color, idx)}
            position={{
              lat: item.coord.lat,
              lng: item.coord.lng,
            }}
            image={{
              src: `/images/location_${item.color}.svg`,
              size: { width: 40, height: 40 },
              options: { offset: { x: 20, y: 40 } },
            }}
            zIndex={100}
          />
        ))}

        {/* 모든 장소 마커 */}
        {places.map((place, idx) => (
          <CustomOverlayMap
            key={`${place.name}_${idx}`}
            position={{
              lat: place.location.lat,
              lng: place.location.lng,
            }}
          >
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full w-5 h-5">
              <Image
                src="/images/data.svg"
                alt="data"
                className="w-5 h-5 max-w-5"
                width={20}
                height={20}
              />
              {place.name === $place.mostNearPlace.data?.name && (
                <>
                  <span className="animate-ping absolute top-1/2 inline-flex h-full w-full rounded-full bg-sky-500 opacity-90"></span>
                  <span className="relative inline-flex top-1/2 rounded-full bg-transparent"></span>
                </>
              )}
            </div>
          </CustomOverlayMap>
        ))}
      </Map>
    )
  );
}
