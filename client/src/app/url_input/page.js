"use client"
import { useEffect, useState } from "react"
import VantaBirds from "@/components/VantaBirds"
import { useSearchParams } from 'next/navigation';

export default function Url_input(){
    const searchParams = useSearchParams();
    const username = searchParams.get('username');
    return(
        <main className="">
            <VantaBirds username={username} />
        </main>
    )
}