
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BadgeDollarSign,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  FileText,
  Plus,
  Search,
  XCircle,
} from "lucide-react";
import {
  getClients,
  getAdminFees,
  createAdminFee,
  updateAdminFeeStatus,
} from "../../services/adminApi";
import "./FeeManagement.css";

const emptyForm = {
  title: "",
  description: "",
  amount: "",
  currency: "PKR",
  dueDate: "",
};

const today = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const normalizeDate = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value.slice(0, 10);
  return "";
};

const formatDate = (value) => {
  const date = normalizeDate(value);
  if (!date) return "Not set";

  const parsed = new Date(`${date}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return "Not set";

  return parsed.toLocaleDateString("en-PK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatAmount = (amount, currency = "PKR") => {
  const safeCurrency = ["PKR", "USD"].includes(
    String(currency).toUpperCase()
  )
    ? String(currency).toUpperCase()
    : "PKR";

  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: safeCurrency,
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);
};

const unwrapCollection = (response, keys) => {
  let current = response;

  for (let depth = 0; depth < 4; depth += 1) {
    if (Array.isArray(current)) return current;
    if (!current || typeof current !== "object") return [];

    const key = keys.find((candidate) =>
      Array.isArray(current[candidate])
    );

    if (key) return current[key];

    if (current.data && typeof current.data === "object") {
      current = current.data;
      continue;
    }

    if (current.result && typeof current.result === "object") {
      current = current.result;
      continue;
    }

    return [];
  }

  return [];
};

const normalizeClient = (client) => ({
  id: Number(client.id ?? client.client_id ?? client.user_id),
  name:
    client.business_name ||
    client.company_name ||
    client.full_name ||
    client.name ||
    client.email ||
    `Client #${client.id ?? client.client_id}`,
  email: client.email || "",
});

const normalizeFee = (fee) => {
  const rawStatus = String(fee.status || "pending").toLowerCase();

  return {
    id: fee.id ?? fee.fee_id,
    clientId: Number(
      fee.clientId ??
      fee.client_id ??
      fee.user_id ??
      fee.client?.id
    ),
    clientName:
      fee.client_name ||
      fee.clientName ||
      fee.client?.name ||
      "",
    title: fee.title || fee.fee_title || "Untitled fee",
    description: fee.description || "",
    amount: Number(fee.amount ?? fee.fee_amount ?? 0),
    currency: String(fee.currency || "PKR").toUpperCase(),
    dueDate: normalizeDate(fee.dueDate ?? fee.due_date),
    status: rawStatus,
    createdAt: normalizeDate(fee.createdAt ?? fee.created_at),
    paidAt: normalizeDate(
      fee.paidAt ?? fee.paid_at ?? fee.payment_date
    ),
  };
};

const getFeeStatus = (fee) => {
  if (fee.status === "pending" && fee.dueDate && fee.dueDate < today()) {
    return "overdue";
  }

  return fee.status;
};

const statusLabel = (status) =>
  status.charAt(0).toUpperCase() + status.slice(1);

