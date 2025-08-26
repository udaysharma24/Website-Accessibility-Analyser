"use client"

export default function GoogleLoginButton() {
    return (
        <button onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`} className="w-full sm:w-auto border px-6 sm:px-14 py-2 sm:ml-36 rounded-lg shadow flex items-center justify-center sm:justify-start gap-2 cursor-pointer bg-black text-white">
            <img src="/google-icon.png" alt="Google" className="w-5 h-5" />
            <span className="text-sm sm:text-base">Sign in with Google</span>
        </button>
    )
}
