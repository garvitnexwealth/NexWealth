"use client";

import { signOut } from "next-auth/react";

export function handleUnauthorized(response: Response) {
  if (response.status !== 401) {
    return false;
  }

  void signOut({ callbackUrl: "/auth/login" });
  return true;
}
