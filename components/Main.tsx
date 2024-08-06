"use client";

import MostNearPlace from "@/components/MostNearPlace";
import GoToMap from "@/components/GoToMap";
import useStore from "@/store/store";
import { useEffect, useState } from "react";

export default function Home() {
    const { $place } = useStore();
    const [blurToggle, setBlurToggle] = useState(true);

    useEffect(() => {
        if ($place.openMap) {
            setTimeout(() => {
                setBlurToggle(false);
            }, 1 * 1000)
        }
    }, [$place.openMap]);

    const openedStyle = $place.openMap ? 'opacity-0' : 'opacity-100';

    return (
        <>
            {$place.mostNearPlace.data && <MostNearPlace />}
            {$place.mostNearPlace.data && <GoToMap />}
            {blurToggle &&
                <>
                    <div
                        className={`fixed z-20 top-0 left-0 right-0 bottom-0 backdrop-blur-[3px] duration-[1s] ${openedStyle}`}
                    />
                    <div className="fixed z-20 top-0 left-0 w-full h-full">
                        {/* <div className="flex h-full flex-wrap flex-col gap-5 justify-center items-center">
                        <Link
                            href="/map"
                            className="max-w-52 max-h-52 rounded-3xl overflow-hidden relative shadow-xl shadow-black-500 bg-[#292929] bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500"
                        >
                            <img src="/images/3d/pin.svg" alt="Location 1" />
                            <p className="absolute text-gray-700 bottom-5 left-1/2 -translate-x-1/2">
                            </p>
                        </Link>
                    </div> */}
                    </div>
                </>
            }
        </>
    );
}
