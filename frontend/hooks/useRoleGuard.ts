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

    // Якщо allowedRoles === null, значить сторінка публічна - не робимо редірект
    if (allowedRoles === null) {
      return;
    }

    // Якщо користувач не авторизований, а сторінка потребує авторизації
    if (!isAuth) {
      router.replace(redirectTo);
      return;
    }

    // Якщо користувач авторизований, але має неправильну роль
    if (user && !allowedRoles.includes(user.role)) {
      const fallback = user.role === "business" ? "/" : "/teachers";
      router.replace(fallback);
    }
  }, [loading, isAuth, user, allowedRoles, redirectTo, router]);
}
