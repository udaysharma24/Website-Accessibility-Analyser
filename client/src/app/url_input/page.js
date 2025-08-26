"use client"
import { Suspense } from "react"
import VantaBirds from "@/components/VantaBirds"
import { useSearchParams } from 'next/navigation';

function UrlInputContent() {
    const searchParams = useSearchParams();
    const username = searchParams.get('username');
    return(
        <main className="">
            <VantaBirds username={username} />
        </main>
    )
}

export default function Url_input() {
    return (
        <Suspense>
            <UrlInputContent />
        </Suspense>
    )
}