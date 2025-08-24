import {Pool} from "pg"

const isProduction = process.env.NODE_ENV === "production"

const pool= new Pool({
    connectionString: process.env.DB_URL,
    ssl: { rejectUnauthorized: false }
})

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

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