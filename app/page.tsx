"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import { use, useEffect } from "react";

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    router.prefetch("/map");
  }, []);
  return (
    <>
      <div className="p-5 h-full">
        <div className="flex h-full flex-wrap flex-col gap-5 justify-center items-center">
          {/* <Link
            href="/"
            className="max-w-52 max-h-52 border-red-400 border-2 rounded-lg rou overflow-hidden relative shadow-xl shadow-gray-400"
          >
            <img src="/images/location_2.jpg" alt="Location 2" />
            <p className="absolute text-gray-700 top-5 left-1/2 -translate-x-1/2">
              친구와 나 사이
            </p>
          </Link> */}
          <Link
            href="/map"
            className="max-w-52 max-h-52 rounded-3xl overflow-hidden relative shadow-xl shadow-black-500 bg-[#292929] bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500"
          >
            {/* <img src="/images/location_1.jpg" alt="Location 1" /> */}
            <img src="/images/3d/pin.svg" alt="Location 1" />
            <p className="absolute text-gray-700 bottom-5 left-1/2 -translate-x-1/2">
              {/* 내 주변 */}
            </p>
          </Link>
        </div>
      </div>
      <Button
        color="black"
        size="medium"
        className="fixed z-10 right-5 bottom-5"
        onClick={() => {
          router.push("/data");
        }}
      >
        admin
      </Button>
    </>
  );
}
