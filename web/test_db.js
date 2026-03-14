import { createClient } from "@supabase/supabase-js"
import fs from "fs"

const envFile = fs.readFileSync("/home/Josias/Desktop/E-learning/web/.env.local", "utf-8")
const SUPABASE_URL = envFile.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim()
const SUPABASE_ANON_KEY = envFile.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)[1].trim()

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function run() {
    const { data: courses, error: err1 } = await supabase.from('courses').select('*')
    console.log("ALL COURSES (anon):", courses?.length, err1)
    
    // Auth as student?? We don't have a student user. Let's list courses directly.
    const { data: qz, error: err2 } = await supabase.from('quizzes').select('*')
    console.log("ALL QUIZZES (anon):", qz?.length, err2)
}
run()
