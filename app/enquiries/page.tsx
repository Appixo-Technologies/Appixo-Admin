"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { AuthGuard } from "@/app/components/AuthGuard";
import { AdminShell } from "@/app/components/AdminShell";
import { Enquiry, getEnquiriesList } from "@/app/lib/api";

const STATUS_FILTERS = ["all", "active", "pending", "in-progress", "resolved", "closed"] as const;

export default function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getEnquiriesList();
      setEnquiries(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load enquiries";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const filteredEnquiries = useMemo(() => {
    return enquiries.filter((item) => {
      const matchesFilter =
        activeFilter === "all" ||
        item.status.toLowerCase() === activeFilter.toLowerCase();

      const query = search.toLowerCase().trim();
      const matchesSearch =
        !query ||
        item.fullName?.toLowerCase().includes(query) ||
        item.email?.toLowerCase().includes(query) ||
        item.company?.toLowerCase().includes(query) ||
        item.inquiryType?.toLowerCase().includes(query) ||
        item.location?.toLowerCase().includes(query);

      return matchesFilter && matchesSearch;
    });
  }, [enquiries, activeFilter, search]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <AuthGuard>
      <AdminShell>
        <div className="page-header">
          <div>
            <p className="eyebrow">Lead Directory</p>
            <h1>Client Enquiries</h1>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <button
              type="button"
              onClick={fetchEnquiries}
              className={`refresh-btn ${loading ? "spinning" : ""}`}
              disabled={loading}
              title="Refresh live enquiries"
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
            <span className="pill">
              {filteredEnquiries.length} / {enquiries.length} Enquiries
            </span>
          </div>
        </div>

        {error ? (
          <div style={{ marginBottom: 24, color: "#ef4444", background: "rgba(239, 68, 68, 0.12)", border: "1px solid rgba(239, 68, 68, 0.3)", padding: 16, borderRadius: 14 }}>
            ⚠️ {error}
          </div>
        ) : null}

        <section className="panel full-panel">
          <div className="filter-bar">
            <div className="filter-group">
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f}
                  type="button"
                  className={`filter-btn ${activeFilter === f ? "active" : ""}`}
                  onClick={() => setActiveFilter(f)}
                >
                  {f === "all" ? "All Statuses" : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>

            <div className="search-box-wrapper">
              <svg
                className="search-box-icon"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Search name, email, company..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="search-box-input"
              />
              {search ? (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => setSearch("")}
                  title="Clear search"
                >
                  ✕
                </button>
              ) : (
                <span className="search-shortcut">⌘K</span>
              )}
            </div>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="spinner" />
              <p>Fetching enquiries from backend server...</p>
            </div>
          ) : filteredEnquiries.length === 0 ? (
            <div className="empty-state">
              <p>No enquiries found matching your search or status filter.</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Full Name</th>
                    <th>Email / Contact</th>
                    <th>Company</th>
                    <th>Inquiry Category</th>
                    <th>Current Status</th>
                    <th>Submission Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEnquiries.map((enquiry) => (
                    <tr key={enquiry.enquiryId}>
                      <td style={{ color: "var(--text-subtle)", fontFamily: "monospace" }}>
                        #{enquiry.enquiryId}
                      </td>
                      <td>
                        <Link
                          href={`/enquiries/${enquiry.enquiryId}`}
                          className="table-link"
                        >
                          {enquiry.fullName}
                        </Link>
                      </td>
                      <td>
                        <div style={{ color: "var(--text-main)" }}>{enquiry.email}</div>
                        {enquiry.phone ? (
                          <small style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>
                            {enquiry.phone}
                          </small>
                        ) : null}
                      </td>
                      <td style={{ color: enquiry.company ? "var(--text-main)" : "var(--text-subtle)" }}>
                        {enquiry.company || "—"}
                      </td>
                      <td style={{ color: "var(--gold-light)", fontWeight: 500 }}>
                        {enquiry.inquiryType || "General"}
                      </td>
                      <td>
                        <span
                          className={`status-badge ${enquiry.status.toLowerCase()}`}
                        >
                          {enquiry.status}
                        </span>
                      </td>
                      <td style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>
                        {formatDate(enquiry.submittedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </AdminShell>
    </AuthGuard>
  );
}
