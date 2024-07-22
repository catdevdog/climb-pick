"use client";
import Link from "next/link";

export default function Home() {
    return (
        <div className="p-5 h-full">
            <div className="flex h-full flex-wrap flex-col gap-5 justify-center items-center">
                <Link href="/" className="max-w-52 max-h-52 border-red-400 border-2 rounded-lg rou overflow-hidden relative shadow-xl shadow-gray-400">
                    <img src="/images/location_2.jpg" alt="Location 2" />
                    <p className="absolute text-gray-700 top-5 left-1/2 -translate-x-1/2">친구와 나 사이</p>
                </Link>
                <Link href="/map" className="max-w-52 max-h-52 border-blue-400 border-2 rounded-lg overflow-hidden relative shadow-xl shadow-gray-400">
                    <img src="/images/location_1.jpg" alt="Location 1" />
                    <p className="absolute text-gray-700 top-5 left-1/2 -translate-x-1/2">내 주변</p>
                </Link>
            </div>
        </div>
    )
}