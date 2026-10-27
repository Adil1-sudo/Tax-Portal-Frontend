
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  RefreshCw,
  Mail,
  Eye,
  X,
  MessageSquare,
  Clock3,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
} from "lucide-react";
import {
  getAdminEnquiries,
  getAdminEnquiry,
  updateAdminEnquiry,
} from "../../services/adminApi";
import "./AdminEnquiries.css";

const STATUS_OPTIONS = [
  { value: "new", label: "New" },
  { value: "in_progress", label: "In progress" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

function unwrapEnquiries(result) {
  const candidates = [
    result?.data?.enquiries,
    result?.data?.items,
    result?.data?.records,
    result?.data,
    result?.enquiries,
    result?.items,
    result?.records,
  ];

  return candidates.find(Array.isArray) || [];
}

function normalizeEnquiry(item) {
  return {
    ...item,
    id: item.id ?? item.enquiryId ?? item.enquiry_id,
    name: item.name ?? item.fullName ?? item.full_name ?? "Unknown",
    email: item.email ?? "",
    subject: item.subject ?? item.service ?? "General enquiry",
    message: item.message ?? item.content ?? "",
    status: String(item.status ?? "new").toLowerCase(),
    createdAt:
      item.createdAt ?? item.created_at ?? item.submittedAt ?? null,
    phone: item.phone ?? "",
  };
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-PK", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function statusLabel(status) {
  return (
    STATUS_OPTIONS.find((option) => option.value === status)?.label ||
    status?.replaceAll("_", " ") ||
    "New"
  );
}

function statusClass(status) {
  if (status === "resolved" || status === "closed") return "success";
  if (status === "in_progress") return "progress";
  return "new";
}

export default function AdminEnquiries() {
  const [enquiries, setEnquiries] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadEnquiries = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await getAdminEnquiries();
      setEnquiries(unwrapEnquiries(result).map(normalizeEnquiry));
    } catch (err) {
      setError(err.message || "Unable to load enquiries.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEnquiries();
  }, [loadEnquiries]);

  const filteredEnquiries = useMemo(() => {
    const term = search.trim().toLowerCase();

    return enquiries.filter((item) => {
      const matchesStatus =
        statusFilter === "all" || item.status === statusFilter;

      const searchableText = [
        item.name,
        item.email,
        item.subject,
        item.message,
        item.phone,
      ]
        .join(" ")
        .toLowerCase();

      return matchesStatus && (!term || searchableText.includes(term));
    });
  }, [enquiries, search, statusFilter]);

  const counts = useMemo(
    () => ({
      total: enquiries.length,
      new: enquiries.filter((item) => item.status === "new").length,
      inProgress: enquiries.filter(
        (item) => item.status === "in_progress"
      ).length,
      resolved: enquiries.filter(
        (item) =>
          item.status === "resolved" || item.status === "closed"
      ).length,
    }),
    [enquiries]
  );

  async function openEnquiry(item) {
    setSelectedEnquiry(item);
    setNotice("");
    setDetailLoading(true);

    try {
      const result = await getAdminEnquiry(item.id);
      const detail =
        result?.data?.enquiry ?? result?.data ?? result?.enquiry ?? result;

      if (detail && typeof detail === "object" && !Array.isArray(detail)) {
        setSelectedEnquiry(normalizeEnquiry({ ...item, ...detail }));
      }
    } catch (err) {
      setNotice(err.message || "Could not load the full enquiry.");
    } finally {
      setDetailLoading(false);
    }
  }

  async function changeStatus(nextStatus) {
    if (!selectedEnquiry?.id || nextStatus === selectedEnquiry.status) {
      return;
    }

    setUpdating(true);
    setNotice("");

    try {
      await updateAdminEnquiry(selectedEnquiry.id, {
        status: nextStatus,
      });

      setSelectedEnquiry((current) =>
        current ? { ...current, status: nextStatus } : current
      );

      setEnquiries((current) =>
        current.map((item) =>
          String(item.id) === String(selectedEnquiry.id)
            ? { ...item, status: nextStatus }
            : item
        )
      );

      setNotice("Enquiry status updated.");
    } catch (err) {
      setNotice(err.message || "Unable to update enquiry status.");
    } finally {
      setUpdating(false);
    }
  }

  return (
    <section className="admin-enquiries">
      <header className="enquiries-heading">
        <div>
          <span className="enquiries-eyebrow">CLIENT COMMUNICATION</span>
          <h1>Contact Enquiries</h1>
          <p>Review messages received through your Zafar Law Chamber website.</p>
        </div>

        <button
          className="enquiries-refresh"
          type="button"
          onClick={loadEnquiries}
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? "is-spinning" : ""} />
          Refresh
        </button>
      </header>

      {error && (
        <div className="enquiries-alert enquiries-alert--error" role="alert">
          <AlertCircle size={18} />
          <span>{error}</span>
          <button type="button" onClick={loadEnquiries}>
            Try again
          </button>
        </div>
      )}

      <div className="enquiries-stats">
        <article className="enquiries-stat">
          <span className="enquiries-stat-icon enquiries-stat-icon--blue">
            <MessageSquare size={19} />
          </span>
          <div>
            <p>Total enquiries</p>
            <strong>{counts.total}</strong>
          </div>
        </article>

        <article className="enquiries-stat">
          <span className="enquiries-stat-icon enquiries-stat-icon--amber">
            <Mail size={19} />
          </span>
          <div>
            <p>New</p>
            <strong>{counts.new}</strong>
          </div>
        </article>

        <article className="enquiries-stat">
          <span className="enquiries-stat-icon enquiries-stat-icon--purple">
            <Clock3 size={19} />
          </span>
          <div>
            <p>In progress</p>
            <strong>{counts.inProgress}</strong>
          </div>
        </article>

        <article className="enquiries-stat">
          <span className="enquiries-stat-icon enquiries-stat-icon--green">
            <CheckCircle2 size={19} />
          </span>
          <div>
            <p>Resolved / closed</p>
            <strong>{counts.resolved}</strong>
          </div>
        </article>
      </div>

      <div className="enquiries-panel">
        <div className="enquiries-toolbar">
          <div className="enquiries-search">
            <Search size={18} />
            <input
              type="search"
              placeholder="Search name, email, subject..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search enquiries"
            />
          </div>

          <label className="enquiries-filter">
            <span>Status</span>
            <span className="enquiries-select-wrap">
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="all">All statuses</option>
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={15} />
            </span>
          </label>
        </div>

        <div className="enquiries-table-wrap">
          <table className="enquiries-table">
            <thead>
              <tr>
                <th>Contact</th>
                <th>Subject</th>
                <th>Date received</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="enquiries-empty">
                    <RefreshCw size={20} className="is-spinning" />
                    <span>Loading enquiries...</span>
                  </td>
                </tr>
              ) : filteredEnquiries.length === 0 ? (
                <tr>
                  <td colSpan="5" className="enquiries-empty">
                    <Mail size={24} />
                    <strong>No enquiries found</strong>
                    <span>
                      {search || statusFilter !== "all"
                        ? "Try changing your search or filter."
                        : "Contact form submissions will appear here."}
                    </span>
                  </td>
                </tr>
              ) : (
                filteredEnquiries.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="enquiries-contact">
                        <span className="enquiries-avatar">
                          {item.name.charAt(0).toUpperCase()}
                        </span>
                        <div>
                          <strong>{item.name}</strong>
                          <span>{item.email || "No email provided"}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="enquiries-subject">{item.subject}</span>
                      <span className="enquiries-message-preview">
                        {item.message}
                      </span>
                    </td>
                    <td className="enquiries-date">
                      {formatDate(item.createdAt)}
                    </td>
                    <td>
                      <span
                        className={`enquiries-status enquiries-status--${statusClass(
                          item.status
                        )}`}
                      >
                        {statusLabel(item.status)}
                      </span>
                    </td>
                    <td>
                      <button
                        className="enquiries-view-btn"
                        type="button"
                        onClick={() => openEnquiry(item)}
                      >
                        <Eye size={15} />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <footer className="enquiries-table-footer">
          Showing {filteredEnquiries.length} of {enquiries.length} enquiries
        </footer>
      </div>

      {selectedEnquiry && (
        <div
          className="enquiries-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedEnquiry(null);
            }
          }}
        >
          <section
            className="enquiries-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="enquiry-detail-title"
          >
            <header className="enquiries-modal-header">
              <div>
                <span className="enquiries-eyebrow">ENQUIRY DETAILS</span>
                <h2 id="enquiry-detail-title">{selectedEnquiry.subject}</h2>
              </div>
              <button
                type="button"
                className="enquiries-close-btn"
                aria-label="Close enquiry details"
                onClick={() => setSelectedEnquiry(null)}
              >
                <X size={20} />
              </button>
            </header>

            {detailLoading ? (
              <div className="enquiries-modal-loading">
                <RefreshCw size={20} className="is-spinning" />
                Loading details...
              </div>
            ) : (
              <>
                <div className="enquiries-detail-grid">
                  <div>
                    <span>Full name</span>
                    <strong>{selectedEnquiry.name}</strong>
                  </div>
                  <div>
                    <span>Email address</span>
                    <strong>{selectedEnquiry.email || "—"}</strong>
                  </div>
                  <div>
                    <span>Phone</span>
                    <strong>{selectedEnquiry.phone || "—"}</strong>
                  </div>
                  <div>
                    <span>Date received</span>
                    <strong>{formatDate(selectedEnquiry.createdAt)}</strong>
                  </div>
                </div>

                <div className="enquiries-message-box">
                  <h3>Message</h3>
                  <p>{selectedEnquiry.message || "No message provided."}</p>
                </div>

                <div className="enquiries-status-editor">
                  <label htmlFor="enquiry-status">Update status</label>
                  <select
                    id="enquiry-status"
                    value={selectedEnquiry.status}
                    disabled={updating}
                    onChange={(event) => changeStatus(event.target.value)}
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                    {!STATUS_OPTIONS.some(
                      (option) => option.value === selectedEnquiry.status
                    ) && (
                      <option value={selectedEnquiry.status}>
                        {statusLabel(selectedEnquiry.status)}
                      </option>
                    )}
                  </select>
                </div>

                {notice && (
                  <p className="enquiries-modal-notice" role="status">
                    {notice}
                  </p>
                )}

                <footer className="enquiries-modal-footer">
                  <button
                    type="button"
                    className="enquiries-secondary-btn"
                    onClick={() => setSelectedEnquiry(null)}
                  >
                    Close
                  </button>

                  {selectedEnquiry.email && (
                    <a
                      className="enquiries-primary-btn"
                      href={`mailto:${selectedEnquiry.email}`}
                    >
                      <Mail size={16} />
                      Reply by email
                    </a>
                  )}
                </footer>
              </>
            )}
          </section>
        </div>
      )}
    </section>
  );
}
