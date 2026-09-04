"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AuthGuard } from "@/app/components/AuthGuard";
import { AdminShell } from "@/app/components/AdminShell";
import { Enquiry, getEnquiriesList } from "@/app/lib/api";

export default function DashboardPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refreshData = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getEnquiriesList();
      setEnquiries(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load dashboard data";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const totalCount = enquiries.length;
  const activeCount = enquiries.filter(
    (e) => e.status === "active" || e.status === "pending" || e.status === "New"
  ).length;
  const inProgressCount = enquiries.filter(
    (e) => e.status === "in-progress" || e.status === "Contacted"
  ).length;
  const resolvedCount = enquiries.filter(
    (e) =>
      e.status === "resolved" ||
      e.status === "closed" ||
      e.status === "Qualified" ||
      e.status === "Closed"
  ).length;

  const stats = [
    { label: "Total Enquiries", value: totalCount, trend: "⚡ Live Sync", icon: "📬" },
    { label: "New / Pending", value: activeCount, trend: "⚠️ Action Needed", icon: "⏳" },
    { label: "In-Progress", value: inProgressCount, trend: "🔄 Under Review", icon: "⚙️" },
    { label: "Resolved / Closed", value: resolvedCount, trend: "✅ Completed", icon: "✨" },
  ];

  // Latest 5 enquiries sorted by submission date descending
  const recentEnquiries = [...enquiries]
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
    .slice(0, 5);

  return (
    <AuthGuard>
      <AdminShell>
        <div className="page-header">
          <div>
            <p className="eyebrow">Insights & Performance</p>
            <h1>Dashboard Overview</h1>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <button
              type="button"
              onClick={refreshData}
              className={`refresh-btn ${loading ? "spinning" : ""}`}
              disabled={loading}
              title="Refresh dashboard insights"
            >
              <svg
                className="refresh-icon"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21.5 2v6h-6" />
                <path d="M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
              </svg>
              <span>{loading ? "Syncing..." : "Refresh"}</span>
            </button>
            <Link href="/enquiries" className="primary-button">
              View All Enquiries →
            </Link>
          </div>
        </div>

        {error ? (
          <div style={{ marginBottom: 24, color: "#ef4444", background: "rgba(239, 68, 68, 0.12)", border: "1px solid rgba(239, 68, 68, 0.3)", padding: 16, borderRadius: 14 }}>
            ⚠️ {error}
          </div>
        ) : null}

        <div className="stats-grid">
          {stats.map((stat) => (
            <div key={stat.label} className="stat-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <p>{stat.label}</p>
                <span style={{ fontSize: "1.2rem" }}>{stat.icon}</span>
              </div>
              <h2>{loading ? <span className="spinner" style={{ width: 20, height: 20 }} /> : stat.value}</h2>
              <span>{stat.trend}</span>
            </div>
          ))}
        </div>

        <div className="panel-grid">
          <section className="panel">
            <div className="panel-header">
              <h3>Recent Enquiries</h3>
              <Link href="/enquiries">View All ({totalCount}) →</Link>
            </div>

            {loading ? (
              <div className="loading-state">
                <div className="spinner" />
                <p>Syncing recent client enquiries...</p>
              </div>
            ) : recentEnquiries.length === 0 ? (
              <div className="empty-state">
                <p>No enquiries received yet.</p>
              </div>
            ) : (
              <div className="list-stack">
                {recentEnquiries.map((enquiry) => (
                  <Link
                    href={`/enquiries/${enquiry.enquiryId}`}
                    key={enquiry.enquiryId}
                    className="list-item"
                  >
                    <div>
                      <strong>{enquiry.fullName}</strong>
                      <p>
                        {enquiry.inquiryType || "General Service"}
                        {enquiry.company ? ` • ${enquiry.company}` : ""}
                      </p>
                    </div>
                    <span className={`status-badge ${enquiry.status.toLowerCase()}`}>
                      {enquiry.status}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section className="panel">
            <div className="panel-header">
              <h3>Quick Actions</h3>
            </div>
            <div className="quick-actions">
              <Link href="/enquiries">
                <span>📩 Manage All Enquiries</span>
                <span>→</span>
              </Link>
              <Link href="/enquiries?filter=pending">
                <span>⏳ Review Pending Leads</span>
                <span>→</span>
              </Link>
              <a
                href="https://appixotech.com/"
                target="_blank"
                rel="noreferrer"
              >
                <span>🌐 Visit Main Website</span>
                <span>↗</span>
              </a>
              <a
                href="https://appixo-backend.onrender.com/health"
                target="_blank"
                rel="noreferrer"
              >
                <span>⚡ API System Health</span>
                <span>↗</span>
              </a>
            </div>
          </section>
        </div>
      </AdminShell>
    </AuthGuard>
  );
}
