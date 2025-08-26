"use client"
import { Suspense } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, elements } from "chart.js";
import { Poppins } from "next/font/google";
import { Lightbulb, AlertTriangle, Sparkles, LogOutIcon } from "lucide-react";
import { useSearchParams } from 'next/navigation';

const poppins = Poppins({
    subsets: ['latin'],
    weight: ['400']
});

ChartJS.register(ArcElement, Tooltip, Legend);

function AnalyticsContent() {
    let count = 0;
    const [critical, setcritical] = useState(0);
    const [serious, setserious] = useState(0);
    const [moderate, setmoderate] = useState(0);
    const [minor, setminor] = useState(0);
    const chartdata = {
        labels: ['Critical', 'Serious', 'Moderate', 'Minor'],
        datasets: [
            {
                data: [critical, serious, moderate, minor],
                backgroundColor: ['#FF4E42', '#FFA400', '#FFFF2E', '#0CCE6B'],
                borderWidth: 1
            }
        ]
    };
    const chartoptions = {
        cutout: '37%',
        elements: { arc: { radius: '20%' } },
        responsive: true,
        plugins: {
            legend: { position: 'bottom' }
        }
    };
    const [audit, setaudit] = useState(null);
    const [loading, setloading] = useState(true);
    const [score, setscore] = useState(0);
    const [fixesdata, setfixesdata] = useState(null);
    const scanstarted = useRef(false);
    const searchParams = useSearchParams();
    const [url, seturl] = useState("");
    const [audit_id, setaudit_id] = useState(0)

    async function handlelogout() {
        await fetch("/logout", { method: "POST" });
        window.location.href = "/login";
    }

    useEffect(() => {
        async function fullAuditFlow() {
            let prev1 = 0;
            let prev2 = 0;
            let prev3 = 0;
            let prev4 = 0;
            const urlParam = searchParams.get('url');
            console.log(`urlParam is ${urlParam}`)
            seturl(urlParam);
            const audit_id_param= searchParams.get('audit_id')
            console.log(`audit_id_param is ${audit_id_param}`)
            setaudit_id(audit_id_param)
            const savedurl = sessionStorage.getItem("auditurl");
            const savedScore = sessionStorage.getItem("auditScore");
            const savedCounts = sessionStorage.getItem("auditCounts");
            const savedAudit = sessionStorage.getItem("auditTable");
            const savedFixes = sessionStorage.getItem("auditFixes");
            if (savedScore && savedCounts) {
                setscore(Number(savedScore));
                const counts = JSON.parse(savedCounts);
                setcritical(counts.critical);
                setserious(counts.serious);
                setmoderate(counts.moderate);
                setminor(counts.minor);
                setaudit(JSON.parse(savedAudit));
                setfixesdata(JSON.parse(savedFixes));
                setloading(false);
                return;
            }
            if (scanstarted.current)
                return;
            scanstarted.current = true;
            setloading(true);
            // Pass url as query param for GET
            const response1 = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/analytics_back?url=${encodeURIComponent(urlParam)}`, {
                method: "GET",
                credentials: "include"
            });
            const data1 = await response1.json();
            console.log(data1);
            const report = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/analytics`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({url: urlParam, audit_id: audit_id_param}),
                credentials: "include"
            });
            const reportRes = await report.json();
            console.log(reportRes);
            const response2 = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/analytics_data`, { credentials: "include" });
            const data2 = await response2.json();
            console.log(data2.audit);
            console.log(data2.fixes);
            setaudit(data2.audit);
            setfixesdata(data2.fixes);
            let penalty = 0;
            setcritical(0);
            setserious(0);
            setmoderate(0);
            setminor(0);
            data2.audit.forEach(v => {
                if (v.severity == "critical") {
                    penalty += 4;
                    prev1++;
                }
                else if (v.severity == "serious") {
                    penalty += 3;
                    prev2++;
                }
                else if (v.severity == "moderate") {
                    penalty += 2;
                    prev3++;
                }
                else if (v.severity == "minor") {
                    penalty++;
                    prev4++;
                }
            });
            setcritical(prev1);
            setserious(prev2);
            setmoderate(prev3);
            setminor(prev4);
            let ans = Math.max(1, (100 - penalty));
            setscore(ans);
            sessionStorage.setItem("auditurl", data1.url);
            sessionStorage.setItem("auditScore", ans);
            sessionStorage.setItem("auditCounts", JSON.stringify({
                critical: prev1,
                serious: prev2,
                moderate: prev3,
                minor: prev4
            }));
            sessionStorage.setItem("auditTable", JSON.stringify(data2.audit));
            sessionStorage.setItem("auditFixes", JSON.stringify(data2.fixes));
            setloading(false);
        }
        fullAuditFlow();
    }, [scanstarted, searchParams]);

    const textcolor = useMemo(() => {
        if (score >= 90)
            return 'green-500';
        else if (score >= 50)
            return 'yellow-500';
        else
            return 'red-500';
    }, [score]);
    const ringcolor = useMemo(() => {
        if (score >= 90)
            return '#0CCE6B';
        else if (score >= 50)
            return '#FFA400';
        else
            return '#FF4E42';
    }, [score]);

    return (
        <div className="relative w-full">
            <div id="report" className={`${poppins.className} min-h-screen relative print:block mb-4`}>
                <img className="h-30" src="/IAlogo.png" alt="logo" />
                <button onClick={handlelogout} className="absolute top-12 right-10 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white  rounded-lg hover:bg-blue-700 cursor-pointer print:hidden">
                    <LogOutIcon className="w-5 h-5" />
                    Logout
                </button>
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-50">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-solid"></div>
                        <p className="mt-2 text-gray-700 font-medium text-center text-lg">
                            ⏳ This usually takes 10–15 seconds...
                        </p>
                    </div>
                )}
                <div className="bg-gray-100 p-4">
                    <br />
                    <div className="flex flex-wrap items-center justify-center gap-2 mb-6 border-b border-gray-300 pb-2">
                        <span className="text-3xl font-bold">Accessibility Analytics of - </span>
                        <a href={url} target="_blank" rel="noopener noreferrer" className="text-3xl font-bold text-blue-800 hover:underline">{url}</a>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                        <div className="bg-white p-6 rounded-xl shadow-md flex flex-col items-center justify-center">
                            <h2 className="text-lg font-semibold mb-4">Accessibility Score</h2>
                            <div className="relative flex items-center justify-center h-64 w-64 rounded-full shadow-lg" style={{ background: `conic-gradient(${ringcolor} ${score}%, #e5e7eb 0)` }}>
                                <div className="flex flex-col items-center justify-center w-32 h-32 rounded-full bg-white">
                                    <p className={`text-4xl font-extrabold text-${textcolor}`}>
                                        {score}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-md flex flex-col items-center justify-center">
                            <h2 className="text-lg font-semibold mb-4">Violation Breakdown</h2>
                            <div className="relative h-84 w-84">
                                <Doughnut data={chartdata} options={{ ...chartoptions, maintainAspectRatio: false }} />
                            </div>
                        </div>
                    </div>
                    <br />
                    <table className="max-w-screen-xl border text-sm border-gray-300 rounded-lg shadow-md">
                        <thead className="bg-gray-100 sticky top-0 print:static">
                            <tr>
                                <th className="px-4 py-2 border">Serial No.</th>
                                <th className="px-4 py-2 border">WCAG Rule</th>
                                <th className="px-4 py-2 border">Severity</th>
                                <th className="px-4 py-2 border">Violation Type</th>
                                <th className="px-4 py-2 border">HTML Snippet</th>
                                <th className="px-4 py-2 border">CSS Target</th>
                                <th className="px-4 py-2 border">Failure Summary</th>
                                <th className="px-4 py-2 border">Help URL</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-300">
                            {audit?.map((result) => {
                                return (
                                    <tr key={result.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-2 border text-center">{++count}</td>
                                        <td className="px-4 py-2 border text-center">{result.wcag_rule}</td>
                                        <td className="px-4 py-2 border text-center">{result.severity}</td>
                                        <td className="px-4 py-2 border text-center">{result.description}</td>
                                        <td className="px-4 py-2 border font-mono text-sm max-w-xs break-words">
                                            <code>
                                                {result.html_snippet}
                                            </code>
                                        </td>
                                        <td className="px-4 py-2 border text-sm">{result.css_target}</td>
                                        <td className="px-4 py-2 border text-sm max-w-lg break-words">{result.failure_summary}</td>
                                        <td className="px-4 py-2 border text-blue-600 hover:underline">
                                            <a href={result.help_url} target="_blank" rel="noopener noreferrer">View Help!</a>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                    <br />
                    <br />
                    <div className="w-full flex flex-col items-center">
                        <h1 className="text-4xl font-bold text-blue-900 flex items-center gap-2">
                            <Sparkles className="text-violet-600 animate-pulse">
                                AI-Powered Smart Fixes
                            </Sparkles>
                        </h1>
                        <p className="text-gray-600 mt-2">✨ Intelligent recommendations generated just for you</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 w-11/12">
                            {fixesdata?.map((f, index) => (
                                <div key={index} className="bg-white border border-gray-200 shadow-xl  rounded-2xl p-6 relative hover:shadow-2xl hover:border-blue-400 transition-all duration-300">
                                    <span className="absolute -top-3 left-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 text-xs rounded-full shadow">
                                        AI Suggested Fix
                                    </span>
                                    <div className="flex items-center gap-2 mb-3">
                                        <AlertTriangle className="text-red-500" />
                                        <h2 className="text-lg font-semibold text-gray-800">Issue</h2>
                                    </div>
                                    <p className="text-gray-600 mb-4">{f.issue}</p>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Lightbulb className="text-green-500" />
                                        <h2 className="text-lg font-semibold text-gray-800">Smart Fix</h2>
                                    </div>
                                    <p className="text-gray-700 whitespace-pre-line leading-relaxed">{f.fix}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <br />
                <br />
                <br />
            </div>
            <button onClick={() => { window.print() }} className="absolute mt-4 px-4 py-2 bottom-4 right-5 bg-slate-500 cursor-pointer text-white rounded hover:bg-slate-600 print:hidden">Print Report</button>
        </div>
    );
}

export default function Analytics() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AnalyticsContent />
        </Suspense>
    );
}