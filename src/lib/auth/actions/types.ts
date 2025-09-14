import type { User } from "@/lib/entities/user/model";

export type AuthActionResult =
  | { ok: true; user: User; message?: string }
  | { ok: false; error: string; status?: number };
  
