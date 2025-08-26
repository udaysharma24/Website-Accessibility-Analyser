import fs from "fs"
import { GoogleGenAI } from "@google/genai";

const ai= new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY})

export default async function getaccess_fixes(reportpath){
    const report= fs.readFileSync(reportpath, "utf-8")
    let text="[]"
    try{
        const response= await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: `You are an accessibility expert. Given this report: ${report}\n Suggest Fixes for each Issue in JSON array format with keys: "issue" and "fix". Only return pure JSON.`,
            config: {
                thinkingConfig: {
                    thinkingBudget:0
                },
                temperature: 0,
                maxOutputTokens: 1500
            }
        })
        text= response.text || "[]"
        text = text.replace(/^```json\s*/, "").replace(/```$/, "").replace(/,\s*([\]}])/g, "$1").replace(/[\u0000-\u0009\u000B\u000C\u000E-\u001F]+/g, "").trim();
        try
        {
            if(fs.existsSync(reportpath)){
                fs.unlinkSync(reportpath); 
                console.log(`Deleted ${reportpath} after inserting into DB`);
            }
        } 
        catch(err){
            console.error("Error deleting accessibility report:", err);
        }
        return JSON.parse(text)
    }
    catch(err){
        console.error("Could not parse AI Output as JSON:", err, "\nRaw Text is: \n", text)
        return []
    }
}
