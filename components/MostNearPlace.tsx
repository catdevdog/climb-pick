
import useStore from "../store/store";

export default function Detail() {

    const { $place } = useStore();
    const detailPlace = $place.mostNearPlace.data;
    const distance = $place.mostNearPlace.distance;

    return (<>
        {detailPlace && (
            <div className="fixed z-10 left-1/2 top-5 -translate-x-1/2 w-80 p-2 bg-white rounded-md border-blue-400 border-2">
                <div className="flex flex-col w-full h-full">
                    <h1 className="text-lg font-bold mb-1">
                        가장 가까운 클라이밍장
                    </h1>
                    <h2 className="text-sm font-bold">
                        {detailPlace.name}
                        <span className="text-xs text-gray-500 ml-2 font-normal">
                            - 약 {distance.toFixed(1)}km
                        </span>
                    </h2>
                    <p className="text-xs text-gray-500 mt-2">
                        {detailPlace.address}
                    </p>
                </div>
            </div>
        )}
    </>);
}