"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AuthSession, getStoredSession, logoutAdmin } from "@/app/lib/api";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/enquiries", label: "Enquiries" },
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

  return (
    <div className="admin-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-mark">A</div>
          <div>
            <p className="eyebrow">Admin Panel</p>
            <h2>Appixo</h2>
          </div>
        </div>

        {session ? (
          <div className="admin-user-info">
            <strong>{session.fullName || session.username}</strong>
            <span>{session.role ? session.role.replace("_", " ") : "Administrator"}</span>
          </div>
        ) : null}

        <nav className="nav">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={pathname === item.href ? "nav-link active" : "nav-link"}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <button type="button" className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </aside>

      <main className="content-area">{children}</main>
    </div>
  );
}
