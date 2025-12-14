import { createClient } from "@/utils/supabase/server";

export default async function Home() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: "andrej@lilablau.club",
    password: "44444444"
  });

  return (
    <div>
      <script dangerouslySetInnerHTML={{ __html: `console.log(${JSON.stringify(data.session?.access_token)})` }} />
    </div>
  );
}
