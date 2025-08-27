"use client"
import { Suspense } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
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
      const savedurl = sessionStorage.getItem("auditurl");
      const savedScore = sessionStorage.getItem("auditScore");
      const savedCounts = sessionStorage.getItem("auditCounts");
      const savedAudit = sessionStorage.getItem("auditTable");
      const savedFixes = sessionStorage.getItem("auditFixes");

      // Only use sessionStorage if the cached URL matches the current URL parameter.
      if (savedScore && savedCounts && savedurl === urlParam) {
        setscore(Number(savedScore));
        seturl(savedurl);
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
      if (scanstarted.current) return;
      scanstarted.current = true;
      setloading(true);
      console.log(`urlParam is ${urlParam}`)
      seturl(urlParam);
      const audit_id_param = searchParams.get('audit_id')
      console.log(`audit_id_param is ${audit_id_param}`)
      setaudit_id(audit_id_param)
      const response1 = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/analytics_back?url=${encodeURIComponent(urlParam)}`, {
        method: "GET",
        credentials: "include"
      });
      const data1= await response1.json();

      const report = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/analytics`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: urlParam, audit_id: audit_id_param }),
        credentials: "include"
      });
      const reportdata= await report.json();
      console.log(`Message from server.js is: ${reportdata.message}`)
      const response2 = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/analytics_data?url=${urlParam}&audit_id=${audit_id_param}&reportpath=${reportdata.reportpath}`, { credentials: "include" });
      const data2 = await response2.json();
      console.log(`data2 from /analytics_data is ${data2}`)
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
      sessionStorage.setItem("auditurl", urlParam);
      sessionStorage.setItem("auditScore", ans);
      sessionStorage.setItem("auditCounts", JSON.stringify({
        critical: prev1, serious: prev2, moderate: prev3, minor: prev4
      }));
      sessionStorage.setItem("auditTable", JSON.stringify(data2.audit));
      sessionStorage.setItem("auditFixes", JSON.stringify(data2.fixes));
      setloading(false);
    }
    fullAuditFlow();
  }, [scanstarted, searchParams]);

  const textcolor = useMemo(() => {
    if (score >= 90) return 'text-green-500';
    else if (score >= 50) return 'text-yellow-500';
    else return 'text-red-500';
  }, [score]);

  const ringcolor = useMemo(() => {
    if (score >= 90) return '#0CCE6B';
    else if (score >= 50) return '#FFA400';
    else return '#FF4E42';
  }, [score]);

  return (
    <div className="relative w-full">
      <div id="report" className={`${poppins.className} min-h-screen relative print:block mb-4`}>
        <div className="flex items-center justify-between px-4 sm:px-8 py-4">
          <img className="h-12 sm:h-16" src="/IAlogo.png" alt="logo" />
          <button
            onClick={handlelogout}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer print:hidden text-sm sm:text-base"
          >
            <LogOutIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            Logout
          </button>
        </div>

        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white bg-opacity-80 z-50 px-4">
            <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-t-4 border-blue-500 border-solid"></div>
            <p className="mt-3 text-gray-700 font-medium text-center text-base sm:text-lg">
              ⏳ This usually takes 10–15 seconds...
            </p>
          </div>
        )}

        <div className="bg-gray-100 p-4 sm:p-6 lg:p-8">
          <div className="flex flex-wrap items-center justify-center gap-2 mb-6 border-b border-gray-300 pb-2 text-center">
            <span className="text-2xl sm:text-3xl font-bold">Accessibility Analytics of - </span>
            <a href={url} target="_blank" rel="noopener noreferrer" className="text-2xl sm:text-3xl font-bold text-blue-800 hover:underline break-all">{url}</a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="bg-white p-6 rounded-xl shadow-md flex flex-col items-center justify-center">
              <h2 className="text-lg font-semibold mb-4">Accessibility Score</h2>
              <div className="relative flex items-center justify-center h-52 w-52 sm:h-64 sm:w-64 rounded-full shadow-lg" style={{ background: `conic-gradient(${ringcolor} ${score}%, #e5e7eb 0)` }}>
                <div className="flex flex-col items-center justify-center w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-white">
                  <p className={`text-3xl sm:text-4xl font-extrabold ${textcolor}`}>{score}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md flex flex-col items-center justify-center">
              <h2 className="text-lg font-semibold mb-4">Violation Breakdown</h2>
              <div className="relative h-64 w-64 sm:h-72 sm:w-72">
                <Doughnut data={chartdata} options={{ ...chartoptions, maintainAspectRatio: false }} />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto mt-8">
            <table className="w-full border text-xs sm:text-sm border-gray-300 rounded-lg shadow-md">
              <thead className="bg-gray-100 sticky top-0 print:static">
                <tr>
                  <th className="px-2 sm:px-4 py-2 border">S.No</th>
                  <th className="px-2 sm:px-4 py-2 border">WCAG Rule</th>
                  <th className="px-2 sm:px-4 py-2 border">Severity</th>
                  <th className="px-2 sm:px-4 py-2 border">Violation</th>
                  <th className="px-2 sm:px-4 py-2 border">HTML</th>
                  <th className="px-2 sm:px-4 py-2 border">CSS Target</th>
                  <th className="px-2 sm:px-4 py-2 border">Failure Summary</th>
                  <th className="px-2 sm:px-4 py-2 border">Help</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-300">
                {audit?.map((result) => (
                  <tr key={result.id} className="hover:bg-gray-50">
                    <td className="px-2 sm:px-4 py-2 border text-center">{++count}</td>
                    <td className="px-2 sm:px-4 py-2 border text-center">{result.wcag_rule}</td>
                    <td className="px-2 sm:px-4 py-2 border text-center">{result.severity}</td>
                    <td className="px-2 sm:px-4 py-2 border text-center">{result.description}</td>
                    <td className="px-2 sm:px-4 py-2 border font-mono text-xs sm:text-sm max-w-xs break-words">
                      <code>{result.html_snippet}</code>
                    </td>
                    <td className="px-2 sm:px-4 py-2 border text-xs">{result.css_target}</td>
                    <td className="px-2 sm:px-4 py-2 border text-xs max-w-lg break-words">{result.failure_summary}</td>
                    <td className="px-2 sm:px-4 py-2 border text-blue-600 hover:underline text-center">
                      <a href={result.help_url} target="_blank" rel="noopener noreferrer">View</a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="w-full flex flex-col items-center mt-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-blue-900 flex items-center gap-2 text-center">
              <Sparkles className="text-violet-600 animate-pulse" /> AI-Powered Smart Fixes
            </h1>
            <p className="text-gray-600 mt-2 text-sm sm:text-base text-center">✨ Intelligent recommendations generated just for you</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 w-full max-w-6xl px-4">
              {fixesdata?.map((f, index) => (
                <div key={index} className="bg-white border border-gray-200 shadow-xl rounded-2xl p-6 relative hover:shadow-2xl hover:border-blue-400 transition-all duration-300">
                  <span className="absolute -top-3 left-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 text-xs rounded-full shadow">
                    AI Suggested Fix
                  </span>
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="text-red-500" />
                    <h2 className="text-base sm:text-lg font-semibold text-gray-800">Issue</h2>
                  </div>
                  <p className="text-gray-600 mb-4 text-sm sm:text-base">{f.issue}</p>
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="text-green-500" />
                    <h2 className="text-base sm:text-lg font-semibold text-gray-800">Smart Fix</h2>
                  </div>
                  <p className="text-gray-700 whitespace-pre-line leading-relaxed text-sm sm:text-base">{f.fix}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={() => { window.print() }}
        className="fixed bottom-4 right-4 px-4 py-2 bg-slate-500 cursor-pointer text-white rounded hover:bg-slate-600 print:hidden text-sm sm:text-base"
      >
        Print Report
      </button>
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
