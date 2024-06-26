"use client";

import { useEffect, useState } from "react";
import { Map, MapMarker, CustomOverlayMap } from "react-kakao-maps-sdk";
import useCurrentLocation from "@/hooks/useCurrentLocation";
import useStore from "@/store/store";
import useFirebase from '@/hooks/useFirebase';
import useAuth from '@/hooks/useAuth';

type KakaoMapProps = {
};

export default function KakaoMap({
}: KakaoMapProps) {
	const { $place } = useStore();
	const { user } = useAuth();
	const { dataSet } = useFirebase();
	const initLocation = useCurrentLocation();

	const [isKakaoLoaded, setIsKakaoLoaded] = useState(false);
	const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
	const [changedLocation, setChangedLocation] = useState<{ lat: number; lng: number } | null>(null);

	const [searchKeyword, setSearchKeyword] = useState("클라이밍");
	const [googleResults, setGoogleResults] = useState<google.maps.places.PlaceResult[]>([]);

	const [selectedPlace, setSelectedPlace] = useState<google.maps.places.PlaceResult>();

	useEffect(() => {
		window.kakao.maps.load(() => setIsKakaoLoaded(true));
	}, []);

	useEffect(() => {
		if (initLocation && user) {
			setUserLocation(initLocation);
			dataSet(user.uid, initLocation.lat, initLocation.lng);
		}
	}, [initLocation, user]);

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

	useEffect(() => {
		if ($place.searchRequest) {
			placeSearch(new kakao.maps.LatLng(changedLocation!.lat, changedLocation!.lng));
			$place.setSearchRequest(false);
		}
	}, [$place.searchRequest])

	/**
	 * @description 장소 검색을 수행하고 결과를 설정합니다.
	 * @param {kakao.maps.LatLng} [location] - 검색할 위치
	 */
	const placeSearch = (location?: kakao.maps.LatLng) => {
		if (!window.kakao || !window.kakao.maps) return;

		const searchOption = {
			location: new window.kakao.maps.LatLng(userLocation!.lat, userLocation!.lng),
		};

		const rqLocation = location || searchOption.location;

		const request = {
			location: new google.maps.LatLng(rqLocation.getLat(), rqLocation.getLng()),
			radius: $place.searchDistance,
			keyword: searchKeyword,
		};

		const service = new google.maps.places.PlacesService(
			document.getElementById("search-map") as HTMLDivElement
		);

		service.nearbySearch(request, (results, status) => {
			if (status === google.maps.places.PlacesServiceStatus.OK && results) {
				setGoogleResults(results);
				$place.setSearchResults(results);
			} else {
				console.error("Error:", status);
			}
		});
	};

	/**
	 * @description 지도 중심 변경 시 호출됩니다.
	 * @param {kakao.maps.Map} map - 변경된 지도 객체
	 */
	const onCenterChanged = (map: kakao.maps.Map) => {
		$place.setcenterChanged(true);
		setChangedLocation({
			lat: map.getCenter().getLat(),
			lng: map.getCenter().getLng(),
		});
	};

	/**
	 * @description 장소 선택 시 호출됩니다.
	 * @param {google.maps.places.PlaceResult} place - 선택된 장소
	 */
	const onSelectPlace = (place: google.maps.places.PlaceResult) => {
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
					{googleResults?.map((result, idx) => (
						<MapMarker
							key={idx}
							position={{
								lat: result.geometry?.location?.lat()!,
								lng: result.geometry?.location?.lng()!,
							}}
							image={{
								src: "/images/marker_white.png",
								size: { width: 25, height: 25 },
								options: { offset: { x: 12.5, y: 12.5 } },
							}}
						/>
					))}
					{googleResults?.map((result, idx) => (
						<CustomOverlayMap
							key={result.place_id}
							position={{
								lat: result.geometry?.location?.lat()!,
								lng: result.geometry?.location?.lng()!,
							}}
							yAnchor={0}
							xAnchor={0}
						>
							<div
								onClick={() => onSelectPlace(result)}
								className={`bg-black bg-opacity-100 relative z-10 ${selectedPlace && selectedPlace.place_id !== result.place_id && "bg-opacity-50 -z-10"
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
