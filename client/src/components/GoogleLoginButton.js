"use client"

export default function GoogleLoginButton() {
  return (
    <button onClick={()=>(window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`)} className="w-full sm:w-auto border px-6 md:px-10 lg:px-14 py-2 rounded-lg shadow flex items-center justify-center gap-2 cursor-pointer bg-black text-white hover:bg-gray-900 transition">
      <img src="/google-icon.png" alt="Google" className="w-5 h-5" />
      <span className="text-sm md:text-base lg:text-lg font-medium">
        Sign in with Google
      </span>
    </button>
  )
}
