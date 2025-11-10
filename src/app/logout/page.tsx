"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    async function doLogout() {
      try {
        const response = await fetch("/api/auth/logout", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          const text = await response.text();
          console.error("Logout failed:", text);
          return;
        }

        console.log("✅ Logout success");
      } catch (err) {
        console.error("❌ Fetch error:", err);
      } finally {
        router.replace("/login");
      }
    }

    doLogout();
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen text-lg">
      Đang đăng xuất...
    </div>
  );
}
