"use client";

import { use, useEffect, useState } from "react";
import { Map, MapMarker, CustomOverlayMap } from "react-kakao-maps-sdk";
import type {
	PlacesSearchResult,
	Status,
	Pagination,
	PlacesSearchResultItem,
} from "@/types/kakao";
import useCurrentLocation from "@/hooks/useCurrentLocation";
import useStore from "@/store/store";

type KakaoMapProps = {
	newListRequest: boolean;
	setnewListRequest: (newListRequest: boolean) => void;
};

export default function KakaoMap({
	newListRequest,
	setnewListRequest,
}: KakaoMapProps) {
	const { $place } = useStore();

	const initLocation = useCurrentLocation();
	const [isKakaoLoaded, setIsKakaoLoaded] = useState(false);

	const [userLocation, setUserLocation] = useState<{
		lat: number;
		lng: number;
	} | null>(null);
	const [changedLocation, setChangedLocation] = useState<{
		lat: number;
		lng: number;
	} | null>(null);

	const [searchKeyword, setSearchKeyword] = useState("클라이밍");
	const [searchResults, setSearchResults] = useState<PlacesSearchResultItem[]>(
		[]
	);

	const [googleResults, setGoogleResults] = useState<any[]>();

	const [onDetail, setOnDetail] = useState(false);
	const [selectedPlace, setSelectedPlace] = useState<PlacesSearchResultItem>();

	//test
	const [placeId, setPlaceId] = useState<string>();

	useEffect(() => {
		window.kakao.maps.load(() => {
			setIsKakaoLoaded(true);
		});
	}, []);

	useEffect(() => {
		$place.setSearchResults(searchResults);
	}, [searchResults]);

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

	useEffect(() => {
		if (selectedPlace) {
			console.log(selectedPlace);
		}
	}, [selectedPlace]);

	const placeSearch = async (location?: kakao.maps.LatLng) => {
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

		// const request = {
		//   query: searchKeyword,
		//   fields: [
		//     "name",
		//     "geometry",
		//     "opening_hours",
		//     "formatted_address",
		//     "place_id",
		//   ],
		// };

		// google places api 사용
		const rqLocation = location || searchOption.location;

		const request = {
			location: new google.maps.LatLng(
				rqLocation.getLat(),
				rqLocation.getLng()
			),
			radius: 3000,
			// type: "sports", // 원하는 장소 유형을 지정합니다.
			keyword: searchKeyword, // 추가 키워드를 사용할 수 있습니다.
		};

		const service = new google.maps.places.PlacesService(
			document.getElementById("search-map") as HTMLDivElement
		);

		service.nearbySearch(request, (results, status) => {
			if (status === google.maps.places.PlacesServiceStatus.OK && results) {
				console.log('nearbySearch', results);
				setGoogleResults(results);
				results.forEach((place) => {
					console.log(place.name);
					//, place?.geometry?.location?.toString()
					// 여기서 장소 정보를 처리합니다.
				});
			} else {
				console.error("Error:", status);
			}
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

	const onSelectPlace = (place: PlacesSearchResultItem) => {
		if (selectedPlace && selectedPlace.id === place.id) {
			setOnDetail(false);
			setSelectedPlace(undefined);
			return;
		}
		setOnDetail(true);
		setSelectedPlace(place);
	};
	return (
		<>
			{userLocation && (
				<Map
					id="map"
					level={6}
					center={userLocation}
					style={{ width: "100%", height: "100%" }}
					onCenterChanged={onCenterChanged}
				>
					{/* {searchResults.map((result, idx) => (
						<MapMarker
							key={idx}
							position={{ lng: Number(result.x), lat: Number(result.y) }}
							image={{
								src: "/images/marker_white.png", // 마커이미지의 주소입니다
								size: {
									width: 25,
									height: 25,
								}, // 마커이미지의 크기입니다
								options: {
									offset: {
										x: 12.5,
										y: 12.5,
									}, // 마커이미지의 옵션입니다. 마커의 좌표와 일치시킬 이미지 안에서의 좌표를 설정합니다.
								},
							}}
							clickable={true}
							onClick={() => onSelectPlace(result)}
						>
						</MapMarker>
					))}
					{searchResults.map((result, idx) => (
						<CustomOverlayMap
							key={result.id}
							position={{ lng: Number(result.x), lat: Number(result.y) }}
							yAnchor={0}
							xAnchor={0}
						>
							<div
								onClick={() => onSelectPlace(result)}
								className={`bg-black bg-opacity-100 relative z-10 ${selectedPlace &&
									selectedPlace.id !== result.id &&
									"bg-opacity-50 -z-10"
									} text-white p-1 px-2 rounded-lg rounded-tl-none`}
							>
								<p className="">{result.place_name}</p>
							</div>
						</CustomOverlayMap>
					))} */}
					{googleResults?.map((result, idx) => (
						<MapMarker
							key={idx}
							position={{
								lat: result.geometry.location.lat(),
								lng: result.geometry.location.lng(),
							}}
							image={{
								src: "/images/marker_white.png", // 마커이미지의 주소입니다
								size: {
									width: 25,
									height: 25,
								}, // 마커이미지의 크기입니다
								options: {
									offset: {
										x: 12.5,
										y: 12.5,
									}, // 마커이미지의 옵션입니다. 마커의 좌표와 일치시킬 이미지 안에서의 좌표를 설정합니다.
								},
							}}
						/>
					))}
					{googleResults?.map((result, idx) => (
						<CustomOverlayMap
							key={result.place_id}
							position={{
								lat: result.geometry.location.lat(),
								lng: result.geometry.location.lng(),
							}}
							yAnchor={0}
							xAnchor={0}
						>
							<div
								onClick={() => onSelectPlace(result)}
								className={`bg-black bg-opacity-100 relative z-10 ${selectedPlace &&
									selectedPlace.id !== result.id &&
									"bg-opacity-50 -z-10"
									} text-white p-1 px-2 rounded-lg rounded-tl-none`}
							>
								<p className="">{result.name}</p>
							</div>
						</CustomOverlayMap>
					))}
				</Map>
			)}
		</>
	);
}
