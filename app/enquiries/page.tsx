"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthGuard } from "@/app/components/AuthGuard";
import { AdminShell } from "@/app/components/AdminShell";
import { Enquiry, getEnquiriesList, updateEnquiryReadStatus } from "@/app/lib/api";

const STATUS_FILTERS = ["all", "unread", "active", "pending", "in-progress", "resolved", "closed"] as const;
const PAGE_SIZE = 10;

export default function EnquiriesPage() {
  const router = useRouter();
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [updatingIds, setUpdatingIds] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

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

  // Reset pagination on filter or search change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter, search]);

  const handleToggleRead = async (enquiryId: number, currentIsRead?: boolean) => {
    const targetState = !currentIsRead;
    setUpdatingIds((prev) => [...prev, enquiryId]);
    try {
      await updateEnquiryReadStatus(enquiryId, targetState);
      setEnquiries((prev) =>
        prev.map((e) => (e.enquiryId === enquiryId ? { ...e, isRead: targetState } : e))
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update read status";
      setError(message);
    } finally {
      setUpdatingIds((prev) => prev.filter((id) => id !== enquiryId));
    }
  };

  // Metrics counts
  const totalCount = enquiries.length;
  const unreadCount = useMemo(() => enquiries.filter((e) => !e.isRead).length, [enquiries]);
  const pendingCount = useMemo(
    () => enquiries.filter((e) => e.status.toLowerCase() === "pending" || e.status.toLowerCase() === "new" || e.status.toLowerCase() === "active").length,
    [enquiries]
  );
  const resolvedCount = useMemo(
    () => enquiries.filter((e) => e.status.toLowerCase() === "resolved" || e.status.toLowerCase() === "closed" || e.status.toLowerCase() === "qualified").length,
    [enquiries]
  );

  // Filter count helper for tabs
  const getFilterCount = (filter: string) => {
    if (filter === "all") return totalCount;
    if (filter === "unread") return unreadCount;
    return enquiries.filter((e) => e.status.toLowerCase() === filter.toLowerCase()).length;
  };

  const filteredEnquiries = useMemo(() => {
    return enquiries
      .filter((item) => {
        const matchesFilter =
          activeFilter === "all"
            ? true
            : activeFilter === "unread"
            ? !item.isRead
            : item.status.toLowerCase() === activeFilter.toLowerCase();

        const query = search.toLowerCase().trim();
        const matchesSearch =
          !query ||
          item.fullName?.toLowerCase().includes(query) ||
          item.email?.toLowerCase().includes(query) ||
          item.company?.toLowerCase().includes(query) ||
          item.inquiryType?.toLowerCase().includes(query) ||
          item.location?.toLowerCase().includes(query);

        return matchesFilter && matchesSearch;
      })
      .sort((a, b) => {
        const timeA = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
        const timeB = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
        if (timeA !== timeB) return timeB - timeA;
        return b.enquiryId - a.enquiryId;
      });
  }, [enquiries, activeFilter, search]);

  // Paginated subset
  const totalPages = Math.max(1, Math.ceil(filteredEnquiries.length / PAGE_SIZE));
  const paginatedEnquiries = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredEnquiries.slice(start, start + PAGE_SIZE);
  }, [filteredEnquiries, currentPage]);

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

  const getClientInitial = (name?: string) => {
    if (!name) return "C";
    return name.charAt(0).toUpperCase();
  };

  return (
    <AuthGuard>
      <AdminShell>
        {/* Page Header */}
        <div className="page-header">
          <div>
            <p className="eyebrow">Lead Directory & Management</p>
            <h1>Client Enquiries</h1>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <button
              type="button"
              onClick={fetchEnquiries}
              className={`refresh-btn ${loading ? "spinning" : ""}`}
              disabled={loading}
              title="Sync live enquiries"
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

        {/* Top Summary Metrics Bar */}
        <div className="enquiries-summary-grid">
          <div className="summary-pill-card">
            <div>
              <p>Total Enquiries</p>
              <h3>{loading ? "..." : totalCount}</h3>
            </div>
            <span style={{ fontSize: "1.4rem" }}>📬</span>
          </div>

          <div className="summary-pill-card">
            <div>
              <p>Unread Messages</p>
              <h3 style={{ color: unreadCount > 0 ? "var(--gold-light)" : "inherit" }}>
                {loading ? "..." : unreadCount}
              </h3>
            </div>
            {unreadCount > 0 ? (
              <span className="read-status-badge unread">NEW</span>
            ) : (
              <span style={{ fontSize: "1.4rem" }}>✉️</span>
            )}
          </div>

          <div className="summary-pill-card">
            <div>
              <p>Action Needed</p>
              <h3>{loading ? "..." : pendingCount}</h3>
            </div>
            <span style={{ fontSize: "1.4rem" }}>⏳</span>
          </div>

          <div className="summary-pill-card">
            <div>
              <p>Resolved Leads</p>
              <h3>{loading ? "..." : resolvedCount}</h3>
            </div>
            <span style={{ fontSize: "1.4rem" }}>✨</span>
          </div>
        </div>

        {/* Main Control & Table Panel */}
        <section className="panel full-panel">
          <div className="filter-bar">
            <div className="filter-group">
              {STATUS_FILTERS.map((f) => {
                const count = getFilterCount(f);
                return (
                  <button
                    key={f}
                    type="button"
                    className={`filter-btn ${activeFilter === f ? "active" : ""}`}
                    onClick={() => setActiveFilter(f)}
                  >
                    <span>
                      {f === "all"
                        ? "All Enquiries"
                        : f === "unread"
                        ? "Unread"
                        : f.charAt(0).toUpperCase() + f.slice(1)}
                    </span>
                    <span className="filter-badge-count">{count}</span>
                  </button>
                );
              })}
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
                placeholder="Search name, email, company, category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="search-box-input"
              />
              {search ? (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => setSearch("")}
                  title="Clear search query"
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
              <p>Fetching enquiries from server...</p>
            </div>
          ) : filteredEnquiries.length === 0 ? (
            <div className="empty-state">
              <p>No client enquiries match your selected filters or search query.</p>
              {search || activeFilter !== "all" ? (
                <button
                  type="button"
                  className="secondary-button"
                  style={{ marginTop: 8 }}
                  onClick={() => {
                    setSearch("");
                    setActiveFilter("all");
                  }}
                >
                  Clear Filters & Search
                </button>
              ) : null}
            </div>
          ) : (
            <>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th style={{ width: "70px" }}>ID</th>
                      <th style={{ width: "110px" }}>Read State</th>
                      <th>Client Name & Email</th>
                      <th>Company</th>
                      <th>Category</th>
                      <th>Status</th>
                      <th>Submission Date</th>
                      <th style={{ textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedEnquiries.map((enquiry) => (
                      <tr
                        key={enquiry.enquiryId}
                        className="clickable-row"
                        onClick={() => router.push(`/enquiries/${enquiry.enquiryId}`)}
                      >
                        <td style={{ color: "var(--text-subtle)", fontFamily: "monospace", fontWeight: 600 }}>
                          {enquiry.enquiryId}
                        </td>
                        <td>
                          {!enquiry.isRead ? (
                            <span className="read-status-badge unread">NEW</span>
                          ) : (
                            <span className="read-status-badge read">Read</span>
                          )}
                        </td>
                        <td>
                          <div className="client-avatar-cell">
                            <div className="client-avatar-circle">
                              {getClientInitial(enquiry.fullName)}
                            </div>
                            <div>
                              <Link
                                href={`/enquiries/${enquiry.enquiryId}`}
                                className="table-link"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {enquiry.fullName}
                              </Link>
                              <div style={{ color: "var(--text-muted)", fontSize: "0.82rem", marginTop: 2 }}>
                                {enquiry.email}
                                {enquiry.phone ? ` • ${enquiry.phone}` : ""}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td style={{ color: enquiry.company ? "var(--text-main)" : "var(--text-subtle)" }}>
                          {enquiry.company || "—"}
                        </td>
                        <td>
                          <span className="category-chip">
                            {enquiry.inquiryType || "General"}
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge ${enquiry.status.toLowerCase()}`}>
                            {enquiry.status}
                          </span>
                        </td>
                        <td style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>
                          {formatDate(enquiry.submittedAt)}
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <div style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
                            <button
                              type="button"
                              className="toggle-read-btn"
                              disabled={updatingIds.includes(enquiry.enquiryId)}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleRead(enquiry.enquiryId, enquiry.isRead);
                              }}
                              title={enquiry.isRead ? "Mark as unread" : "Mark as read"}
                            >
                              {updatingIds.includes(enquiry.enquiryId) ? (
                                <span className="spinner" style={{ width: 12, height: 12 }} />
                              ) : enquiry.isRead ? (
                                "Mark Unread"
                              ) : (
                                "Mark Read"
                              )}
                            </button>
                            <span style={{ color: "var(--gold-primary)", fontWeight: 700, fontSize: "0.9rem" }}>
                              →
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Table Pagination Bar */}
              <div className="table-pagination">
                <div>
                  Showing <strong>{(currentPage - 1) * PAGE_SIZE + 1}</strong> to{" "}
                  <strong>{Math.min(currentPage * PAGE_SIZE, filteredEnquiries.length)}</strong> of{" "}
                  <strong>{filteredEnquiries.length}</strong> enquiries
                </div>
                <div className="pagination-controls">
                  <button
                    type="button"
                    className="pagination-btn"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  >
                    ← Previous
                  </button>
                  <span style={{ color: "var(--gold-light)", fontWeight: 700, padding: "0 6px" }}>
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    type="button"
                    className="pagination-btn"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Next →
                  </button>
                </div>
              </div>
            </>
          )}
        </section>
      </AdminShell>
    </AuthGuard>
  );
}

