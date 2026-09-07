"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    setSession(getStoredSession());
    const storedState = localStorage.getItem("admin_sidebar_collapsed");
    if (storedState === "true") {
      setIsCollapsed(true);
    }
  }, []);

  // Auto-close mobile drawer on route navigation
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const toggleCollapse = () => {
    const nextState = !isCollapsed;
    setIsCollapsed(nextState);
    localStorage.setItem("admin_sidebar_collapsed", String(nextState));
  };

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
    <div
      className={`admin-shell ${isMobileMenuOpen ? "mobile-open" : ""} ${
        isCollapsed ? "sidebar-collapsed" : ""
      }`}
    >
      {/* Mobile Top Header Bar */}
      <header className="mobile-header">
        <Link href="/dashboard" className="mobile-brand-link">
          <Image
            src="/appixo-mark.png"
            alt="Appixo Technologies"
            width={32}
            height={32}
            priority
          />
          <span className="mobile-brand-title">
            APPI<span className="gold-x">X</span>O
          </span>
        </Link>
        <button
          type="button"
          className="mobile-nav-toggle"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle Navigation Menu"
        >
          {isMobileMenuOpen ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          )}
        </button>
      </header>

      {/* Mobile Menu Backdrop */}
      {isMobileMenuOpen ? (
        <div
          className="mobile-backdrop"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      ) : null}

      <aside
        className={`sidebar ${isMobileMenuOpen ? "open" : ""} ${
          isCollapsed ? "collapsed" : ""
        }`}
      >
        <div className="brand-block">
          <div className="brand-header-flex">
            <Link href="/dashboard" className="brand-link">
              <Image
                src="/appixo-mark.png"
                alt="Appixo Technologies"
                width={42}
                height={42}
                priority
                className="brand-sidebar-logo"
              />
              <div className="brand-text">
                <div className="brand-title">
                  APPI<span className="gold-x">X</span>O
                </div>
                <div className="brand-subtitle">TECHNOLOGIES</div>
              </div>
            </Link>
            <button
              type="button"
              className="sidebar-collapse-toggle"
              onClick={toggleCollapse}
              aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {isCollapsed ? (
                  <polyline points="9 18 15 12 9 6" />
                ) : (
                  <polyline points="15 18 9 12 15 6" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {session ? (
          <div className="admin-user-info" title={session.fullName || session.username}>
            <div className="admin-avatar">{userInitial}</div>
            <div className="admin-user-details">
              <strong>{session.fullName || session.username}</strong>
              <span>{session.role ? session.role.replace("_", " ") : "Administrator"}</span>
            </div>
          </div>
        ) : null}

        <nav className="nav">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href === "/enquiries" && pathname.startsWith("/enquiries"));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={isActive ? "nav-link active" : "nav-link"}
                title={isCollapsed ? item.label : undefined}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-link-label">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          className="logout-button"
          onClick={handleLogout}
          title={isCollapsed ? "Sign Out" : "Sign out of Admin Console"}
        >
          <svg
            className="logout-icon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span className="logout-label">Sign Out</span>
        </button>
      </aside>

      <main className="content-area">{children}</main>
    </div>
  );
}


