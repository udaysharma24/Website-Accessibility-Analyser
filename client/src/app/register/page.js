"use client"
import { useState } from "react"
import { Poppins } from "next/font/google"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400"],
})

export default function Register() {
  const [username, setusername] = useState("")
  const [email, setemail] = useState("")
  const [password, setpassword] = useState("")

  async function handleclick(e) {
    e.preventDefault()
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/register`,
      {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      }
    )
    const data = await response.json()
    alert(data.message)
    console.log(data)
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
          Register
        </h1>
        <p className="text-gray-500 text-base sm:text-lg mb-6 text-center md:text-left">
          Please enter your details
        </p>

        <label className="w-full md:w-3/4 text-sm sm:text-base font-medium text-black mb-1">
          Name
        </label>
        <input
          type="text"
          name="username"
          onChange={(e) => setusername(e.target.value)}
          className="w-full md:w-3/4 border border-gray-300 px-3 py-2 rounded-lg mb-4 text-sm sm:text-base"
        />

        <label className="w-full md:w-3/4 text-sm sm:text-base font-medium text-black mb-1">
          Email Address
        </label>
        <input
          type="email"
          name="email"
          onChange={(e) => setemail(e.target.value)}
          className="w-full md:w-3/4 border border-gray-300 px-3 py-2 rounded-lg mb-4 text-sm sm:text-base"
        />

        <label className="w-full md:w-3/4 text-sm sm:text-base font-medium text-black mb-1">
          Password
        </label>
        <input
          type="password"
          name="password"
          onChange={(e) => setpassword(e.target.value)}
          className="w-full md:w-3/4 border border-gray-300 px-3 py-2 rounded-lg mb-6 text-sm sm:text-base"
        />

        <button
          onClick={handleclick}
          className="w-full md:w-3/4 bg-blue-500 text-white py-2 rounded-lg text-sm sm:text-base hover:bg-blue-600 transition"
        >
          Sign In
        </button>
      </div>

      <div className="hidden md:flex w-full md:w-1/2 items-center justify-center overflow-hidden">
        <img
          className="object-cover h-full w-full"
          src="/register_page.jpg"
          alt="image"
        />
      </div>
    </div>
  )
}
