"use client"

export default function GoogleLoginButton(){
    return(
        <button onClick={() => window.location.href = "http://localhost:3001/auth/google"}className="border px-14 py-2 ml-36 rounded-lg shadow flex items-center gap-2 cursor-pointer bg-black text-white">
            <img src="/google-icon.png" alt="Google" className="w-5 h-5" />
            Sign in with Google
        </button>
    )
}