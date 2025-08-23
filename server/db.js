import {Pool} from "pg"

const pool= new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'intelliaccess_auth',
    password: 'uday@24022004',
    port: 5432
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