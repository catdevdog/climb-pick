import React, { useEffect, useState, useCallback, use } from "react";
import { Map, MapMarker, CustomOverlayMap, Circle } from "react-kakao-maps-sdk";
import useCurrentLocation from "@/hooks/useCurrentLocation";
import useStore from "@/store/store";
import useFirebase from "@/hooks/useFirebase";
import useAuth from "@/hooks/useAuth";
import { TypePlace } from "@/types/place";
import useSearchPlaces from "@/hooks/useSearchPlaces";
import { calculateDistance } from "@/utils";

// 카카오맵 컴포넌트 props 타입 정의
type KakaoMapProps = {
  searchKeyword?: string;
};

export default function KakaoMap({
  searchKeyword = "클라이밍",
}: KakaoMapProps) {
  const { location: initLocation, error: locationError } = useCurrentLocation();
  const { saveUser } = useFirebase();
  const { $place } = useStore();
  const { user } = useAuth();

  const { places, searchPlaces, searchFirebasePlaces, searchGooglePlaces } =
    useSearchPlaces(searchKeyword);

  const [selectedPlace, setSelectedPlace] = useState<TypePlace>();
  const [isKakaoLoaded, setIsKakaoLoaded] = useState(false);
  const [filteredPlaces, setFilteredPlaces] = useState<TypePlace[]>([]);

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
      console.log("구글 장소 검색 요청:::::::");
      searchGooglePlaces(displayCoord.lat, displayCoord.lng);
      $place.setSearchRequest(false);
    }
  }, [$place.searchRequest, displayCoord]);

  // 선택 좌표 변경 시 가장 가까운 장소 순으로 정렬
  useEffect(() => {
    if (displayCoord && places.length > 0) {
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
      setFilteredPlaces(sortedPlaces);
      $place.setMostNearPlace(sortedPlaces[0], calculateDistance(displayCoord.lat, displayCoord.lng, sortedPlaces[0].location.lat, sortedPlaces[0].location.lng));
    }
  }, [displayCoord, places]);

  // 가장 가까운 장소 변경 시 상세 정보 설정
  useEffect(() => {
    if ($place.mostNearPlace.data) {
      console.log("가장 가까운 장소", $place.mostNearPlace.data);
    }
  }, [$place.mostNearPlace]);


  /**
   * 지도 중심 변경 핸들러
   * @param map 카카오 맵 객체
   */
  const onCenterChanged = (map: kakao.maps.Map) => {
    // setDisplayCoord({
    //   lat: map.getCenter().getLat(),
    //   lng: map.getCenter().getLng(),
    // });
  };

  /**
   * 장소 선택 핸들러
   * @param marker 선택된 장소 정보
   */
  const onSelectPlace = (place: TypePlace) => {
    setSelectedPlace(place);
    console.log("place", place.name, place);
    $place.setDetailPlace(place);
    // alert(place.name);
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
  };

  /**
   * 지도 클릭 핸들러
   * @param map 카카오 맵 객체
   * @param mouseEvent 마우스 이벤트 객체
   */
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
        <Circle
          center={{ lat: displayCoord.lat, lng: displayCoord.lng }}
          radius={$place.googleSearchDistance}
          strokeWeight={3} // 두께
          strokeColor={"#0000ff"} // 색깔
          strokeOpacity={0.3} // 불투명도
          strokeStyle={"solid"} // 스타일
          fillColor={"#000000"} // 채우기 색깔
          fillOpacity={0} // 채우기 불투명도
        />
        {$place.refCoords && (
          <Circle
            center={{ lat: $place.refCoords.lat, lng: $place.refCoords.lng }}
            radius={$place.SearchDistanceMax}
            strokeWeight={3} // 두께
            strokeColor={"#ff0000"} // 색깔
            strokeOpacity={0.3} // 불투명도
            strokeStyle={"solid"} // 스타일
            fillColor={"#000000"} // 채우기 색깔
            fillOpacity={0} // 채우기 불투명도
          />
        )}

        {/* 사용자 선택 위치 */}
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
              onClick={() => onSelectPlace(place)}
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
