
import useStore from "../store/store";

export default function Detail() {

    const { $place } = useStore();
    const detailPlace = $place.detailPlace;

    return (<>
        {detailPlace && (
            <div className="fixed z-10 left-5 right-5 bottom-20 p-2 bg-white rounded-md">
                <div className="flex flex-col w-full h-full">
                    <h2 className="text-sm font-bold">
                        {detailPlace.name}
                    </h2>
                    <p className="text-xs text-gray-500">
                        {detailPlace.address}
                    </p>
                    <p className="text-xs text-gray-500">
                        {detailPlace.rating}✨ / 5✨
                    </p>
                    {/* <p className="text-sm text-gray-500">
                        {detailPlace.}
                    </p> */}
                </div>
            </div>
        )}
    </>);
}