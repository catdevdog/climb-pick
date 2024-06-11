import Script from 'next/script';
import { useEffect, useState } from 'react';
import { Map, MapMarker } from 'react-kakao-maps-sdk';
// TODO: Uncomment the following line to use the types
// import { PlacesSearchResult, Status, Pagination } from 'react-kakao-maps-sdk/types/places';

const KakaoMap: React.FC = () => {
  const [searchKeyword, setSearchKeyword] = useState('클라이밍');
  const [searchResults, setSearchResults] = useState<{ lat: number; lng: number; }[]>([]);

  const KAKAO_SDK_URL = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_API_KEY}&autoload=false&libraries=services`;

  const handleSearch = async () => {
    // const mapContainer = document.getElementById('map') as HTMLElement, // 지도를 표시할 div 
    //   mapOption = {
    //     center: new kakao.maps.LatLng(37.566826, 126.9786567), // 지도의 중심좌표
    //     level: 5 // 지도의 확대 레벨
    //   };
    // const map = new kakao.maps.Map(mapContainer, mapOption);
    const ps = new kakao.maps.services.Places();
    ps.keywordSearch(searchKeyword, placesSearchCB);
  }

  // 장소검색이 완료됐을 때 호출되는 콜백함수 입니다
  function placesSearchCB(
    result: any,
    status: any,
    pagination: any) {
    console.log(result, status, pagination);
    if (status === kakao.maps.services.Status.OK) {
      setSearchResults(result.map((place: { y: number; x: number; }) => ({
        lat: place.y,
        lng: place.x,
      })));
    }
  }

  return (
    <>
      <Script src={KAKAO_SDK_URL} strategy="beforeInteractive" />

      <input type="text" value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} />
      <button className='text-white' onClick={handleSearch}>Search</button>
      <Map id="map" center={{ lat: 37.566826, lng: 126.9786567 }} level={9} style={{ width: '100%', height: '100%' }}>
        {searchResults.map((result, idx) => (
          <MapMarker key={idx} position={{ lat: result.lat, lng: result.lng }} />
        ))}
      </Map>
    </>
  );
};

export default KakaoMap