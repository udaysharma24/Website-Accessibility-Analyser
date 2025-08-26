"use client"

export default function GoogleLoginButton() {
    return (
        <button onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`} className="w-full md:w-3/4 py-2 rounded-lg mb-4 text-sm sm:text-base hover:bg-blue-600 transition bg-black text-white">
            <img src="/google-icon.png" alt="Google" className="w-5 h-5" />
            <span className="text-sm sm:text-base">Sign in with Google</span>
        </button>
    )
}
