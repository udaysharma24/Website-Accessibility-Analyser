"use client"
import { useRouter } from "next/navigation";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400"],
});

export default function Home() {
  const router = useRouter();

  function handleclick() {
    router.push("/login");
  }

  return (
    <div
      className={`relative bg-[url('/analytics-bg.jpg')] min-h-screen bg-cover bg-center flex flex-col ${poppins.className}`}
    >
      <div className="absolute top-4 left-4">
        <img
          className="h-12 sm:h-16 md:h-20 lg:h-24 xl:h-28 w-auto"
          src="/IAlogo_dark.png"
          alt="logo"
        />
      </div>

      <div className="flex flex-col justify-center flex-1 px-4 sm:px-8 md:px-16 lg:px-24">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl text-amber-600 drop-shadow-[0_0_2px_black] leading-snug">
          Build inclusive websites effortlessly —
        </h1>
        <h1 className="text-base sm:text-lg md:text-2xl lg:text-3xl text-white mt-3 drop-shadow-[0_0_2px_black] max-w-4xl">
          Analyze, identify issues, and get developer-friendly solutions in one
          click.
        </h1>

        <button
          className="bg-violet-800 hover:bg-violet-950 px-4 py-2 sm:px-6 sm:py-3 md:px-8 md:py-3 mt-6 sm:mt-8 md:mt-10 w-fit rounded-xl cursor-pointer border-2 border-white text-white text-sm sm:text-base md:text-md drop-shadow-[0_0_3px_white]"
          onClick={handleclick}
        >
          Get Started
        </button>
      </div>
    </div>
  );
}
