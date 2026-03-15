"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/context/AuthContext";

export function useRoleGuard(
  allowedRoles: ("client" | "business")[] | null,
  redirectTo = "/",
) {
  const router = useRouter();
  const { user, isAuth, loading } = useAuthContext();

  useEffect(() => {
    if (loading) return;

    if (!isAuth) {
      router.replace(redirectTo);
      return;
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
      const fallback = user.role === "business" ? "/" : "/teachers";
      router.replace(fallback);
    }
  }, [loading, isAuth, user?.role]); // eslint-disable-line
}
