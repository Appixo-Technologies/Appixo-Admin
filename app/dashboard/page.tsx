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

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        setLoading(true);
        const data = await getEnquiriesList();
        if (mounted) {
          setEnquiries(data);
        }
      } catch (err: unknown) {
        if (mounted) {
          const message = err instanceof Error ? err.message : "Failed to load dashboard data";
          setError(message);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadData();
    return () => {
      mounted = false;
    };
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
    { label: "Total enquiries", value: totalCount, trend: "Live from backend" },
    { label: "New / Pending", value: activeCount, trend: "Requires attention" },
    { label: "In-Progress", value: inProgressCount, trend: "Under review" },
    { label: "Resolved / Closed", value: resolvedCount, trend: "Completed" },
  ];

  // Latest 4 enquiries sorted by submission date descending
  const recentEnquiries = [...enquiries]
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
    .slice(0, 4);

  return (
    <AuthGuard>
      <AdminShell>
        <div className="page-header">
          <div>
            <p className="eyebrow">Overview</p>
            <h1>Dashboard</h1>
          </div>
          <Link href="/enquiries" className="primary-button small-button">
            View enquiries
          </Link>
        </div>

        {error ? (
          <div style={{ marginBottom: 20, color: "var(--danger)", background: "#fee", padding: 14, borderRadius: 10 }}>
            {error}
          </div>
        ) : null}

        <div className="stats-grid">
          {stats.map((stat) => (
            <div key={stat.label} className="stat-card">
              <p>{stat.label}</p>
              <h2>{loading ? "-" : stat.value}</h2>
              <span>{stat.trend}</span>
            </div>
          ))}
        </div>

        <div className="panel-grid">
          <section className="panel">
            <div className="panel-header">
              <h3>Recent enquiries</h3>
              <Link href="/enquiries">All ({totalCount})</Link>
            </div>

            {loading ? (
              <div className="loading-state">
                <div className="spinner" />
                <p>Loading enquiries...</p>
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
                        {enquiry.inquiryType || "General"}
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
              <h3>Quick actions</h3>
            </div>
            <div className="quick-actions">
              <Link href="/enquiries">View all enquiries</Link>
              <Link href="/enquiries">Check active leads</Link>
              <a
                href="https://appixo-backend.onrender.com/health"
                target="_blank"
                rel="noreferrer"
              >
                Backend API status ↗
              </a>
            </div>
          </section>
        </div>
      </AdminShell>
    </AuthGuard>
  );
}
