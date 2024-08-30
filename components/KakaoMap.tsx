import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  Circle,
  CustomOverlayMap,
  Map,
  MapMarker,
  Polyline,
} from "react-kakao-maps-sdk";

import useAuth from "@/hooks/useAuth";
import useCurrentLocation from "@/hooks/useCurrentLocation";
import useFirebase from "@/hooks/useFirebase";
import useSearchPlaces from "@/hooks/useSearchPlaces";
import useStore from "@/store/store";
import { calculateDistance, searchClosetLocation } from "@/utils";
import Loading from "./Loading";
import Button from "./Button";
import Modal from "./Modal";
import { set } from "firebase/database";

// 카카오맵 컴포넌트 props 타입 정의
type KakaoMapProps = {
  searchKeyword?: string;
};

// 좌표 타입 정의
type Coord = {
  lat: number;
  lng: number;
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
  const mapRef = useRef<kakao.maps.Map>(null);
  const [isKakaoLoaded, setIsKakaoLoaded] = useState(false);
  const [mapCenter, setMapCenter] = useState<Coord>();
  const [userCoord, setUserCoord] = useState<Coord | null>(null);
  const [displayCoord, setDisplayCoord] = useState<Coord | null>(null);
  const [zoom, setZoom] = useState(5);
  const [togglePlaceName, setTogglePlaceName] = useState(false);
  const [controlPolyline, setControlPolyline] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [searchModal, setSearchModal] = useState(false);

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

  // 선택 좌표 변경 시 가장 가까운 장소 정렬
  useEffect(() => {
    if (places.length > 0 && $place.selectedCoords.length === 1) {
      const sortedPlaces = sortPlacesByDistance(
        places,
        $place.selectedCoords[0].coord
      );
      updateNearestPlace(sortedPlaces[0], $place.selectedCoords[0].coord);
    }
  }, [$place.selectedCoords[0], places]);

  // 여러 장소 기준 가장 가까운 장소 검색
  useEffect(() => {
    if ($place.selectedCoords.length > 1) {
      const selectedCoords = $place.selectedCoords.map((item) => item.coord);
      const closestLocation = searchClosetLocation(selectedCoords, places);
      if (closestLocation) {
        updateNearestPlace(closestLocation, selectedCoords[0]);
      }
    }
  }, [$place.selectedCoords]);

  // 가장 가까운 장소 변경 시 디테일 초기화
  useEffect(() => {
    $place.setDetailPlace(null);
  }, [$place.mostNearPlace]);

  // 가장 가까운 장소 클릭 시 지도 이동
  useEffect(() => {
    if ($place.selectedDetailPlace !== null && $place.moveTrigger) {
      moveToCoord($place.selectedDetailPlace.location, 3);
      $place.setMoveTrigger(false);
    }
  }, [$place.selectedDetailPlace, $place.moveTrigger]);

  // 검색 값이 있을 때 검색 실행
  useEffect(() => {
    if (searchValue.length > 0) {
      onUserSearch();
    }
  }, [searchValue]);

  const openSearchModal = () => {
    setSearchModal(true);
    moveToCoord(userCoord!, 10);
  };

  // 장소를 거리순으로 정렬하는 함수
  const sortPlacesByDistance = (placesToSort: any[], referenceCoord: Coord) => {
    return [...placesToSort].sort((a, b) => {
      const aDistance = calculateDistance(
        referenceCoord.lat,
        referenceCoord.lng,
        a.location.lat,
        a.location.lng
      );
      const bDistance = calculateDistance(
        referenceCoord.lat,
        referenceCoord.lng,
        b.location.lat,
        b.location.lng
      );
      return aDistance - bDistance;
    });
  };

  // 가장 가까운 장소 업데이트 함수
  const updateNearestPlace = (place: any, referenceCoord: Coord) => {
    const distance = calculateDistance(
      referenceCoord.lat,
      referenceCoord.lng,
      place.location.lat,
      place.location.lng
    );
    $place.setMostNearPlace(place, distance);
  };

  // 사용자 검색 함수
  const onUserSearch = () => {
    if (searchValue.length > 0) {
      const searchResult = places.filter(
        (place) =>
          place.name.includes(searchValue) ||
          place.address.includes(searchValue)
      );
      $place.setUserSearchResults(searchResult);
    }
  };

  // 지도 이벤트 핸들러
  const onCenterChanged = (map: kakao.maps.Map) => {
    $place.setCurrentMapCenter({
      lat: map.getCenter().getLat(),
      lng: map.getCenter().getLng(),
    });
  };

  // 지도 이동 함수
  const moveToCoord = (coord: Coord, zoom?: number) => {
    setDisplayCoord(coord);
    mapRef.current!.panTo(new kakao.maps.LatLng(coord.lat, coord.lng));
    if (zoom && mapRef.current) {
      setTimeout(() => {
        mapRef.current!.setLevel(zoom);
        setZoom(mapRef.current!.getLevel());
      }, 500);
    }
  };

  // 마커 드래그 종료 이벤트 핸들러
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

  // 지도 클릭 이벤트 핸들러
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

  // 지도 드래그 이벤트 핸들러
  const onDrag = (map: kakao.maps.Map) => {
    setMapCenter({
      lat: map.getCenter().getLat(),
      lng: map.getCenter().getLng(),
    });
    setControlPolyline(false);
  };

  // 지도 드래그 종료 이벤트 핸들러
  const onDragEnd = () => {
    setControlPolyline(true);
  };

  // 오류 처리 및 로딩 상태
  if (locationError) {
    return <div>위치를 가져오는데 실패했습니다: {locationError}</div>;
  }

  if (!userCoord) {
    return <Loading />;
  }

  // 연결선 렌더링 함수
  const renderPolylines = () => {
    return (
      controlPolyline &&
      places.length > 0 &&
      $place.mostNearPlace.data &&
      $place.selectedCoords.map((item, idx) => (
        <Polyline
          key={`line_${idx}`}
          path={[
            [
              { lat: item.coord.lat, lng: item.coord.lng },
              {
                lat: $place.mostNearPlace.data!.location.lat,
                lng: $place.mostNearPlace.data!.location.lng,
              },
            ],
          ]}
          strokeWeight={2}
          strokeColor={"black"}
          strokeOpacity={0.4}
          strokeStyle={"dashed"}
        />
      ))
    );
  };

  // 중앙 마커 렌더링 함수
  const renderCenterMarker = () => {
    return (
      mapCenter && (
        <MapMarker
          position={mapCenter}
          image={{
            src: "/images/icons/center.svg",
            size: { width: 30, height: 30 },
            options: { offset: { x: 15, y: 15 } },
          }}
          zIndex={100}
        />
      )
    );
  };

  // 검색 반경 원 렌더링 함수
  const renderSearchRadiusCircle = () => {
    return (
      $place.refCoords && (
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
      )
    );
  };

  // 토글 버튼 렌더링 함수
  const renderToggleButton = () => {
    return (
      <Button
        color="black"
        size="large"
        className="fixed z-10 left-5 bottom-16"
        onClick={() => setTogglePlaceName(!togglePlaceName)}
        icon
      >
        <i className="material-symbols-outlined">
          {togglePlaceName ? "label_off" : "label"}
        </i>
      </Button>
    );
  };

  // 검색 버튼 렌더링 함수
  const renderSearchButton = () => {
    return (
      <Button
        color="black"
        size="medium"
        className="fixed z-10 right-5 bottom-5"
        onClick={() => openSearchModal()}
        icon
      >
        <i className="material-symbols-outlined">search</i>
      </Button>
    );
  };

  // 구글 검색 반경 원 렌더링 함수
  const renderGoogleSearchRadiusCircle = () => {
    return (
      $place.currentSearchSectionCoords && (
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
      )
    );
  };

  // 선택된 좌표 마커 렌더링 함수
  const renderSelectedCoordMarkers = () => {
    return $place.selectedCoords.map((item, idx) => (
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
    ));
  };

  // 장소 마커 렌더링 함수
  const renderPlaceMarkers = () => {
    return places.map((place, idx) => (
      <CustomOverlayMap
        key={`${place.name}_${idx}`}
        position={place.location}
        zIndex={
          place.name === $place.mostNearPlace.data?.name ||
          $place.userSearchResults.map((item) => item.name).includes(place.name)
            ? 100
            : 0
        }
      >
        {place.name === $place.mostNearPlace.data?.name ? (
          // 가장 가까운 장소 하이라이트
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[2rem] w-10 h-10">
            <Image
              src="/images/data_checked.svg"
              alt="data"
              className="w-10 h-10"
              width={30}
              height={30}
            />
            {/* 이름 표기 */}
            {(togglePlaceName ||
              $place.mostNearPlace.data.name === place.name) && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 bg-blue-500 px-2 rounded-md shadow-sm">
                <span className="text-sm text-white">{place.name}</span>
              </div>
            )}
            <span className="animate-ping absolute top-1/2 right-[0.65rem] inline-flex h-5 w-5 rounded-full bg-blue-500 opacity-90"></span>
            <span className="relative inline-flex top-1/2 rounded-full bg-transparent"></span>
          </div>
        ) : (
          // 그 외 장소
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full w-5 h-5 pointer-events-none">
            <Image
              src="/images/data_checked.svg"
              alt="data"
              className="w-5 h-5 max-w-5"
              width={20}
              height={20}
            />
            {(togglePlaceName ||
              // 검색 결과 중에 포함된 장소는 이름 표기
              $place.userSearchResults.includes(place)) && (
              <div className="bg-stone-800 absolute top-full left-1/2 -translate-x-1/2 px-2 rounded-md shadow-sm">
                <span className="text-xs text-white">{place.name}</span>
              </div>
            )}
          </div>
        )}
      </CustomOverlayMap>
    ));
  };

  // 검색 결과 모달 렌더링 함수
  const renderSearchResults = () => {
    return (
      <Modal
        title="검색 결과"
        isOpen={$place.userSearchResults.length > 0}
        onClose={() => $place.setUserSearchResults([])}
      >
        {$place.userSearchResults.map((place, idx) => (
          <div
            key={`${place.name}_${idx}`}
            className="p-2 border-b border-gray-300"
          >
            <p className="text-sm font-bold">{place.name}</p>
            <p className="text-xs text-gray-500">{place.address}</p>
          </div>
        ))}
      </Modal>
    );
  };

  // 내 위치로 이동 버튼 렌더링 함수
  const renderRecenter = () => {
    return (
      <Button
        color="black"
        size="medium"
        icon
        className="fixed z-10 right-5 bottom-16"
        onClick={() => {
          moveToCoord(userCoord!);
        }}
      >
        <i className="material-symbols-outlined">recenter</i>
      </Button>
    );
  };

  // 지도 렌더링
  return (
    displayCoord && (
      <>
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
          onDragEnd={onDragEnd}
          onZoomChanged={(e) => {
            onDrag(e);
            setControlPolyline(true);
          }}
        >
          {/* 가장 가까운 장소 연결선 */}
          {renderPolylines()}

          {/* 중앙 표시 마커 */}
          {renderCenterMarker()}

          {/* 클라임픽 최종 데이터 반경 표시 */}
          {renderSearchRadiusCircle()}

          {/* 장소 이름 토글 버튼 */}
          {renderToggleButton()}

          {/* 검색 버튼 */}
          {renderSearchButton()}

          {/* 구글 API 검색 반경 표시 */}
          {renderGoogleSearchRadiusCircle()}

          {/* 선택된 좌표(유저) 마커 */}
          {renderSelectedCoordMarkers()}

          {/* 모든 장소 마커 */}
          {renderPlaceMarkers()}

          {/* 검색 결과 모달 */}
          {renderSearchResults()}

          {/* 내 위치로 이동 버튼 */}
          {renderRecenter()}
        </Map>
        <Modal
          title="검색"
          isOpen={searchModal}
          onClose={() => setSearchModal(false)}
        >
          <p className="text-sm text-gray-500 mb-1">
            입력과 동시에 검색 결과가 표시됩니다.
          </p>
          <input
            type="text"
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="이름 또는 주소로 검색"
            onChange={(e) => {
              setSearchValue(e.target.value);
            }}
          />
        </Modal>
      </>
    )
  );
}
