import { Strategy as GoogleStrategy } from "passport-google-oauth2"
import pool from "./db.js"
import passport from "passport"

passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `https://intelliaccess.onrender.com/auth/callback/google`,
        passReqToCallback: true
    }, async (req, accessToken, refreshToken, profile, done)=>{
        try{
            const email= profile.emails[0].value
            const result= await pool.query("SELECT * from googleusers where email=$1", [email])
            if(result.rows.length>0)
            {
                return done(null, result.rows[0])
            }
            else
            {
                const insertedquery= await pool.query("INSERT INTO googleusers(google_id, displayname, email) VALUES ($1, $2, $3) RETURNING *", [profile.id ,profile.displayName, email])
                req.session.displayname= profile.displayName
                return done(null, insertedquery.rows[0])
            }
        }
        catch(err){
            done(err, null)
        }
    }
))

passport.serializeUser((user, done)=>{
    done(null, user.id)
})

passport.deserializeUser(async(id, done)=>{
    const result= await pool.query("SELECT * from googleusers where id=$1", [id])
    done(null, result.rows[0])
})