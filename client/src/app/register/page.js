"use client"
import { useState } from "react"
import { Poppins } from "next/font/google"

const poppins= Poppins({
    subsets: ['latin'],
    weight: ['400']
})

export default function Register(){
    const [username, setusername]= useState("")
    const [email, setemail]= useState("")
    const [password, setpassword]= useState("")
    async function handleclick(e){
        e.preventDefault()
        const response= await fetch("http://localhost:3001/Register", 
            {
                method: 'POST',
                headers: {"Content-type":"application/json"},
                body: JSON.stringify({username, email, password})
            }
        )
        const data= await response.json()
        alert(data.message)
        console.log(data)
    }
    return(
        <div className="flex h-[100%]">
            <div className={`${poppins.className} w-[50%]`}>
                <img className="h-[15%] ml-[3%] mt-[3%]" src="/IAlogo.png" alt="logo"/>
                <h1 className="text-3xl text-black font-bold mx-[25%] mt-[4%]">Register</h1>
                <p className="text-xl text-gray-400 mx-[25%]">Please enter your details</p>
                <br/>
                <p className="text-l text-black ml-[25%]">Name</p>
                <input type="text" name="username" onChange={(e)=>{setusername(e.target.value)}} className="border-1 border-solid w-[50%] ml-[25%] mb-[3%] px-[3%] py-[1.5%] rounded-lg"/>
                <p className="text-l text-black ml-[25%]">Email Address</p>
                <input type="email" name="email" onChange={(e)=>{setemail(e.target.value)}} className="border-1 border-solid w-[50%] ml-[25%] mb-[3%] px-[3%] py-[1.5%] rounded-lg"/>
                <p className="text-l text-black ml-[25%]">Password</p>
                <input type="password" onChange={(e)=>{setpassword(e.target.value)}} name="password" className="border-1 border-solid w-[50%] ml-[25%] mb-[3%] px-[3%] py-[1.5%] rounded-lg"/>
                <br/>
                <div className="flex items-center ml-[25%]">
                    <input id="link-checkbox" type="checkbox" value="" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 cursor-pointer"/>
                    <label htmlFor="link-checkbox" className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">Remember for 30 days</label>
                </div>
                <br/>
                <button onClick={handleclick} className="text-white text-xxl mx-[25%] bg-blue-500 w-[50%] py-[1.5%] rounded-lg cursor-pointer">Sign In</button>
            </div>
            <div className="w-[58%] overflow-y-hidden scrollbar-hidden">
                <img className="" src="/register_page.jpg" alt="image"/>
            </div>
        </div>
    )
}