import { useEffect, useState } from "react";
import { Map, MapMarker, CustomOverlayMap } from "react-kakao-maps-sdk";
import useCurrentLocation from "@/hooks/useCurrentLocation";
import useStore from "@/store/store";
import useFirebase from '@/hooks/useFirebase';
import useAuth from '@/hooks/useAuth';
import type { TypePlace } from "@/types/place";

type KakaoMapProps = {
};

export default function KakaoMap({ }: KakaoMapProps) {
	const { $place } = useStore();
	const { user } = useAuth();
	const { dataSet, getPlaces, savePlaces } = useFirebase();
	const initLocation = useCurrentLocation();

	const [isKakaoLoaded, setIsKakaoLoaded] = useState(false);
	const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
	const [changedLocation, setChangedLocation] = useState<{ lat: number; lng: number } | null>(null);

	const [searchKeyword] = useState("클라이밍");
	const [places, setPlaces] = useState<TypePlace[]>([]);
	const [selectedPlace, setSelectedPlace] = useState<TypePlace>();

	// Kakao 지도 SDK가 로드되었는지 확인
	useEffect(() => {
		window.kakao.maps.load(() => setIsKakaoLoaded(true));
	}, []);

	// 초기 사용자 위치를 설정하고 Firebase에 데이터를 저장
	useEffect(() => {
		if (initLocation && user) {
			setUserLocation(initLocation);
			dataSet(user.uid, initLocation.lat, initLocation.lng);
		}
	}, [initLocation, user]);

	// 사용자 위치가 설정되면 장소 검색 수행
	useEffect(() => {
		if (isKakaoLoaded && userLocation) {
			searchPlaces(userLocation.lat, userLocation.lng);
		}
	}, [isKakaoLoaded, userLocation]);

	// 검색 요청에 따라 장소 검색 수행
	useEffect(() => {
		if ($place.searchRequest && changedLocation) {
			searchPlaces(changedLocation.lat, changedLocation.lng);
			$place.setSearchRequest(false);
		}
	}, [$place.searchRequest, changedLocation]);

	// 주어진 위치를 기준으로 장소 검색
	const searchPlaces = async (lat: number, lng: number) => {
		if (!window.google || !window.google.maps) return;

		// Firebase에서 장소를 검색
		const firebasePlaces = await getPlaces(lat, lng, $place.searchDistance / 1000);

		if (firebasePlaces.length > 0) {
			setPlaces(firebasePlaces);
			console.log("Firebase에서 검색 결과를 가져왔습니다.", firebasePlaces);
			$place.setSearchResults(firebasePlaces);
		} else {
			console.log("Firebase에서 검색 결과가 없습니다. Google api로 검색합니다.")
			// Firebase에 데이터가 없는 경우 Google Places API를 사용
			const service = new google.maps.places.PlacesService(
				document.getElementById("search-map") as HTMLDivElement
			);

			const request = {
				location: new google.maps.LatLng(lat, lng),
				radius: $place.searchDistance,
				keyword: searchKeyword,
			};

			service.nearbySearch(request, (results, status) => {
				if (status === google.maps.places.PlacesServiceStatus.OK && results) {
					const typePlaces: TypePlace[] = results.map((result) => ({
						name: result.name || '',
						location: {
							lat: result.geometry?.location?.lat() ?? 0,
							lng: result.geometry?.location?.lng() ?? 0,
						},
						address: result.vicinity || '',
						types: result.types || [],
						rating: result.rating || 0,
						user_ratings_total: result.user_ratings_total || 0,
						lastUpdated: new Date().toLocaleString("ko-KR")
					}));

					setPlaces(typePlaces);
					$place.setSearchResults(typePlaces);
					savePlaces(results);
				} else {
					console.error("오류 발생:", status);
				}
			});
		}
	};

	// 지도 중심이 변경되었을 때의 핸들러
	const onCenterChanged = (map: kakao.maps.Map) => {
		$place.setcenterChanged(true);
		setChangedLocation({
			lat: map.getCenter().getLat(),
			lng: map.getCenter().getLng(),
		});
	};

	// 장소 선택 시의 핸들러
	const onSelectPlace = (place: TypePlace) => {
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
					{places.map((place, idx) => (
						<MapMarker
							key={`${idx}_${place.name}`}
							position={{
								lat: place.location.lat,
								lng: place.location.lng,
							}}
							image={{
								src: "/images/marker_white.png",
								size: { width: 25, height: 25 },
								options: { offset: { x: 12.5, y: 12.5 } },
							}}
						/>
					))}
					{places.map((place, idx) => (
						<CustomOverlayMap
							key={`${place.name}_${idx}`}
							position={{
								lat: place.location.lat,
								lng: place.location.lng,
							}}
							yAnchor={0}
							xAnchor={0}
						>
							<div
								onClick={() => onSelectPlace(place)}
								className={`bg-black bg-opacity-100 relative z-10 ${selectedPlace && selectedPlace.name !== place.name && "bg-opacity-50 -z-10"
									} text-white p-1 px-2 rounded-lg rounded-tl-none`}
							>
								<p className="">{place.name}</p>
							</div>
						</CustomOverlayMap>
					))}
				</Map>
			)}
		</>
	);
}