function FeeManagement() {
  const [clients, setClients] = useState([]);
  const [fees, setFees] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [busyFeeId, setBusyFeeId] = useState(null);

  const [selectedClientId, setSelectedClientId] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");
  const [confirmCancelId, setConfirmCancelId] = useState(null);

  const clientName = useCallback(
    (clientId, fallback = "") => {
      const client = clients.find(
        (item) => String(item.id) === String(clientId)
      );

      return client?.name || fallback || "Unknown client";
    },
    [clients]
  );

  const loadData = useCallback(async () => {
    setLoading(true);
    setLoadError("");

    try {
      const [clientsResponse, feesResponse] = await Promise.all([
        getClients({ page: 1, limit: 100, status: "active" }),
        getAdminFees(),
      ]);

      const clientRecords = unwrapCollection(clientsResponse, [
        "clients",
        "items",
        "records",
      ]).map(normalizeClient);

      const feeRecords = unwrapCollection(feesResponse, [
        "fees",
        "items",
        "records",
      ]).map(normalizeFee);

      setClients(clientRecords.filter((client) => Number.isFinite(client.id)));
      setFees(feeRecords);
    } catch (error) {
      setLoadError(
        error.message || "Unable to load fee management data."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const visibleFees = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return fees.filter((fee) => {
      const matchesClient =
        selectedClientId === "all" ||
        String(fee.clientId) === selectedClientId;

      const name = clientName(fee.clientId, fee.clientName);

      const matchesSearch =
        !normalizedSearch ||
        fee.title.toLowerCase().includes(normalizedSearch) ||
        fee.description.toLowerCase().includes(normalizedSearch) ||
        name.toLowerCase().includes(normalizedSearch) ||
        String(fee.id).toLowerCase().includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "all" ||
        getFeeStatus(fee) === statusFilter.toLowerCase();

      return matchesClient && matchesSearch && matchesStatus;
    });
  }, [fees, selectedClientId, searchTerm, statusFilter, clientName]);

  const summary = useMemo(() => {
    const activeFees = fees.filter((fee) => fee.status !== "cancelled");
    const pendingFees = activeFees.filter(
      (fee) => getFeeStatus(fee) === "pending"
    );
    const overdueFees = activeFees.filter(
      (fee) => getFeeStatus(fee) === "overdue"
    );
    const paidFees = fees.filter((fee) => fee.status === "paid");

    return {
      outstandingCount: pendingFees.length + overdueFees.length,
      outstandingPKR: activeFees
        .filter(
          (fee) =>
            ["pending", "overdue"].includes(getFeeStatus(fee)) &&
            fee.currency === "PKR"
        )
        .reduce((total, fee) => total + fee.amount, 0),
      overdueCount: overdueFees.length,
      paidCount: paidFees.length,
      paidPKR: paidFees
        .filter((fee) => fee.currency === "PKR")
        .reduce((total, fee) => total + fee.amount, 0),
    };
  }, [fees]);

  const updateForm = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setFormError("");
    setNotice("");
  };

  const handleCreateFee = async (event) => {
    event.preventDefault();
    setFormError("");
    setNotice("");

    if (selectedClientId === "all") {
      setFormError("Select a specific client before creating a fee request.");
      return;
    }

    if (!form.title.trim()) {
      setFormError("Enter a fee request title.");
      return;
    }

    if (
      !form.amount ||
      !Number.isFinite(Number(form.amount)) ||
      Number(form.amount) <= 0
    ) {
      setFormError("Enter a valid amount greater than zero.");
      return;
    }

    if (!form.dueDate) {
      setFormError("Select a payment due date.");
      return;
    }

    if (form.dueDate < today()) {
      setFormError("The due date cannot be in the past.");
      return;
    }

    setSaving(true);

    try {
      await createAdminFee({
        clientId: Number(selectedClientId),
        title: form.title,
        description: form.description,
        amount: form.amount,
        currency: form.currency,
        dueDate: form.dueDate,
      });

      setForm(emptyForm);
      setShowForm(false);
      setStatusFilter("all");
      setSearchTerm("");
      await loadData();

      setNotice(
        `Fee request created for ${clientName(Number(selectedClientId))}.`
      );
    } catch (error) {
      setFormError(error.message || "Unable to create the fee request.");
    } finally {
      setSaving(false);
    }
  };

  const markAsPaid = async (fee) => {
    if (!["pending", "overdue"].includes(getFeeStatus(fee))) return;

    setBusyFeeId(fee.id);
    setNotice("");
    setLoadError("");

    try {
      await updateAdminFeeStatus(fee.id, "paid");
      await loadData();
      setNotice("Fee status updated to paid.");
      setConfirmCancelId(null);
    } catch (error) {
      setLoadError(error.message || "Unable to update the fee status.");
    } finally {
      setBusyFeeId(null);
    }
  };

  const cancelFee = async (fee) => {
    if (!["pending", "overdue"].includes(getFeeStatus(fee))) return;

    setBusyFeeId(fee.id);
    setNotice("");
    setLoadError("");

    try {
      await updateAdminFeeStatus(fee.id, "cancelled");
      await loadData();
      setConfirmCancelId(null);
      setNotice("Fee request cancelled.");
    } catch (error) {
      setLoadError(error.message || "Unable to cancel the fee request.");
    } finally {
      setBusyFeeId(null);
    }
  };

  const resetFilters = () => {
    setSelectedClientId("all");
    setSearchTerm("");
    setStatusFilter("all");
    setNotice("");
    setFormError("");
  };

  return (
    <section
      className="fee-management"
      aria-labelledby="fee-management-title"
    >
      <div className="fee-management__header">
        <div>
          <span className="fee-management__eyebrow">
            FINANCIAL WORKSPACE
          </span>
          <h1 id="fee-management-title">Fee Management</h1>
          <p>
            Create client fee requests and track outstanding and received
            payments.
          </p>
        </div>

        <button
          type="button"
          className="fee-management__primary-button"
          disabled={loading || saving}
          onClick={() => {
            if (selectedClientId === "all") {
              setFormError(
                "Select a specific client before creating a fee request."
              );
              setNotice("");
              return;
            }

            setFormError("");
            setNotice("");
            setShowForm((current) => !current);
          }}
        >
          <Plus size={18} aria-hidden="true" />
          {showForm ? "Close form" : "Create fee request"}
        </button>
      </div>

      <div className="fee-management__demo-notice" role="note">
        <FileText size={18} aria-hidden="true" />
        <p>
          <strong>Payment notice:</strong> Updating a fee to paid records an
          administrative status only. It does not process or verify a bank
          transfer.
        </p>
      </div>

      {notice && (
        <div className="fee-management__notice" role="status">
          <CheckCircle2 size={18} aria-hidden="true" />
          <span>{notice}</span>
          <button
            type="button"
            aria-label="Dismiss notification"
            onClick={() => setNotice("")}
          >
            <XCircle size={18} />
          </button>
        </div>
      )}

      {loadError && (
        <div className="fee-management__error" role="alert">
          <p>{loadError}</p>
          <button
            type="button"
            className="fee-management__secondary-button"
            onClick={loadData}
            disabled={loading}
          >
            Try again
          </button>
        </div>
      )}

      <div className="fee-management__stats">
        <article className="fee-management__stat-card">
          <div className="fee-management__stat-icon fee-management__stat-icon--blue">
            <CircleDollarSign size={22} aria-hidden="true" />
          </div>
          <p>Outstanding requests</p>
          <strong>{loading ? "—" : summary.outstandingCount}</strong>
          <span>
            {loading
              ? "Loading..."
              : `${formatAmount(summary.outstandingPKR, "PKR")} outstanding in PKR`}
          </span>
        </article>

        <article className="fee-management__stat-card">
          <div className="fee-management__stat-icon fee-management__stat-icon--orange">
            <Clock3 size={22} aria-hidden="true" />
          </div>
          <p>Overdue requests</p>
          <strong>{loading ? "—" : summary.overdueCount}</strong>
          <span>Payment due date has passed</span>
        </article>

        <article className="fee-management__stat-card">
          <div className="fee-management__stat-icon fee-management__stat-icon--green">
            <CheckCircle2 size={22} aria-hidden="true" />
          </div>
          <p>Paid requests</p>
          <strong>{loading ? "—" : summary.paidCount}</strong>
          <span>
            {loading
              ? "Loading..."
              : `${formatAmount(summary.paidPKR, "PKR")} recorded in PKR`}
          </span>
        </article>
      </div>

      {showForm && (
        <form className="fee-management__form" onSubmit={handleCreateFee}>
          <div className="fee-management__form-heading">
            <div>
              <h2>New fee request</h2>
              <p>
                Client:{" "}
                <strong>{clientName(Number(selectedClientId))}</strong>
              </p>
            </div>
            <BadgeDollarSign size={28} aria-hidden="true" />
          </div>

          <div className="fee-management__form-grid">
            <label className="fee-management__field fee-management__field--full">
              Fee request title <span aria-hidden="true">*</span>
              <input
                name="title"
                value={form.title}
                onChange={updateForm}
                placeholder="e.g. Annual tax return preparation"
                maxLength={100}
                required
              />
            </label>

            <label className="fee-management__field fee-management__field--full">
              Description
              <textarea
                name="description"
                value={form.description}
                onChange={updateForm}
                placeholder="Explain what this fee covers"
                rows={3}
                maxLength={500}
              />
            </label>

            <label className="fee-management__field">
              Amount <span aria-hidden="true">*</span>
              <input
                name="amount"
                type="number"
                min="0.01"
                step="0.01"
                value={form.amount}
                onChange={updateForm}
                placeholder="Enter amount"
                required
              />
            </label>

            <label className="fee-management__field">
              Currency
              <select
                name="currency"
                value={form.currency}
                onChange={updateForm}
              >
                <option value="PKR">PKR — Pakistani Rupee</option>
                <option value="USD">USD — US Dollar</option>
              </select>
            </label>

            <label className="fee-management__field">
              Payment due date <span aria-hidden="true">*</span>
              <input
                name="dueDate"
                type="date"
                value={form.dueDate}
                min={today()}
                onChange={updateForm}
                required
              />
            </label>
          </div>

          {formError && (
            <p className="fee-management__error" role="alert">
              {formError}
            </p>
          )}

          <div className="fee-management__form-actions">
            <button
              type="button"
              className="fee-management__secondary-button"
              disabled={saving}
              onClick={() => {
                setShowForm(false);
                setForm(emptyForm);
                setFormError("");
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="fee-management__primary-button"
              disabled={saving}
            >
              <Plus size={17} aria-hidden="true" />
              {saving ? "Creating..." : "Create request"}
            </button>
          </div>
        </form>
      )}

      {!showForm && formError && (
        <p className="fee-management__error" role="alert">
          {formError}
        </p>
      )}

      <div className="fee-management__filters">
        <div className="fee-management__filter-heading">
          <div>
            <h2>Client fee requests</h2>
            <p>Review, filter, and update request statuses.</p>
          </div>
          <span className="fee-management__result-count">
            {loading
              ? "Loading..."
              : `${visibleFees.length} ${
                  visibleFees.length === 1 ? "request" : "requests"
                }`}
          </span>
        </div>

        <div className="fee-management__filter-controls">
          <label className="fee-management__search">
            <Search size={18} aria-hidden="true" />
            <span className="fee-management__visually-hidden">
              Search fee requests
            </span>
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by client or fee title"
            />
          </label>

          <label className="fee-management__filter-field">
            <span>Client</span>
            <select
              value={selectedClientId}
              onChange={(event) => {
                setSelectedClientId(event.target.value);
                setFormError("");
                setNotice("");
              }}
            >
              <option value="all">All clients</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </label>

          <label className="fee-management__filter-field">
            <span>Status</span>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
              <option value="paid">Paid</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </label>

          <button
            type="button"
            className="fee-management__reset-button"
            onClick={resetFilters}
          >
            Reset
          </button>
        </div>
      </div>

      <div className="fee-management__table-wrap">
        <table className="fee-management__table">
          <thead>
            <tr>
              <th scope="col">Fee request</th>
              <th scope="col">Client</th>
              <th scope="col">Amount</th>
              <th scope="col">Due date</th>
              <th scope="col">Status</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>

          <tbody>
            {!loading &&
              visibleFees.map((fee) => {
                const status = getFeeStatus(fee);
                const canManage = ["pending", "overdue"].includes(status);
                const busy = String(busyFeeId) === String(fee.id);

                return (
                  <tr key={fee.id}>
                    <td>
                      <div className="fee-management__fee-title">
                        {fee.title}
                      </div>
                      <p className="fee-management__fee-description">
                        {fee.description || "No description supplied."}
                      </p>
                      <span className="fee-management__fee-id">
                        Request #{fee.id}
                      </span>
                    </td>

                    <td>
                      <span className="fee-management__client-name">
                        {clientName(fee.clientId, fee.clientName)}
                      </span>
                    </td>

                    <td>
                      <strong className="fee-management__amount">
                        {formatAmount(fee.amount, fee.currency)}
                      </strong>
                    </td>

                    <td>{formatDate(fee.dueDate)}</td>

                    <td>
                      <span
                        className={`fee-management__status fee-management__status--${status}`}
                      >
                        <span aria-hidden="true" />
                        {statusLabel(status)}
                      </span>
                      {fee.paidAt && (
                        <small className="fee-management__paid-date">
                          Paid {formatDate(fee.paidAt)}
                        </small>
                      )}
                    </td>

                    <td>
                      <div className="fee-management__actions">
                        {canManage ? (
                          <>
                            <button
                              type="button"
                              className="fee-management__action-button fee-management__action-button--paid"
                              disabled={busy || saving || loading}
                              onClick={() => markAsPaid(fee)}
                              aria-label={`Mark ${fee.title} as paid`}
                            >
                              <CheckCircle2 size={15} aria-hidden="true" />
                              {busy ? "Updating..." : "Mark paid"}
                            </button>

                            {confirmCancelId === fee.id ? (
                              <div className="fee-management__cancel-confirm">
                                <span>Cancel this request?</span>
                                <button
                                  type="button"
                                  disabled={busy}
                                  onClick={() => cancelFee(fee)}
                                >
                                  Yes
                                </button>
                                <button
                                  type="button"
                                  disabled={busy}
                                  onClick={() => setConfirmCancelId(null)}
                                >
                                  No
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                className="fee-management__action-button fee-management__action-button--cancel"
                                disabled={busy || saving || loading}
                                onClick={() => setConfirmCancelId(fee.id)}
                                aria-label={`Cancel ${fee.title}`}
                              >
                                <XCircle size={15} aria-hidden="true" />
                                Cancel
                              </button>
                            )}
                          </>
                        ) : (
                          <span className="fee-management__no-action">
                            No actions
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>

        {loading && (
          <div className="fee-management__empty" role="status">
            <p>Loading fee requests from the server...</p>
          </div>
        )}

        {!loading && !loadError && visibleFees.length === 0 && (
          <div className="fee-management__empty">
            <CircleDollarSign size={34} aria-hidden="true" />
            <h3>No fee requests found</h3>
            <p>
              Try changing your search or filters, or create a new request.
            </p>
            <button
              type="button"
              className="fee-management__secondary-button"
              onClick={resetFilters}
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      <p className="fee-management__footnote">
        Fee requests are stored by the backend. Marking one as paid changes
        its administrative status only; verify payment evidence before
        confirming receipt in production.
      </p>
    </section>
  );
}

export default FeeManagement;
