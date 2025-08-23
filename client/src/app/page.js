"use client"
import { useRouter } from "next/navigation";
import { Poppins } from "next/font/google";

const poppins= Poppins({
    subsets: ['latin'],
    weight: ['400']
})

export default function Home() {
  const router= useRouter()

  function handleclick(){
    router.push("/login")
  }

  return (
    <div className={`bg-[url('/analytics-bg.jpg')] h-screen bg-cover bg-center ${poppins.className}`}>
        <img className="h-[20%] ml-[1%]" src="/IAlogo_dark.png" alt="logo"/>
        <h1 className=" text-amber-600 text-4xl pl-[10%] pt-[7%] drop-shadow-[0_0_2px_black]">Build inclusive websites effortlessly — </h1>
        <h1 className=" text-white text-4xl w-200 px-[10%] pt-[0.8%] drop-shadow-[0_0_2px_black] ">Analyze, identify issues, and get developer-friendly solutions in one click.</h1>
        <button className="bg-violet-800 hover:bg-violet-950 h-12 px-5 py-2 ml-32 mt-10 rounded-xl cursor-pointer border-2 border-white text-white drop-shadow-[0_0_3px_white]" onClick={handleclick}>Get Started</button>
    </div>
  );
}
