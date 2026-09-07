"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { AuthGuard } from "@/app/components/AuthGuard";
import { AdminShell } from "@/app/components/AdminShell";
import { Enquiry, getEnquiryDetails, updateEnquiryStatus, updateEnquiryReadStatus } from "@/app/lib/api";

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "in-progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

export default function EnquiryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const enquiryId = resolvedParams.id;

  const [enquiry, setEnquiry] = useState<Enquiry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isReadState, setIsReadState] = useState(true);
  const [isTogglingRead, setIsTogglingRead] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [copiedField, setCopiedField] = useState("");

  useEffect(() => {
    let mounted = true;
    async function loadEnquiry() {
      try {
        setLoading(true);
        setError("");
        const data = await getEnquiryDetails(enquiryId);
        if (mounted) {
          setEnquiry(data);
          setSelectedStatus(data.status);
          setIsReadState(data.isRead ?? true);
        }
      } catch (err: unknown) {
        if (mounted) {
          const message = err instanceof Error ? err.message : "Failed to load enquiry details";
          setError(message);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadEnquiry();
    return () => {
      mounted = false;
    };
  }, [enquiryId]);

  const handleStatusChange = async (newStatus: string) => {
    setSelectedStatus(newStatus);
    setIsUpdating(true);
    setError("");
    setSuccessMessage("");

    try {
      await updateEnquiryStatus(enquiryId, newStatus);
      if (enquiry) {
        setEnquiry({ ...enquiry, status: newStatus });
      }
      setSuccessMessage(`Status updated to "${newStatus.replace("_", " ")}"`);
      setTimeout(() => setSuccessMessage(""), 3500);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update status";
      setError(message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReadToggle = async () => {
    const nextState = !isReadState;
    setIsTogglingRead(true);
    setError("");
    try {
      await updateEnquiryReadStatus(enquiryId, nextState);
      setIsReadState(nextState);
      if (enquiry) {
        setEnquiry({ ...enquiry, isRead: nextState });
      }
      setSuccessMessage(`Marked enquiry as ${nextState ? "Read" : "Unread"}`);
      setTimeout(() => setSuccessMessage(""), 3500);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to toggle read state";
      setError(message);
    } finally {
      setIsTogglingRead(false);
    }
  };

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(""), 2500);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    try {
      const d = new Date(dateString);
      return d.toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
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
            <p className="eyebrow">Lead Record • ID {enquiryId}</p>
            <h1>{enquiry ? enquiry.fullName : "Enquiry Record"}</h1>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button
              type="button"
              className="toggle-read-btn"
              onClick={handleReadToggle}
              disabled={isTogglingRead || loading}
            >
              {isTogglingRead ? (
                <span className="spinner" style={{ width: 12, height: 12 }} />
              ) : isReadState ? (
                "Mark Unread"
              ) : (
                "Mark Read"
              )}
            </button>
            <Link href="/enquiries" className="secondary-button">
              ← Back to Directory
            </Link>
          </div>
        </div>

        {error ? (
          <div style={{ marginBottom: 20, color: "#ef4444", background: "rgba(239, 68, 68, 0.12)", border: "1px solid rgba(239, 68, 68, 0.3)", padding: 14, borderRadius: 12 }}>
            ⚠️ {error}
          </div>
        ) : null}

        {successMessage ? (
          <div style={{ marginBottom: 20, color: "#4ade80", background: "rgba(34, 197, 94, 0.12)", border: "1px solid rgba(34, 197, 94, 0.3)", padding: 14, borderRadius: 12 }}>
            ✨ {successMessage}
          </div>
        ) : null}

        {loading ? (
          <div className="loading-state">
            <div className="spinner" />
            <p>Fetching client enquiry record from server...</p>
          </div>
        ) : !enquiry ? (
          <div className="empty-state">
            <p>Client enquiry record not found.</p>
            <Link href="/enquiries" className="primary-button" style={{ marginTop: 12 }}>
              Return to Enquiries List
            </Link>
          </div>
        ) : (
          <div>
            {/* Hero Client Summary Header Card */}
            <div className="detail-hero-card">
              <div className="detail-hero-info">
                <div className="detail-hero-avatar">
                  {getClientInitial(enquiry.fullName)}
                </div>
                <div className="detail-hero-text">
                  <h2>{enquiry.fullName}</h2>
                  <div className="detail-hero-meta">
                    <span className="category-chip">
                      {enquiry.inquiryType || "General Enquiry"}
                    </span>
                    {!isReadState ? (
                      <span className="read-status-badge unread">NEW</span>
                    ) : (
                      <span className="read-status-badge read">Read</span>
                    )}
                    <span className={`status-badge ${enquiry.status.toLowerCase()}`}>
                      {enquiry.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Direct Communication Quick Links */}
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {enquiry.email ? (
                  <a
                    href={`mailto:${enquiry.email}?subject=Regarding Your Appixo Enquiry #${enquiryId}`}
                    className="action-chip-btn primary"
                  >
                    <span>✉️ Reply via Email</span>
                  </a>
                ) : null}
                {enquiry.phone ? (
                  <a
                    href={`tel:${enquiry.phone}`}
                    className="action-chip-btn"
                  >
                    <span>📞 Call Client</span>
                  </a>
                ) : null}
              </div>
            </div>

            {/* 3-Column Detailed Information Cards */}
            <div className="detail-cards-grid">
              {/* Card 1: Client Contact & Identity */}
              <div className="detail-info-card">
                <div>
                  <div className="detail-card-header">
                    <span className="detail-card-title">👤 Contact Identity</span>
                    <span style={{ fontSize: "0.85rem" }}>📇</span>
                  </div>
                  <div className="detail-field-group" style={{ marginTop: 14 }}>
                    <div className="detail-field-item">
                      <label>Email Address</label>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                        <span>{enquiry.email}</span>
                        <button
                          type="button"
                          className="toggle-read-btn"
                          style={{ padding: "3px 8px", fontSize: "0.72rem" }}
                          onClick={() => copyToClipboard(enquiry.email, "email")}
                          title="Copy email to clipboard"
                        >
                          {copiedField === "email" ? "Copied! ✓" : "Copy"}
                        </button>
                      </div>
                    </div>

                    {enquiry.phone ? (
                      <div className="detail-field-item">
                        <label>Phone Contact</label>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                          <span>{enquiry.phone}</span>
                          <button
                            type="button"
                            className="toggle-read-btn"
                            style={{ padding: "3px 8px", fontSize: "0.72rem" }}
                            onClick={() => copyToClipboard(enquiry.phone || "", "phone")}
                            title="Copy phone to clipboard"
                          >
                            {copiedField === "phone" ? "Copied! ✓" : "Copy"}
                          </button>
                        </div>
                      </div>
                    ) : null}

                    {enquiry.location ? (
                      <div className="detail-field-item">
                        <label>Location / Region</label>
                        <span>📍 {enquiry.location}</span>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              {/* Card 2: Business & Project Metadata */}
              <div className="detail-info-card">
                <div>
                  <div className="detail-card-header">
                    <span className="detail-card-title">🏢 Business & Category</span>
                    <span style={{ fontSize: "0.85rem" }}>🏷️</span>
                  </div>
                  <div className="detail-field-group" style={{ marginTop: 14 }}>
                    <div className="detail-field-item">
                      <label>Company / Organization</label>
                      <strong>{enquiry.company || "Individual / Not Specified"}</strong>
                    </div>

                    <div className="detail-field-item">
                      <label>Inquiry Classification</label>
                      <div>
                        <span className="category-chip">
                          {enquiry.inquiryType || "General Service"}
                        </span>
                      </div>
                    </div>

                    <div className="detail-field-item">
                      <label>Submission Date & Time</label>
                      <span>🗓️ {formatDate(enquiry.submittedAt)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 3: Status & Management Workflow */}
              <div className="detail-info-card">
                <div>
                  <div className="detail-card-header">
                    <span className="detail-card-title">⚙️ Lifecycle Workflow</span>
                    <span style={{ fontSize: "0.85rem" }}>🔄</span>
                  </div>
                  <div className="detail-field-group" style={{ marginTop: 14 }}>
                    <div className="detail-field-item">
                      <label>Current Status</label>
                      <div>
                        <span className={`status-badge ${selectedStatus.toLowerCase()}`}>
                          {selectedStatus}
                        </span>
                      </div>
                    </div>

                    <div className="detail-field-item">
                      <label>Change Status Level</label>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <select
                          value={selectedStatus}
                          onChange={(e) => handleStatusChange(e.target.value)}
                          disabled={isUpdating}
                          className="status-select"
                          style={{ width: "100%", padding: "10px 12px" }}
                        >
                          {!STATUS_OPTIONS.some((o) => o.value === selectedStatus) && selectedStatus ? (
                            <option value={selectedStatus}>{selectedStatus}</option>
                          ) : null}
                          {STATUS_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                        {isUpdating ? <div className="spinner" style={{ width: 18, height: 18 }} /> : null}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Rich Context & Project Scope Message Container */}
            <div className="context-message-box">
              <div className="context-header">
                <h3>
                  <span>💬</span> Project Context & Requirements Scope
                </h3>
                <span style={{ color: "var(--text-muted)", fontSize: "0.82rem", fontWeight: 600 }}>
                  {enquiry.projectContext ? `${enquiry.projectContext.length} Characters` : "Empty Message"}
                </span>
              </div>
              <div className="context-content">
                {enquiry.projectContext || "No additional project scope or requirements were included with this enquiry."}
              </div>
            </div>
          </div>
        )}
      </AdminShell>
    </AuthGuard>
  );
}

