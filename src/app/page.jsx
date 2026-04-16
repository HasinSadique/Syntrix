import { redirect } from "next/navigation";
import { getCurrentUser } from "@/backend/auth/guards";

export default async function HomePage() {
  const user = await getCurrentUser();
  redirect(user ? "/dashboard" : "/login");
}
