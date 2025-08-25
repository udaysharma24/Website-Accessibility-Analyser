import express from "express"
import cors from "cors"
import { fileURLToPath } from "url"
import path from "path"
import bcrypt from "bcrypt"
import pool from "./db.js"
import session from "express-session"
import dotenv from "dotenv"
import { UAParser } from "ua-parser-js"
import fs from "fs"
import { dirname } from "path"
import accessibilityTest from "./accessibilityTest.js"
import passport from "passport"
import { profile } from "console"
import "dotenv/config"
import "./passportConfig.js"
import getaccess_fixes from "./AI_accessibilityFixes.js"
import nodemailer from "nodemailer"
import crypto from "crypto"
import helmet from "helmet";
import connect_pg from "connect-pg-simple"

dotenv.config()

const PgSession= connect_pg(session)

const _filename= fileURLToPath(import.meta.url)
const __dirname= dirname(_filename)

const app= express()
const port= process.env.PORT || 3001

async function startserver() {
    app.use(cors({
        origin: "https://intelliaccess.vercel.app",
        credentials: true,
        methods: ["GET","POST","PUT","DELETE","OPTIONS"]
    }))
    app.options("*", cors({
        origin: "https://intelliaccess.vercel.app",
        credentials: true,
        methods: ["GET","POST","PUT","DELETE","OPTIONS"]
    }));
    app.set("trust proxy", 1)
    app.use(express.json())
    app.use(session({
        store: new PgSession({
            pool: pool,
            tableName: "session",
            createTableIfMissing: true,
        }),
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 1000 * 60 * 60 * 24, // 1 day
            secure: true,                // required with sameSite: "none"
            httpOnly: true,              // prevent JS access
            sameSite: "none",            // allow cross-site cookies
        },
    }));
    app.use(passport.initialize())
    app.use(passport.session())
    app.use(helmet())
    app.post("/register", async(req, res)=>{
        console.log(req.body)
        const username= req.body.username
        const email= req.body.email
        const password= req.body.password
        const token= crypto.randomBytes(32).toString("hex")
        const hashedpassword= await bcrypt.hash(password, 10)
        let result
        try
        {
            result= await pool.query("INSERT INTO users(username, email, password, verified, verify_token) VALUES($1, $2, $3, $4, $5) RETURNING *",[username, email, hashedpassword, false, token])
        }
        catch(err)
        {
            console.error("Error inserting User: ", err)
            if(err.code==="23505")
                return res.status(400).json({message: "This User already exists"})
            else if(err.code==="23502")
                return res.status(400).json({message: "Please don't leave the fields empty!"})
            return res.status(500).json({ error: "Database error" })
        }
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASS
            }
        });
        const verifyinglink= `${process.env.FRONTEND_URL}/verify?token=${token}`
        let mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: 'Intelliaccess account Verification mail',
            html:  `<p>Hello ${username},</p>
                    <p>Please verify your email by clicking below:</p>
                    <a href="${verifyinglink}">Verify Email</a>`,
        };
        transporter.sendMail(mailOptions, function(err, info){
            if (err) {
                console.log(err);
                return res.status(500).json({error: `Error sending verification mail - ${email}`})
            } 
            else {
                console.log('Email sent: ' + info.response);
                return res.status(201).json({message: "Please check your mailbox and verify by clicking the link", user: result.rows[0]})
            }
        });
    })
    app.get("/verify/:token", async(req, res)=>{
        const token= req.params.token
        const user= await pool.query("Select * from users where verify_token=$1", [token])
        if(user.rows.length===0)
            return res.status(400).json({message: "Token is either invalid or expired"})
        else
        {
            await pool.query("update users set verified=true, verify_token=NULL where verify_token=$1", [token])
            res.redirect(`${process.env.FRONTEND_URL}/login`)
        }
    })
    app.post("/login", async(req, res)=>{
        console.log(req.body)
        const token= crypto.randomBytes(32).toString("hex")
        const email= req.body.email
        const password= req.body.password
        if(email=='' || password=='')
            return res.status(400).json({message: "Please don't leave the fields empty!"})
        let result= await pool.query("SELECT * from users where email=$1",[email])
        if(result.rows.length===1)
        {
            const user= result.rows[0]
            const verified= user.verified
            if(verified)
            {
                const isok= await bcrypt.compare(password, user.password)
                if(isok)
                {
                    req.session.username= user.username
                    req.session.userid= user.id
                    req.session.email= email
                    return res.status(200).json({message: "Login successffull", user: {id: user.id, username: user.username}})
                }
                else
                {
                    return res.status(401).json({message: "Wrong Password"})
                }
            }
            else
            {
                let transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: process.env.EMAIL,
                        pass: process.env.EMAIL_PASS
                    }
                });
                const verifyinglink= `${process.env.FRONTEND_URL}/verify?token=${token}`
                let mailOptions = {
                    from: process.env.EMAIL,
                    to: email,
                    subject: 'Intelliaccess account Verification mail',
                    html:  `<p>Hello ${user.username},</p>
                            <p>Please verify your email by clicking below:</p>
                            <a href="${verifyinglink}">Verify Email</a>`,
                };
                transporter.sendMail(mailOptions, function(err, info){
                    if (err) {
                        console.log(err);
                        return res.status(500).json({error: `Error sending verification mail - ${email}`})
                    } 
                    else {
                        console.log('Email sent: ' + info.response);
                        return res.status(201).json({message: "Please check your mailbox and verify by clicking the link", user: result.rows[0]})
                    }
                });
                return res.status(403).json({message: "Please verify your email before Login!"})
            }
        }
        else
        {
            return res.status(404).json({message: "No such user, Register first"})
        }
    })
    app.post("/url_input", async(req, res)=>{
        try{
            console.log(req.body)
            const url= req.body.url
            if(url==undefined || url==null || url.trim()=='' || url.trim()=="")
                return res.status(400).json({message: "Please don't leave the URL Field empty!", status_code: 400})
            const start= Date.now()
            const response= await fetch(url)
            const end= Date.now()
            const useragent= req.headers['user-agent']
            const parser= new UAParser(useragent)
            const ua= parser.getResult()
            const status_code= response.status
            const user_id= req.session.userid
            const scan_duration= end-start
            const device_type= ua.device.type || "desktop"
            const browser= ua.browser.name || "Unknown browser"
            const ip_address= req.ip || req.socket.remoteAddress
            const result= await pool.query(
                "INSERT INTO audit_history(url, user_id, status_code, scan_duration, device_type, browser, ip_address, result_summary) VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *", [url, user_id, status_code, scan_duration, device_type, browser, ip_address, null]
            )
            const audit= result.rows[0]
            req.session.url= audit.url
            req.session.audit_id= audit.id
            req.session.save((err) => {
                if(err)
                {
                    console.error(err);
                    return res.status(500).json({ message: "Session save failed" });
                }
                res.status(200).json({ message: "Audit created successfully!!", status_code: 200 });
            });
        }
        catch(error)
        {
            console.error(error)
            res.status(500).json({error: "Internal Server Error!"})
        }
    })
    app.post("/analytics", async(req, res)=>{
        console.log(req.body)
        const url= req.session.url
        const audit_id= req.session.audit_id
        const reportpath= path.join(__dirname, 'accessibility_report.json')
        if(!fs.existsSync(reportpath))
            return res.status(404).json({error: "Accessibility Report File Not found, Please run Accessibility Test first!"})
        const rawdata= fs.readFileSync(reportpath)
        const report= JSON.parse(rawdata)
        const violations= report.violations
        
        for(const violation of violations)
        {
            const wcag_rule= violation.id
            const severity= violation.impact
            const description= violation.description
            const help_url= violation.helpUrl
            const resolved= false
            for(const node of violation.nodes)
            {
                const html_snippet= node.html
                const css_target= node.target.join(', ')
                const failure_summary= node.failureSummary
                await pool.query("INSERT INTO audit_results(audit_id, wcag_rule, severity, description, resolved,html_snippet, css_target, failure_summary, help_url, url) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)", [audit_id, wcag_rule, severity, description, resolved, html_snippet, css_target, failure_summary, help_url, url])
            }
        }
        res.status(200).json({message: "Accessibility Results inserted successfully in audit_results!"})
    })
    app.post("/logout", (req, res)=>{
        req.session.destroy((err)=>{
            if(err)
            {
                console.error("Error destroying session: ", err)
                return res.status(500).send("Logout Failed!")
            }
            else
            {
                res.clearCookie("connect.sid")
                res.redirect("/login")
            }
        })
    })
    app.get("/analytics_back", async(req, res)=>{
        if(!req.session){
            console.warn("No session object");
            return res.status(440).json({ message: "Session not initialized!" });
        }
        console.log("Session object:", req.session);
        console.log("Session ID cookie:", req.cookies);
        if(!req.session.url){
            console.warn("URL not in session");
            return res.status(440).json({ message: "URL not set in session yet!" });
        }
        console.log("Starting accessibility test on:", req.session.url)
        try{
            await accessibilityTest(req.session.url);
            console.log("Accessibility test complete");
            res.json({ url: req.session.url });
        } 
        catch(err){
            console.error("Accessibility test failed:", err);
            res.status(500).json({ message: "Accessibility test failed" });
        }
    })
    app.get("/auth/google", passport.authenticate("google", {scope: ["email", "profile"]}))
    app.get("/auth/google/callback", passport.authenticate("google", { failureRedirect: "/login" }),
        (req, res) => {
            req.session.username = req.user.displayname;
            req.session.userid = req.user.id;
            res.redirect(`${process.env.FRONTEND_URL}/url_input`);
        }
    )
    app.get("/urlinput", (req, res)=>{
        console.log(req.session); 
        console.log(req.session.username)
        if(req.session)
            res.json({username: req.session.username})
        else    
            res.status(440).json({message: "User is not logged in"})
    })
    app.get("/analytics_data", async(req, res)=>{
        const url= req.session.url
        const audit_id= req.session.audit_id
        if(!url)
            return res.status(400).json({message: "No URL in session!!"})
        else
        {
            const result= await pool.query("SELECT * FROM audit_results WHERE audit_id=$1 ORDER BY id ASC", [audit_id])
            const aifixes= await getaccess_fixes()
            res.status(200).json({audit: result.rows, fixes: aifixes})
        }
    })
    app.listen(port, ()=>{
        console.log(`Server listening on port ${port}`)
    })
}

startserver()