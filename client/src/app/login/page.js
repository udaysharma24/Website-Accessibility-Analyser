"use client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Poppins } from "next/font/google"
import GoogleLoginButton from "@/components/GoogleLoginButton"

const poppins= Poppins({
    subsets: ['latin'],
    weight: ['400']
})

export default function Login(){
    const router= useRouter()
    const [email, setemail]= useState("")
    const [password, setpassword]= useState("")
    async function handleclick(e){
        e.preventDefault()
        const response= await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`,
            {
                method: 'POST',
                headers: {'Content-type': 'application/json'},
                body: JSON.stringify({email, password})
            }
        )
        const data= await response.json()
        console.log(data)
        alert(data.message)
        if(response.ok)
            router.push("/url_input")
    }
    function guestdirect(e){
        e.preventDefault()
        router.push("/url_input")
    }
    function handleregister(){
        router.push("/register")
    }
    return(
        <div className="flex h-[100%]">
            <div className={`${poppins.className} w-[50%]`}>
                <img className="h-[15%] ml-[3%] mt-[3%]" src="/IAlogo.png" alt="logo"/>
                <h1 className="text-3xl text-black font-bold mx-[25%] mt-[3%]">Welcome Back!</h1>
                <p className="text-xl text-gray-400 mx-[25%]">Please enter your details</p>
                <br/>
                <p className="text-l text-black ml-[25%]">Email Address</p>
                <input type="email" onChange={(e)=>{setemail(e.target.value)}} name="email" className="border-1 border-solid w-[50%] ml-[25%] mb-[3%] px-[3%] py-[1.5%] rounded-lg"/>
                <p className="text-l text-black ml-[25%]">Password</p>
                <input type="password" onChange={(e)=>{setpassword(e.target.value)}} name="password" className="border-1 border-solid w-[50%] ml-[25%] mb-[3%] px-[3%] py-[1.5%] rounded-lg"/>
                <br/>
                <button className="text-xxl mx-[25%] bg-gray-200 border-2 text-gray-900 w-[50%] py-[1.5%] rounded-lg cursor-pointer" onClick={guestdirect}>Continue as Guest</button>
                <br/>
                <br/>
                <button onClick={handleclick} className="text-white text-xxl mx-[25%] bg-blue-500 w-[50%] py-[1.5%] rounded-lg cursor-pointer">Sign In</button>
                <br/>
                <br/>
                <button className="text-white text-xxl mx-[25%] bg-emerald-500 w-[50%] py-[1.5%] rounded-lg cursor-pointer" onClick={handleregister}>No Account?, Create One</button>
                <br/>
                <br/>
                <GoogleLoginButton/>
            </div>
            <div className="w-[58%] overflow-y-hidden scrollbar-hidden">
                <img className="" src="/Data_security_01.jpg" alt="image"/>
            </div>
        </div>
    )
}