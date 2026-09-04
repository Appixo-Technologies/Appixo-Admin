"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { AuthGuard } from "@/app/components/AuthGuard";
import { AdminShell } from "@/app/components/AdminShell";
import { Enquiry, getEnquiryDetails, updateEnquiryStatus } from "@/app/lib/api";

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
  const [successMessage, setSuccessMessage] = useState("");

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
      setSuccessMessage(`Status successfully updated to "${newStatus}"`);
      setTimeout(() => setSuccessMessage(""), 3500);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update status";
      setError(message);
    } finally {
      setIsUpdating(false);
    }
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

  return (
    <AuthGuard>
      <AdminShell>
        <div className="page-header">
          <div>
            <p className="eyebrow">Enquiry #{enquiryId}</p>
            <h1>{enquiry ? enquiry.inquiryType || "Client Enquiry Details" : "Enquiry Details"}</h1>
          </div>
          <Link href="/enquiries" className="secondary-button">
            ← Back to Enquiries
          </Link>
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
            <p>Loading enquiry record...</p>
          </div>
        ) : !enquiry ? (
          <div className="empty-state">
            <p>Enquiry record not found.</p>
            <Link href="/enquiries" className="primary-button" style={{ marginTop: 12 }}>
              Return to Enquiries List
            </Link>
          </div>
        ) : (
          <section className="panel detail-panel">
            <div className="detail-grid">
              <div style={{ background: "rgba(255,255,255,0.02)", padding: 20, borderRadius: 14, border: "1px solid var(--border-subtle)" }}>
                <span className="detail-label">Client Details</span>
                <h3 style={{ margin: "0 0 16px", fontSize: "1.4rem", color: "var(--text-main)" }}>
                  {enquiry.fullName}
                </h3>
                <p style={{ margin: "6px 0", color: "var(--text-muted)" }}>
                  <strong style={{ color: "var(--text-main)" }}>Email:</strong> {enquiry.email}
                </p>
                {enquiry.phone ? (
                  <p style={{ margin: "6px 0", color: "var(--text-muted)" }}>
                    <strong style={{ color: "var(--text-main)" }}>Phone:</strong> {enquiry.phone}
                  </p>
                ) : null}
                {enquiry.location ? (
                  <p style={{ margin: "6px 0", color: "var(--text-muted)" }}>
                    <strong style={{ color: "var(--text-main)" }}>Location:</strong> {enquiry.location}
                  </p>
                ) : null}
              </div>

              <div style={{ background: "rgba(255,255,255,0.02)", padding: 20, borderRadius: 14, border: "1px solid var(--border-subtle)" }}>
                <span className="detail-label">Enquiry Metadata</span>
                <p style={{ margin: "6px 0", color: "var(--text-muted)" }}>
                  <strong style={{ color: "var(--text-main)" }}>Company:</strong> {enquiry.company || "Not specified"}
                </p>
                <p style={{ margin: "6px 0", color: "var(--text-muted)" }}>
                  <strong style={{ color: "var(--text-main)" }}>Category:</strong> <span style={{ color: "var(--gold-light)", fontWeight: 600 }}>{enquiry.inquiryType || "General"}</span>
                </p>
                <p style={{ margin: "6px 0", color: "var(--text-muted)" }}>
                  <strong style={{ color: "var(--text-main)" }}>Submitted At:</strong> {formatDate(enquiry.submittedAt)}
                </p>

                <div className="status-changer">
                  <span className="detail-label" style={{ marginBottom: 0 }}>
                    Status:
                  </span>
                  <select
                    value={selectedStatus}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    disabled={isUpdating}
                    className="status-select"
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

            <div className="message-box">
              <h4>Project Context & Scope Requirements</h4>
              <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.7, color: "var(--text-main)", margin: 0 }}>
                {enquiry.projectContext || "No additional project context provided."}
              </p>
            </div>
          </section>
        )}
      </AdminShell>
    </AuthGuard>
  );
}
