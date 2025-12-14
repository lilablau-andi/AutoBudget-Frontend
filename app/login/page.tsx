"use client"

import { createClient } from "@/utils/supabase/client"

export default function LoginPage() {
  const supabase = createClient()

  const login = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: "andrej@lilablau.club",
      password: "44444444",
    })

    console.log("JWT:", data.session?.access_token)
  }

  return <button onClick={login}>Login</button>
}
