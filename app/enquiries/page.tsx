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
            <p className="eyebrow">Management</p>
            <h1>Enquiries</h1>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button
              type="button"
              onClick={fetchEnquiries}
              className="secondary-button"
              style={{ padding: "8px 14px", fontSize: "0.85rem" }}
              disabled={loading}
            >
              ↻ Refresh
            </button>
            <span className="pill">{filteredEnquiries.length} of {enquiries.length}</span>
          </div>
        </div>

        {error ? (
          <div style={{ marginBottom: 20, color: "var(--danger)", background: "#fee", padding: 14, borderRadius: 10 }}>
            {error}
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
                  {f === "all" ? "All" : f}
                </button>
              ))}
            </div>

            <input
              type="text"
              placeholder="Search by name, email, company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="spinner" />
              <p>Fetching enquiries from backend...</p>
            </div>
          ) : filteredEnquiries.length === 0 ? (
            <div className="empty-state">
              <p>No enquiries found matching your criteria.</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email / Phone</th>
                    <th>Company</th>
                    <th>Inquiry Type</th>
                    <th>Status</th>
                    <th>Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEnquiries.map((enquiry) => (
                    <tr key={enquiry.enquiryId}>
                      <td>#{enquiry.enquiryId}</td>
                      <td>
                        <Link
                          href={`/enquiries/${enquiry.enquiryId}`}
                          className="table-link"
                        >
                          {enquiry.fullName}
                        </Link>
                      </td>
                      <td>
                        <div>{enquiry.email}</div>
                        {enquiry.phone ? (
                          <small style={{ color: "var(--muted)" }}>{enquiry.phone}</small>
                        ) : null}
                      </td>
                      <td>{enquiry.company || "—"}</td>
                      <td>{enquiry.inquiryType || "General"}</td>
                      <td>
                        <span
                          className={`status-badge ${enquiry.status.toLowerCase()}`}
                        >
                          {enquiry.status}
                        </span>
                      </td>
                      <td>{formatDate(enquiry.submittedAt)}</td>
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
