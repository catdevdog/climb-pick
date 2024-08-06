import useStore from "../store/store";
import Image from "next/image";

export default function Detail() {
  const { $place } = useStore();
  const detailPlace = $place.mostNearPlace.data;
  const distance = $place.mostNearPlace.distance;

  const openMap = () => {
    $place.setOpenMap(true);
    $place.setMoveTrigger(true);
    if (detailPlace) {
      $place.setSelectedDetailPlace(detailPlace);
    }
  };

  const defualtStyle =
    "fixed z-30 left-1/2 -translate-x-1/2 w-96 p-4 bg-white rounded-lg flex overflow-hidden duration-[1s] text-left shadow-lg";
  const close = "top-1/2 -translate-y-full";
  const open = "glass top-5";

  return (
    <>
      {detailPlace && (
        <button
          onClick={openMap}
          className={`${defualtStyle} ${$place.openMap ? open : close}`}
        >
          <Image
            width={160}
            height={160}
            src="/images/3d/pin.svg"
            alt="Location 1"
            className={`absolute -right-10 top-1/2 -translate-y-1/2 rotate-12 duration-[1s]`}
          />
          <div className="flex flex-col w-full h-full relative z-10 text-black">
            <h1 className="text-md font-bold mb-1">
              가장 가까운 곳 바로가기
              <span className="text-xs text-stone-600 ml-2 font-normal">
                약 {distance.toFixed(1)}km
              </span>
            </h1>
            <h2 className="text-xl font-bold">{detailPlace.name}</h2>
            <p className="text-xs text-stone-600 mt-2">{detailPlace.address}</p>
          </div>
        </button>
      )}
    </>
  );
}
