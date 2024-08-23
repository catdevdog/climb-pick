import useStore from "../store/store";

export default function Detail() {
  const { $place } = useStore();
  const detailPlace = $place.detailPlace;

  return (
    <>
      {detailPlace && (
        <div className="fixed z-20 w-96 flex items-center left-1/2 right-5 -translate-x-1/2 bottom-20 p-2 bg-white rounded-md border-2 border-blue-500">
          <div className="flex flex-col w-full h-full">
            <h2 className="text-sm font-bold">{detailPlace.name}</h2>
            <p className="text-xs text-gray-500">{detailPlace.address}</p>
            <p className="text-xs text-gray-500">
              {detailPlace.rating}✨ / 5✨ ({detailPlace.user_ratings_total})
            </p>
          </div>
          {/* 카카오맵 바로가기 */}
          <a
            href={`https://map.kakao.com/link/to/${detailPlace.name},${detailPlace.location.lat},${detailPlace.location.lng}`}
            target="_blank"
            className="flex items-center justify-center w-10 h-10 rounded-full overflow-hidden"
          >
            <img
              src="/images/icons/kakaomap.png"
              alt="Location 1"
              className="max-w-[4.8rem] h-full"
            />
          </a>
        </div>
      )}
    </>
  );
}
