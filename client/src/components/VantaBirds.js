'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Poppins } from 'next/font/google';

const poppins= Poppins({
    subsets: ['latin'],
    weight: ['400']
})


export default function VantaBirds() {
  const vantaRef = useRef(null);
  const [vantaEffect, setVantaEffect] = useState(null);
  const [username, setusername]= useState("")
  const [url1, seturl1]= useState("")
  const router= useRouter()
  async function handleclick(e){
    e.preventDefault();
    console.log("URL state:", url1)
    console.log("Fetching:", `${process.env.NEXT_PUBLIC_API_URL}/url_input`);
    const response= await fetch(`${process.env.NEXT_PUBLIC_API_URL}/url_input`,
        {
            method: 'POST',
            credentials: 'include',
            headers: {'Content-type': 'application/json'},
            body: JSON.stringify({url: url1})
        }
    )
    const data= await response.json()
    console.log(`Vantabirds data is ${data}`)
    if(data.status_code==400)
      alert(data.message)
    else if(data.status_code==200)
      router.push(`/analytics?url=${url1}`)
  }

  useEffect(() => {
    let effect;
    async function handleusername(){
        const response= await fetch(`${process.env.NEXT_PUBLIC_API_URL}/urlinput`, {credentials: "include"})
        const data= await response.json()
        console.log(data)
        if(data==null || data.username==null || data.username==undefined)
          setusername("User")
        else
          setusername(data.username)
        console.log(username)
    }
    handleusername()
    const loadScripts = async () => {
    // Load THREE.js first
    const threeScript = document.createElement('script');
    threeScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js';
    threeScript.async = true;

    // Then load Vanta Birds after THREE is loaded
    threeScript.onload = () => {
      const vantaScript = document.createElement('script');
      vantaScript.src = 'https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.birds.min.js';
      vantaScript.async = true;

        vantaScript.onload = () => {
          if (!vantaEffect && window.VANTA && window.VANTA.BIRDS) {
            effect = window.VANTA.BIRDS({
              el: vantaRef.current,
              THREE: window.THREE,
              mouseControls: true,
              touchControls: true,
              minHeight: 200.0,
              minWidth: 200.0,
              scale: 1.0,
              scaleMobile: 1.0,
              backgroundColor: 0xa0d9ef,  
              color1: 0x000a0a,           
              color2: 0x00c8c8,       
              birdSize: 1.5,
              speedLimit: 1.0,
              separation: 50.0,
            });
            setVantaEffect(effect);
          }
        };

        document.body.appendChild(vantaScript);
      };

      document.body.appendChild(threeScript);
    };

    loadScripts();

    return () => {
      if (effect) effect.destroy();
    };
  }, []);

  return (
    <div
      ref={vantaRef}
      className="w-full h-screen flex items-center justify-center"
    >
      <div className={`max-w-2xl mx-auto mt-10 p-6 rounded-xl bg-gradient-to-r from-sky-300 to-sky-200 shadow-lg ${poppins.className}`}>
        <p className="text-gray-800 font-bold mb-4 text-3xl">Welcome! <span className='text-blue-600'>{username}</span>&#x1f64f;😀</p>
        <label htmlFor="url-input" className="text-lg text-gray-700 block mb-2">Please Enter Website URL: </label>
        <input type="url" id="url-input" name="website_url" placeholder="https://example.com" onChange={(e)=>{seturl1(e.target.value)}} className="shadow border rounded-lg w-full py-2 px-3 text-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400"/>
        <button type='button' className='cursor-pointer mt-4 font-semibold shadow-md transition-transform transform hover:scale-105 w-full py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600' onClick={handleclick}>Get Info</button>
      </div>
    </div>
  );
}
