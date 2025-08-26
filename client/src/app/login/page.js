"use client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Poppins } from "next/font/google"
import GoogleLoginButton from "@/components/GoogleLoginButton"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400"],
})

export default function Login() {
  const router = useRouter()
  const [email, setemail] = useState("")
  const [password, setpassword] = useState("")

  async function handleclick(e) {
    e.preventDefault()
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/login`,
      {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      }
    )
    const data = await response.json()
    console.log(data)
    alert(data.message)
    if (response.ok) router.push("/url_input")
  }

  function guestdirect(e) {
    e.preventDefault()
    router.push("/url_input")
  }

  function handleregister() {
    router.push("/register")
  }

  return (
    <div className={`flex flex-col md:flex-row min-h-screen ${poppins.className}`}>
      <div className="w-full md:w-1/2 flex flex-col items-center md:items-start px-6 sm:px-10 md:px-16 lg:px-24 py-6">
        <img
          className="h-12 sm:h-14 md:h-16 mb-6 self-start"
          src="/IAlogo.png"
          alt="logo"
        />

        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black mb-2 text-center md:text-left">
          Welcome Back!
        </h1>
        <p className="text-gray-500 text-base sm:text-lg mb-6 text-center md:text-left">
          Please enter your details
        </p>

        <label className="w-full md:w-3/4 text-sm sm:text-base font-medium text-black mb-1">
          Email Address
        </label>
        <input
          type="email"
          onChange={(e) => setemail(e.target.value)}
          name="email"
          className="w-full md:w-3/4 border border-gray-300 px-3 py-2 rounded-lg mb-4 text-sm sm:text-base"
        />

        <label className="w-full md:w-3/4 text-sm sm:text-base font-medium text-black mb-1">
          Password
        </label>
        <input
          type="password"
          onChange={(e) => setpassword(e.target.value)}
          name="password"
          className="w-full md:w-3/4 border border-gray-300 px-3 py-2 rounded-lg mb-6 text-sm sm:text-base"
        />

        <button
          className="w-full md:w-3/4 bg-gray-200 border border-gray-400 text-gray-900 py-2 rounded-lg mb-4 text-sm sm:text-base hover:bg-gray-300 transition"
          onClick={guestdirect}
        >
          Continue as Guest
        </button>

        <button
          onClick={handleclick}
          className="w-full md:w-3/4 bg-blue-500 text-white py-2 rounded-lg mb-4 text-sm sm:text-base hover:bg-blue-600 transition"
        >
          Sign In
        </button>

        <button
          className="w-full md:w-3/4 bg-emerald-500 text-white py-2 rounded-lg mb-6 text-sm sm:text-base hover:bg-emerald-600 transition"
          onClick={handleregister}
        >
          No Account? Create One
        </button>

        <div className="w-full md:w-3/4">
          <GoogleLoginButton />
        </div>
      </div>

      {/* Right side (image) */}
      <div className="hidden md:flex w-full md:w-1/2 items-center justify-center overflow-hidden">
        <img
          className="object-cover h-full w-full"
          src="/Data_security_01.jpg"
          alt="image"
        />
      </div>
    </div>
  )
}
