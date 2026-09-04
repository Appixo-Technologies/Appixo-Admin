"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AuthSession, getStoredSession, logoutAdmin } from "@/app/lib/api";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/enquiries", label: "Enquiries", icon: "📩" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<AuthSession | null>(null);

  useEffect(() => {
    setSession(getStoredSession());
  }, []);

  const handleLogout = async () => {
    await logoutAdmin();
    router.push("/login");
  };

  const userInitial = session?.fullName
    ? session.fullName.charAt(0).toUpperCase()
    : session?.username
    ? session.username.charAt(0).toUpperCase()
    : "A";

  return (
    <div className="admin-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <Link href="/dashboard">
            <img
              src="/appixo-logo-full.png"
              alt="Appixo Technologies"
              className="brand-sidebar-logo"
            />
          </Link>
        </div>

        {session ? (
          <div className="admin-user-info">
            <div className="admin-avatar">{userInitial}</div>
            <div className="admin-user-details">
              <strong>{session.fullName || session.username}</strong>
              <span>{session.role ? session.role.replace("_", " ") : "Administrator"}</span>
            </div>
          </div>
        ) : null}

        <nav className="nav">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={pathname === item.href || (item.href === "/enquiries" && pathname.startsWith("/enquiries")) ? "nav-link active" : "nav-link"}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <button type="button" className="logout-button" onClick={handleLogout}>
          <span>🚪</span> Logout
        </button>
      </aside>

      <main className="content-area">{children}</main>
    </div>
  );
}
