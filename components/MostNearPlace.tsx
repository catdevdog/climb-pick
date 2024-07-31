
import useStore from "../store/store";
import Image from "next/image";

export default function Detail() {

    const { $place } = useStore();
    const detailPlace = $place.mostNearPlace.data;
    const distance = $place.mostNearPlace.distance;

    const openMap = () => {
        $place.setOpenMap(true);
    }

    const defualtStyle = "fixed z-20 left-1/2 -translate-x-1/2 w-96 p-4 bg-[#fff] rounded-lg flex overflow-hidden drop-shadow-md duration-[1s] text-left"
    const close = "top-1/2 -translate-y-1/2"
    const open = "top-5"

    return (<>
        {detailPlace && (
            <button onClick={openMap} className={`${defualtStyle} ${$place.openMap ? open:close}`}>

                <Image width={200} height={200} src="/images/3d/pin.svg" alt="Location 1" className="absolute -right-10 rotate-12 -top-10 blur-sm" />
                <div className="flex flex-col w-full h-full relative z-10 text-black">
                    <h1 className="text-xl font-bold mb-1">
                        가장 가까운 클라이밍장
                    </h1>
                    <h2 className="text-md font-bold">
                        {detailPlace.name}
                    </h2>
                    <p className="text-xs text-gray-500 mt-2">
                        {detailPlace.address}
                        <span className="text-xs text-gray-500 ml-2 font-normal">
                            - 약 {distance.toFixed(1)}km
                        </span>
                    </p>
                </div>
            </button>
        )}
    </>);
}