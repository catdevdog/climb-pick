import useStore from "../store/store";
import Image from "next/image";

export default function Detail() {
  const { $place } = useStore();

  const openMap = () => {
    $place.setOpenMap(true);
    $place.setMoveTrigger(true);
  };

  const defualtStyle =
    "fixed z-30 left-1/2 -translate-x-1/2 w-96 p-6 rounded-lg flex bg-white overflow-hidden duration-[1s] text-right shadow-lg mt-2";
  const close = "top-1/2";
  const open = "hidden";

  return (
    <>
        <button
          onClick={openMap}
          className={`${defualtStyle} ${$place.openMap ? open : close}`}
        >
          <Image
            width={160}
            height={160}
            src="/images/3d/search.svg"
            alt="Location 1"
            className={`absolute -top-1 -left-4 duration-[1s]`}
          />
          <div className="flex flex-col w-full h-full relative z-10 text-black">
            <h1 className="text-xl font-bold mb-1">지도에서 직접 찾기</h1>
            <h2 className="text-xs text-stone-400">서울, 경기 지역 약 250곳</h2>
          </div>
        </button>
    </>
  );
}
