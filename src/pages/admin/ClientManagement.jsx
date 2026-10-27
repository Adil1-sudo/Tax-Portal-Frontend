import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  Users,
  Clock3,
  UserCheck,
  UserX,
  Eye,
  Check,
  X,
  ArrowLeft,
  Mail,
  Phone,
  Building2,
  CalendarDays,
  ShieldCheck,
  Filter,
  RefreshCw,
} from "lucide-react";

import {
  getClients,
  updateClientStatus,
} from "../../services/adminApi";

import "./ClientManagement.css";

const statusOptions = [
  { label: "All statuses", value: "" },
  { label: "Pending", value: "pending" },
  { label: "Active", value: "active" },
  { label: "Rejected", value: "rejected" },
  { label: "Suspended", value: "suspended" },
];

const PAGE_SIZE = 10;

/**
 * Normalize the API response fields so the UI consistently uses:
 * full_name, account_status, business_name, phone, and joinDate.
 */
function normalizeClient(client) {
  const businessName =
    client.business_name ??
    client.businessName ??
    "";

  return {
    ...client,
    id: client.id ?? client.client_id ?? client.user_id,
    full_name:
      client.full_name ??
      client.fullName ??
      client.name ??
      "Unnamed client",
    email: client.email ?? "",
    phone: client.phone ?? client.profile_phone ?? "",
    business_name: businessName,
    type:
      client.type ??
      client.client_type ??
      client.business_type ??
      (businessName ? "Business" : "Individual"),
    account_status: String(
      client.account_status ??
      client.accountStatus ??
      client.status ??
      "pending"
    ).toLowerCase(),
    joinDate:
      client.joinDate ??
      client.created_at ??
      client.createdAt ??
      client.registration_date ??
      "",
  };
}

function getApiClients(result) {
  const data = result?.data;

  const rows =
    result?.clients ??
    data?.clients ??
    result?.items ??
    data?.items ??
    (Array.isArray(data) ? data : null) ??
    (Array.isArray(result) ? result : null);

  return Array.isArray(rows) ? rows.map(normalizeClient) : [];
}

function getPagination(result, currentPage) {
  const pagination =
    result?.pagination ??
    result?.data?.pagination ??
    {};

  const total = Number(
    pagination.total ??
    pagination.totalItems ??
    result?.total ??
    result?.totalItems ??
    result?.data?.total ??
    0
  );

  const totalPages = Number(
    pagination.totalPages ??
    result?.totalPages ??
    result?.data?.totalPages ??
    (total > 0 ? Math.ceil(total / PAGE_SIZE) : currentPage)
  );

  return {
    total,
    totalPages: Math.max(1, totalPages || 1),
  };
}

function formatDate(value) {
  if (!value) return "Not provided";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value).split("T")[0];
  }

  return date.toLocaleDateString("en-PK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getInitials(name = "") {
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return initials || "CL";
}

