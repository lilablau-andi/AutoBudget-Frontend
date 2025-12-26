import { redirect } from "next/navigation";
export default async function Dashboard() {
  return redirect("/app/ausgaben/all");
}
