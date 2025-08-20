import { redirect } from "next/navigation";

export default function LogoutPage() {
  // In a real app, this would handle logout logic
  redirect("/auth/login");
}