function ClientManagement() {
  const [selectedClient, setSelectedClient] = useState(null);
  const [confirmation, setConfirmation] = useState(null);
  const [notice, setNotice] = useState("");

  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalClients, setTotalClients] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [actionLoading, setActionLoading] = useState(false);

  // Load client records from the protected backend API.
  const loadClients = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await getClients({
        page,
        limit: PAGE_SIZE,
        status: statusFilter,
        search: search.trim(),
      });

      const rows = getApiClients(result);
      const pagination = getPagination(result, page);

      setClients(rows);
      setTotalClients(
        pagination.total > 0 ? pagination.total : rows.length
      );
      setTotalPages(pagination.totalPages);

      // Refresh the open profile with the latest record when possible.
      setSelectedClient((current) => {
        if (!current) return null;

        const updatedClient = rows.find(
          (client) => String(client.id) === String(current.id)
        );

        return updatedClient ?? current;
      });
    } catch (err) {
      setError(err.message || "Unable to load clients.");
      setClients([]);
      setTotalClients(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, search]);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  // Search and filters always return to the first page.
  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setPage(1);
    setNotice("");
  };

  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
    setPage(1);
    setNotice("");
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("");
    setPage(1);
    setNotice("");
  };

  const counts = useMemo(
    () => ({
      total: totalClients,
      pending: clients.filter(
        (client) => client.account_status === "pending"
      ).length,
      active: clients.filter(
        (client) => client.account_status === "active"
      ).length,
      rejected: clients.filter(
        (client) => client.account_status === "rejected"
      ).length,
    }),
    [clients, totalClients]
  );

  const filteredClients = useMemo(() => {
    const query = search.trim().toLowerCase();

    return clients.filter((client) => {
      const matchesSearch =
        !query ||
        [
          client.full_name,
          client.email,
          client.business_name,
          client.phone,
          client.type,
        ].some((value) =>
          String(value ?? "").toLowerCase().includes(query)
        );

      const matchesStatus =
        !statusFilter ||
        client.account_status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [clients, search, statusFilter]);

  const openClient = (client) => {
    setSelectedClient(client);
    setNotice("");
    setError("");
  };

  const closeProfile = () => {
    setSelectedClient(null);
    setConfirmation(null);
    setNotice("");
  };

  const requestAction = (client, action) => {
    setConfirmation({ client, action });
    setNotice("");
    setError("");
  };

  const confirmAction = async () => {
    if (!confirmation || actionLoading) return;

    const { client, action } = confirmation;

    const statusByAction = {
      approve: "active",
      reject: "rejected",
      suspend: "suspended",
      activate: "active",
    };

    const newStatus = statusByAction[action];

    if (!client.id || !newStatus) {
      setError("The client ID or requested status is invalid.");
      return;
    }

    setActionLoading(true);
    setError("");

    try {
      // The backend validates whether this status transition is allowed.
      await updateClientStatus(client.id, newStatus);

      setConfirmation(null);
      setSelectedClient(null);

      setNotice(
        `${client.full_name}'s account status was updated to ${newStatus}.`
      );

      // Reload the database records rather than relying on local changes.
      await loadClients();
    } catch (err) {
      setError(
        err.message || "Unable to update the client account status."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const actionTitle = {
    approve: "Approve application?",
    reject: "Reject application?",
    suspend: "Suspend client account?",
    activate: "Activate client account?",
  };

  const actionDescription = {
    approve: "The client will be activated and can access the client account.",
    reject: "The pending application will be rejected.",
    suspend: "The active client's access will be suspended.",
    activate: "The suspended client's access will be restored.",
  };

  return (
    <div className="client-management">
      {selectedClient ? (
        <section className="client-profile-view">
          <button
            type="button"
            className="cm-back-button"
            onClick={closeProfile}
          >
            <ArrowLeft size={17} />
            Back to clients
          </button>

          {error && (
            <div className="cm-notice" role="alert">
              <X size={17} />
              {error}
            </div>
          )}

          <div className="cm-profile-header">
            <div className="cm-profile-identity">
              <div className="cm-avatar cm-avatar--large">
                {getInitials(selectedClient.full_name)}
              </div>

              <div>
                <span className="cm-eyebrow">CLIENT PROFILE</span>
                <h2>{selectedClient.full_name}</h2>
                <p>{selectedClient.email || "No email provided"}</p>
              </div>
            </div>

            <span
              className={`cm-status cm-status--${selectedClient.account_status}`}
            >
              {selectedClient.account_status}
            </span>
          </div>

          <div className="cm-profile-card">
            <div className="cm-section-heading">
              <div>
                <h3>Account information</h3>
                <p>Client registration details from the database</p>
              </div>
              <ShieldCheck size={22} />
            </div>

            <div className="cm-detail-grid">
              <div className="cm-detail-item">
                <span>
                  <Users size={16} /> Full name
                </span>
                <strong>{selectedClient.full_name}</strong>
              </div>

              <div className="cm-detail-item">
                <span>
                  <Mail size={16} /> Email address
                </span>
                <strong>{selectedClient.email || "Not provided"}</strong>
              </div>

              <div className="cm-detail-item">
                <span>
                  <Phone size={16} /> Phone number
                </span>
                <strong>{selectedClient.phone || "Not provided"}</strong>
              </div>

              <div className="cm-detail-item">
                <span>
                  <Building2 size={16} /> Client type
                </span>
                <strong>{selectedClient.type || "Not provided"}</strong>
              </div>

              <div className="cm-detail-item">
                <span>
                  <Building2 size={16} /> Business name
                </span>
                <strong>
                  {selectedClient.business_name || "Not provided"}
                </strong>
              </div>

              <div className="cm-detail-item">
                <span>
                  <CalendarDays size={16} /> Registration date
                </span>
                <strong>{formatDate(selectedClient.joinDate)}</strong>
              </div>
            </div>

            <div className="cm-profile-actions">
              {selectedClient.account_status === "pending" && (
                <>
                  <button
                    type="button"
                    className="cm-button cm-button--success"
                    onClick={() => requestAction(selectedClient, "approve")}
                    disabled={actionLoading}
                  >
                    <Check size={17} />
                    Approve application
                  </button>

                  <button
                    type="button"
                    className="cm-button cm-button--danger-outline"
                    onClick={() => requestAction(selectedClient, "reject")}
                    disabled={actionLoading}
                  >
                    <X size={17} />
                    Reject application
                  </button>
                </>
              )}

              {selectedClient.account_status === "active" && (
                <button
                  type="button"
                  className="cm-button cm-button--danger-outline"
                  onClick={() => requestAction(selectedClient, "suspend")}
                  disabled={actionLoading}
                >
                  <UserX size={17} />
                  Suspend account
                </button>
              )}

              {selectedClient.account_status === "suspended" && (
                <button
                  type="button"
                  className="cm-button cm-button--primary"
                  onClick={() => requestAction(selectedClient, "activate")}
                  disabled={actionLoading}
                >
                  <UserCheck size={17} />
                  Activate account
                </button>
              )}

              {selectedClient.account_status === "rejected" && (
                <p>
                  This application has been rejected. The current backend
                  does not allow rejected accounts to be reactivated.
                </p>
              )}
            </div>
          </div>
        </section>
      ) : (
        <>
          <header className="cm-page-header">
            <div>
              <span className="cm-eyebrow">CLIENT OPERATIONS</span>
              <h2>Client Management</h2>
              <p>
                Review applications and manage client account access.
              </p>
            </div>
          </header>

          {notice && (
            <div className="cm-notice" role="status">
              <Check size={17} />
              {notice}
              <button
                type="button"
                aria-label="Dismiss notice"
                onClick={() => setNotice("")}
              >
                <X size={17} />
              </button>
            </div>
          )}

          {error && (
            <div className="cm-notice" role="alert">
              <X size={17} />
              {error}
              <button
                type="button"
                aria-label="Dismiss error"
                onClick={() => setError("")}
              >
                <X size={17} />
              </button>
            </div>
          )}

          <section className="cm-stat-grid" aria-label="Client statistics">
            <article className="cm-stat-card">
              <div className="cm-stat-card__icon cm-stat-card__icon--blue">
                <Users size={21} />
              </div>
              <span>Total clients</span>
              <strong>{counts.total}</strong>
              <small>Matching database records</small>
            </article>

            <article className="cm-stat-card">
              <div className="cm-stat-card__icon cm-stat-card__icon--orange">
                <Clock3 size={21} />
              </div>
              <span>Pending approval</span>
              <strong>{counts.pending}</strong>
              <small>On the current page</small>
            </article>

            <article className="cm-stat-card">
              <div className="cm-stat-card__icon cm-stat-card__icon--teal">
                <UserCheck size={21} />
              </div>
              <span>Active clients</span>
              <strong>{counts.active}</strong>
              <small>On the current page</small>
            </article>

            <article className="cm-stat-card">
              <div className="cm-stat-card__icon cm-stat-card__icon--red">
                <UserX size={21} />
              </div>
              <span>Rejected applications</span>
              <strong>{counts.rejected}</strong>
              <small>On the current page</small>
            </article>
          </section>

          <section className="cm-directory">
            <div className="cm-directory__header">
              <div>
                <h3>Client directory</h3>
                <p>Search registrations and review account details.</p>
              </div>

              <button
                type="button"
                className="cm-view-button"
                onClick={loadClients}
                disabled={loading}
              >
                <RefreshCw size={16} />
                Refresh
              </button>
            </div>

            <div className="cm-filters">
              <label className="cm-search">
                <Search size={18} />
                <input
                  type="search"
                  value={search}
                  onChange={handleSearchChange}
                  placeholder="Search name, email, or business..."
                  aria-label="Search clients"
                />
              </label>

              <label className="cm-status-filter">
                <Filter size={17} />
                <select
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                  aria-label="Filter clients by status"
                >
                  {statusOptions.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="cm-table-wrap">
              <table className="cm-table">
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Client type</th>
                    <th>Registration date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5}>Loading clients...</td>
                    </tr>
                  ) : filteredClients.length > 0 ? (
                    filteredClients.map((client) => (
                      <tr key={client.id}>
                        <td>
                          <div className="cm-client-cell">
                            <div className="cm-avatar">
                              {getInitials(client.full_name)}
                            </div>

                            <div>
                              <strong>{client.full_name}</strong>
                              <span>{client.email}</span>
                            </div>
                          </div>
                        </td>

                        <td>
                          {client.business_name || client.type || "Individual"}
                        </td>

                        <td>{formatDate(client.joinDate)}</td>

                        <td>
                          <span
                            className={`cm-status cm-status--${client.account_status}`}
                          >
                            {client.account_status}
                          </span>
                        </td>

                        <td>
                          <button
                            type="button"
                            className="cm-view-button"
                            onClick={() => openClient(client)}
                          >
                            <Eye size={16} />
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5}>
                        <div className="cm-empty-state">
                          <Users size={27} />
                          <strong>No clients found</strong>
                          <p>
                            Try a different search term or status filter.
                          </p>
                          <button
                            type="button"
                            className="cm-button cm-button--primary"
                            onClick={clearFilters}
                          >
                            Clear filters
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "12px",
                padding: "16px 0",
              }}
            >
              <span>
                Page {page} of {totalPages}
              </span>

              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  type="button"
                  className="cm-view-button"
                  disabled={loading || page <= 1}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                >
                  Previous
                </button>

                <button
                  type="button"
                  className="cm-view-button"
                  disabled={loading || page >= totalPages}
                  onClick={() =>
                    setPage((current) => Math.min(totalPages, current + 1))
                  }
                >
                  Next
                </button>
              </div>
            </div>
          </section>
        </>
      )}

      {confirmation && (
        <div
          className="cm-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !actionLoading
            ) {
              setConfirmation(null);
            }
          }}
        >
          <section
            className="cm-confirm-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cm-confirm-title"
          >
            <div className="cm-confirm-modal__icon">
              <ShieldCheck size={25} />
            </div>

            <h3 id="cm-confirm-title">
              {actionTitle[confirmation.action]}
            </h3>

            <p>
              {actionDescription[confirmation.action]}{" "}
              Client: <strong>{confirmation.client.full_name}</strong>.
            </p>

            {error && <p role="alert">{error}</p>}

            <div className="cm-confirm-modal__actions">
              <button
                type="button"
                className="cm-button cm-button--neutral"
                onClick={() => setConfirmation(null)}
                disabled={actionLoading}
              >
                Cancel
              </button>

              <button
                type="button"
                className={`cm-button ${
                  confirmation.action === "reject" ||
                  confirmation.action === "suspend"
                    ? "cm-button--danger"
                    : "cm-button--primary"
                }`}
                onClick={confirmAction}
                disabled={actionLoading}
              >
                {actionLoading ? "Saving..." : "Confirm change"}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default ClientManagement;
