import { createClient } from "@/utils/supabase/server";

export default async function Dashboard() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getSession();

  return (
    <div>
      <p>`JWT: {JSON.stringify(data.session?.access_token)}`</p>
    </div>
  );
}
