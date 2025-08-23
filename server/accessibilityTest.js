import puppeteer from "puppeteer";
import fs from "fs"
import pkg from 'axe-core'
import path from "path";

export default async function accessibilityTest(website){
    const {source: axesource}= pkg
    const browser= await puppeteer.launch()
    const page= await browser.newPage()
    const start= Date.now()
    await page.goto(website, {waitUntil: "networkidle2", timeout: 100000})
    await page.evaluate((source)=>{eval(source)}, axesource)
    const results= await page.evaluate(async()=>{return await axe.run()})
    const end= Date.now()
    const scan_duration= end-start
    console.log(`Scan completed in ${scan_duration}ms`)
    console.log(`Violations found: ${results.violations.length}`)
    const reportpath= path.resolve("server", "accessibility_report.json")
    const dir= path.dirname(reportpath)
    if(!fs.existsSync(dir))
        fs.mkdirSync(dir, {recursive: true})
    fs.writeFileSync(reportpath, JSON.stringify(results, null, 4))
    await browser.close()
}