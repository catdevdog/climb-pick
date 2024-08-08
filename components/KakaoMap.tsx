import useAuth from "@/hooks/useAuth";
import useCurrentLocation from "@/hooks/useCurrentLocation";
import useFirebase from "@/hooks/useFirebase";
import useSearchPlaces from "@/hooks/useSearchPlaces";
import useStore from "@/store/store";
import { calculateDistance, searchClosetLocation } from "@/utils";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Circle, CustomOverlayMap, Map, MapMarker, Polyline } from "react-kakao-maps-sdk";
import Loading from "./Loading";
import Button from "./Button";

// 카카오맵 컴포넌트 props 타입 정의
type KakaoMapProps = {
  searchKeyword?: string;
};

export default function KakaoMap({
  searchKeyword = "클라이밍",
}: KakaoMapProps) {
  // 커스텀 훅 및 상태 초기화
  const { location: initLocation, error: locationError } = useCurrentLocation();
  const { saveUser } = useFirebase();
  const { $place } = useStore();
  const { user } = useAuth();
  const { places, searchPlaces, searchGooglePlaces } =
    useSearchPlaces(searchKeyword);

  // 상태 관리
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
  const mapRef = useRef<kakao.maps.Map>(null);
  const [zoom, setZoom] = useState(5);

  // Kakao 지도 SDK 로드 확인
  useEffect(() => {
    window.kakao.maps.load(() => setIsKakaoLoaded(true));
  }, []);

  // 초기 위치 설정 및 사용자 정보 저장
  useEffect(() => {
    if (initLocation && user) {
      const { lat, lng } = initLocation;
      setUserCoord(initLocation);
      setDisplayCoord(initLocation);
      $place.setSelectedCoords([{ coord: { lat, lng }, color: "info" }]);
      saveUser(user.uid, lat, lng);
    }
  }, [initLocation, user]);

  // 사용자 위치 설정 시 장소 검색
  useEffect(() => {
    if (isKakaoLoaded && userCoord) {
      searchPlaces($place.refCoords.lat, $place.refCoords.lng);
    }
  }, [isKakaoLoaded, userCoord, $place.refCoords]);

  // 검색 요청에 따른 장소 검색
  useEffect(() => {
    if (isKakaoLoaded && userCoord) {
      searchPlaces($place.refCoords.lat, $place.refCoords.lng);
    }
  }, [isKakaoLoaded, userCoord]);

  // 선택 좌표 변경 시 가장 가까운 장소 정렬
  useEffect(() => {
    if (places.length > 0 && $place.selectedCoords.length === 1) {
      const sortedPlaces = [...places].sort((a, b) => {
        const { lat, lng } = $place.selectedCoords[0].coord;
        const aDistance = calculateDistance(
          lat,
          lng,
          a.location.lat,
          a.location.lng
        );
        const bDistance = calculateDistance(
          lat,
          lng,
          b.location.lat,
          b.location.lng
        );
        return aDistance - bDistance;
      });

      const nearestPlace = sortedPlaces[0];
      const distance = calculateDistance(
        $place.selectedCoords[0].coord.lat,
        $place.selectedCoords[0].coord.lng,
        nearestPlace.location.lat,
        nearestPlace.location.lng
      );
      $place.setMostNearPlace(nearestPlace, distance);
    }
  }, [displayCoord, places]);

  // 여러 장소 기준 가장 가까운 장소 검색
  useEffect(() => {
    if ($place.selectedCoords.length > 1) {
      const selectedCoords = $place.selectedCoords.map((item) => item.coord);
      const closestLocation = searchClosetLocation(selectedCoords, places);
      if (closestLocation) {
        const distance = calculateDistance(
          selectedCoords[0].lat,
          selectedCoords[0].lng,
          closestLocation.location.lat,
          closestLocation.location.lng
        );
        $place.setMostNearPlace(closestLocation, distance);
      }
    }
  }, [$place.selectedCoords, places]);

  // 가장 가까운 장소 클릭 시 지도 이동
  useEffect(() => {
    if ($place.selectedDetailPlace !== null && $place.moveTrigger) {
      moveToCoord(
        {
          lat: $place.selectedDetailPlace.location.lat,
          lng: $place.selectedDetailPlace.location.lng,
        },
        3
      );
      $place.setMoveTrigger(false);
    }
  }, [$place.selectedDetailPlace, $place.moveTrigger]);

  // 지도 이벤트 핸들러
  const onCenterChanged = (map: kakao.maps.Map) => {
    $place.setCurrentMapCenter({
      lat: map.getCenter().getLat(),
      lng: map.getCenter().getLng(),
    });
  };

  const moveToCoord = (coord: { lat: number; lng: number }, zoom?: number) => {
    setDisplayCoord(coord);
    mapRef.current!.panTo(new kakao.maps.LatLng(coord.lat, coord.lng));
    if (zoom && mapRef.current) {
      setTimeout(() => {
        mapRef.current!.setLevel(zoom);
        setZoom(mapRef.current!.getLevel());
      }, 500);
    }
  };

  const onMarkerDragEnd = (
    marker: kakao.maps.Marker,
    color: string,
    idx: number
  ) => {
    const position = marker.getPosition();
    const newCoord = { lat: position.getLat(), lng: position.getLng() };

    if (idx === 0 && $place.selectedCoords.length === 1) {
      setDisplayCoord(newCoord);
    }

    const updatedCoords = $place.selectedCoords.filter(
      (item) => item.color !== color
    );
    $place.setSelectedCoords([...updatedCoords, { coord: newCoord, color }]);
  };

  const onMapClick = (
    _: kakao.maps.Map,
    mouseEvent: kakao.maps.event.MouseEvent
  ) => {
    if ($place.selectedCoords.length === 1) {
      const latlng = mouseEvent.latLng;
      const newCoord = { lat: latlng.getLat(), lng: latlng.getLng() };
      $place.setSelectedCoords([{ coord: newCoord, color: "info" }]);
      moveToCoord(newCoord);
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
    return <Loading />;
  }

  // 지도 렌더링
  return (
    displayCoord && (
      <Map
        ref={mapRef}
        id="map"
        level={zoom}
        zoomable={true}
        center={displayCoord}
        style={{ width: "100%", height: "100%" }}
        onCenterChanged={onCenterChanged}
        isPanto={true}
        onClick={onMapClick}
        onDrag={onDrag}
        onZoomChanged={onDrag}
      >

        {/* 가장 가까운 장소 선 */}
        {places.length > 0 && $place.mostNearPlace.data && (
          $place.selectedCoords.map((item, idx) => (
            <Polyline
              key={`line_${idx}`}
              path={[[
                { lat: item.coord.lat, lng: item.coord.lng },
                {
                  lat: $place.mostNearPlace.data!.location.lat,
                  lng: $place.mostNearPlace.data!.location.lng,
                },
              ]]}
              strokeWeight={2}
              strokeColor={"black"}
              strokeOpacity={0.4}
              strokeStyle={"dashed"}
            />
          ))
        )}
        {/* 중앙 표시 마커 */}
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

        {/* 클라임픽 최종 데이터 반경 표시 */}
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

        {/* <Button
          color="info"
          size="medium"
          className="fixed z-10 left-1/2 transform -translate-x-1/2 bottom-5"
          onClick={() => searchGooglePlaces(37.5864428, 127.1702517)}
        >
          Google Map 검색
        </Button> */}
        
        {/* 구글 API 검색 반경 표시 */}
        {/* 경기 : 37.5864428 127.1702517 */}
        {$place.currentSearchSectionCoords && (
          <Circle
            center={$place.currentSearchSectionCoords}
            radius={$place.currentSearchSectionDistance}
            strokeWeight={3}
            strokeColor={"#ff00ff"}
            strokeOpacity={0.3}
            strokeStyle={"solid"}
            fillColor={"#000000"}
            fillOpacity={0}
          />
        )}

        {/* 선택된 좌표(유저) 마커 */}
        {$place.selectedCoords.map((item, idx) => (
          <MapMarker
            key={`${item.color}_${idx}`}
            draggable
            onDragEnd={(e) => onMarkerDragEnd(e, item.color, idx)}
            position={item.coord}
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
            position={place.location}
          >
              {place.name === $place.mostNearPlace.data?.name ? (
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[2rem] w-10 h-10">
                  <Image
                    src="/images/3d/pin_iso.svg"
                    alt="data"
                    className="w-10 h-10"
                    width={30}
                    height={30}
                  />
                  <span className="animate-ping absolute top-1/2 right-[0.65rem] inline-flex h-5 w-5 rounded-full bg-red-500 opacity-90"></span>
                  <span className="relative inline-flex top-1/2 rounded-full bg-transparent"></span>
                </div>
              ):(
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full w-5 h-5">
                  <Image
                    src="/images/data.svg"
                    alt="data"
                    className="w-5 h-5 max-w-5"
                    width={20}
                    height={20}
                  />
                </div>
              )}
          </CustomOverlayMap>
        ))}
      </Map>
    )
  );
}
