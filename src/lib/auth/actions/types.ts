import { User } from "@/lib/user";

export type AuthActionResult =
  | { ok: true; user: User; message?: string }
  | { ok: false; error: string; status?: number };
  