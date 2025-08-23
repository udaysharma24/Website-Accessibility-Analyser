import {Pool} from "pg"

const isProduction = process.env.NODE_ENV === "production"

const pool= new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    ssl: isProduction
    ? { rejectUnauthorized: false } 
    : false,
})

async function conn(){
    try
    {
        await pool.connect()
        console.log("Connected to PostgreSQL using async/await")
    }
    catch(error)
    {
        console.log("Connection Error: ", error)
    }
}

conn()
export default pool