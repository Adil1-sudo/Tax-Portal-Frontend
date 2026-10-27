import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowDownToLine,
  BarChart3,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  FileText,
  Filter,
  Users,
} from "lucide-react";
import {
  getClients,
  getAdminDocuments,
  getAdminDocumentRequests,
  getAdminFees,
} from "../../services/adminApi";
import "./Reports.css";

const unwrapCollection = (result, keys = []) => {
  if (Array.isArray(result)) return result;
  if (!result || typeof result !== "object") return [];

  for (const key of keys) {
    if (Array.isArray(result[key])) return result[key];
  }

  if (result.data && result.data !== result) {
    return unwrapCollection(result.data, keys);
  }

  return [];
};

const firstValue = (...values) =>
  values.find((value) => value !== undefined && value !== null && value !== "");

const normalizeDate = (value) => {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
};

const displayDate = (value) => {
  if (!value) return "—";

  const date = new Date(`${normalizeDate(value)}T12:00:00`);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-PK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const money = (amount, currency = "PKR") => {
  const validCurrency = ["PKR", "USD"].includes(
    String(currency).toUpperCase()
  )
    ? String(currency).toUpperCase()
    : "PKR";

  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: validCurrency,
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);
};

const csvEscape = (value) => {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
};

const normalizeClient = (client) => ({
  id: String(
    firstValue(
      client.id,
      client.clientId,
      client.client_id,
      client.userId,
      client.user_id,
      ""
    )
  ),

  name:
    firstValue(
      client.businessName,
      client.business_name,
      client.companyName,
      client.company_name,
      client.fullName,
      client.full_name,
      client.name,
      client.email
    ) || "Unnamed client",

  email: firstValue(
    client.email,
    client.clientEmail,
    client.client_email,
    ""
  ),

  status: String(
    firstValue(
      client.account_status,
      client.accountStatus,
      client.status,
      client.account_state,
      "pending"
    )
  )
    .trim()
    .toLowerCase(),

  joinedAt: normalizeDate(
    firstValue(
      client.createdAt,
      client.created_at,
      client.joinedAt,
      client.joined_at
    )
  ),
});

const normalizeDocument = (document) => ({
  id: String(firstValue(document.id, document.documentId, "")),
  clientId: String(
    firstValue(document.clientId, document.client_id, document.userId, "")
  ),
  title:
    firstValue(document.title, document.originalName, document.fileName, document.file_name) ||
    "Untitled document",
  status: "Received",
  updatedAt: normalizeDate(
    firstValue(
      document.updatedAt,
      document.updated_at,
      document.uploadedAt,
      document.uploaded_at,
      document.createdAt,
      document.created_at
    )
  ),
});

const normalizeDocumentRequest = (request) => {
  const rawStatus = String(
    firstValue(request.status, "pending")
  ).toLowerCase();

  let status = "Requested";
  if (rawStatus === "completed") status = "Completed";
  if (rawStatus === "cancelled") status = "Cancelled";

  return {
    id: String(firstValue(request.id, request.requestId, "")),
    clientId: String(
      firstValue(request.clientId, request.client_id, request.userId, "")
    ),
    title:
      firstValue(request.title, request.documentTitle, request.document_title) ||
      "Document request",
    status,
    updatedAt: normalizeDate(
      firstValue(
        request.updatedAt,
        request.updated_at,
        request.createdAt,
        request.created_at,
        request.dueDate,
        request.due_date
      )
    ),
  };
};

const normalizeFee = (fee) => {
  const rawStatus = String(firstValue(fee.status, "pending")).toLowerCase();
  const dueDate = normalizeDate(firstValue(fee.dueDate, fee.due_date));
  const today = normalizeDate(new Date());

  let status = rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1);

  if (rawStatus === "pending" && dueDate && dueDate < today) {
    status = "Overdue";
  }

  return {
    id: String(firstValue(fee.id, fee.feeId, "")),
    clientId: String(
      firstValue(fee.clientId, fee.client_id, fee.userId, "")
    ),
    title: firstValue(fee.title, fee.description, "Fee request"),
    amount: Number(fee.amount) || 0,
    currency: String(firstValue(fee.currency, "PKR")).toUpperCase(),
    status,
    createdAt: normalizeDate(
      firstValue(fee.createdAt, fee.created_at, fee.updatedAt)
    ),
    dueDate,
  };
};

const isWithinPeriod = (date, period) => {
  if (period === "all") return true;
  if (!date) return false;

  const recordDate = new Date(`${date}T12:00:00`);
  if (Number.isNaN(recordDate.getTime())) return false;

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - Number(period) + 1);

  return recordDate >= start && recordDate <= end;
};

function Reports() {
  const [period, setPeriod] = useState("30");
  const [selectedClient, setSelectedClient] = useState("all");
  const [reportType, setReportType] = useState("overview");

  const [clients, setClients] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [documentRequests, setDocumentRequests] = useState([]);
  const [fees, setFees] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadReports = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [clientResult, documentResult, requestResult, feeResult] =
        await Promise.all([
          getClients({ page: 1, limit: 100 }),
          getAdminDocuments(),
          getAdminDocumentRequests(),
          getAdminFees({ page: 1, limit: 100 }),
        ]);

      setClients(
        unwrapCollection(clientResult, ["clients", "items", "records"]).map(
          normalizeClient
        )
      );

      setDocuments(
        unwrapCollection(documentResult, ["documents", "items", "records"]).map(
          normalizeDocument
        )
      );

      setDocumentRequests(
        unwrapCollection(requestResult, [
          "requests",
          "documentRequests",
          "items",
          "records",
        ]).map(normalizeDocumentRequest)
      );

      setFees(
        unwrapCollection(feeResult, ["fees", "items", "records"]).map(
          normalizeFee
        )
      );
    } catch (err) {
      setError(err.message || "Unable to load report data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const clientName = useCallback(
    (id) =>
      clients.find((client) => client.id === String(id))?.name ??
      "Unknown client",
    [clients]
  );

const filteredClients = useMemo(
  () =>
    clients.filter(
      (client) =>
        selectedClient === "all" || client.id === selectedClient
    ),
  [clients, selectedClient]
);

  const filteredDocuments = useMemo(
    () =>
      documents.filter(
        (document) =>
          (selectedClient === "all" ||
            document.clientId === selectedClient) &&
          isWithinPeriod(document.updatedAt, period)
      ),
    [documents, period, selectedClient]
  );

  const filteredRequests = useMemo(
    () =>
      documentRequests.filter(
        (request) =>
          (selectedClient === "all" || request.clientId === selectedClient) &&
          isWithinPeriod(request.updatedAt, period)
      ),
    [documentRequests, period, selectedClient]
  );

  const filteredFees = useMemo(
    () =>
      fees.filter(
        (fee) =>
          (selectedClient === "all" || fee.clientId === selectedClient) &&
          isWithinPeriod(fee.createdAt, period)
      ),
    [fees, period, selectedClient]
  );

  const filteredDocumentActivity = useMemo(
    () => [...filteredDocuments, ...filteredRequests],
    [filteredDocuments, filteredRequests]
  );

  const stats = useMemo(() => {
    const activeClients = filteredClients.filter(
      (client) => client.status === "active"
    ).length;
      const pendingApprovals = filteredClients.filter(
      (client) => client.status === "pending"
    ).length;

    const receivedDocuments = filteredDocuments.length;

    const requestedDocuments = filteredRequests.filter(
      (request) => request.status === "Requested"
    ).length;

    const paidFees = filteredFees.filter((fee) => fee.status === "Paid");
    const pendingFees = filteredFees.filter((fee) => fee.status === "Pending");
    const overdueFees = filteredFees.filter((fee) => fee.status === "Overdue");

    const sumCurrency = (records, currency) =>
      records
        .filter((fee) => fee.currency === currency)
        .reduce((sum, fee) => sum + fee.amount, 0);

    const outstandingFees = [...pendingFees, ...overdueFees];

    return {
      activeClients,
      pendingApprovals,
      receivedDocuments,
      requestedDocuments,
      paidCount: paidFees.length,
      pendingCount: pendingFees.length,
      overdueCount: overdueFees.length,
      cancelledCount: filteredFees.filter(
        (fee) => fee.status === "Cancelled"
      ).length,
      paidPKR: sumCurrency(paidFees, "PKR"),
      paidUSD: sumCurrency(paidFees, "USD"),
      outstandingPKR: sumCurrency(outstandingFees, "PKR"),
      outstandingUSD: sumCurrency(outstandingFees, "USD"),
    };
  }, [filteredClients, filteredDocuments, filteredRequests, filteredFees]);

  const activityRows = useMemo(() => {
    const clientRows = filteredClients.map((client) => ({
      date: client.joinedAt,
      category: "Client",
      item: client.name,
      detail: client.status === "active" ? "Active" : client.status,
      clientId: client.id,
    }));

    const documentRows = filteredDocumentActivity.map((document) => ({
      date: document.updatedAt,
      category: "Document",
      item: document.title,
      detail: document.status,
      clientId: document.clientId,
    }));

    const feeRows = filteredFees.map((fee) => ({
      date: fee.createdAt,
      category: "Fee",
      item: fee.title,
      detail: `${fee.status} — ${money(fee.amount, fee.currency)}`,
      clientId: fee.clientId,
    }));

    return [...clientRows, ...documentRows, ...feeRows].sort((a, b) =>
      (b.date || "").localeCompare(a.date || "")
    );
  }, [filteredClients, filteredDocumentActivity, filteredFees]);

  const reportTitle = {
    overview: "Activity overview",
    clients: "Client report",
    documents: "Document report",
    fees: "Fee report",
  }[reportType];

  const exportRows = useMemo(() => {
    if (reportType === "clients") {
      return filteredClients.map((client) => ({
        Date: client.joinedAt,
        Client: client.name,
        Email: client.email,
        Status: client.status,
      }));
    }

    if (reportType === "documents") {
      return filteredDocumentActivity.map((document) => ({
        Date: document.updatedAt,
        Client: clientName(document.clientId),
        Document: document.title,
        Status: document.status,
      }));
    }

    if (reportType === "fees") {
      return filteredFees.map((fee) => ({
        Date: fee.createdAt,
        Client: clientName(fee.clientId),
        "Fee request": fee.title,
        Amount: fee.amount,
        Currency: fee.currency,
        Status: fee.status,
        "Due date": fee.dueDate,
      }));
    }

    return activityRows.map((row) => ({
      Date: row.date,
      Category: row.category,
      Client: clientName(row.clientId),
      Item: row.item,
      Details: row.detail,
    }));
  }, [
    reportType,
    filteredClients,
    filteredDocumentActivity,
    filteredFees,
    activityRows,
    clientName,
  ]);

  const handleExport = () => {
    setNotice("");

    if (!exportRows.length) {
      setNotice("There are no records in the selected report to export.");
      return;
    }

    const headers = Object.keys(exportRows[0]);
    const csv = [
      headers.map(csvEscape).join(","),
      ...exportRows.map((row) =>
        headers.map((header) => csvEscape(row[header])).join(",")
      ),
    ].join("\r\n");

    const blob = new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    const date = new Date().toISOString().slice(0, 10);

    anchor.href = url;
    anchor.download = `your-tax-${reportType}-report-${date}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);

    setNotice("CSV report exported using the currently loaded database records.");
  };

  return (
    <section className="admin-reports" aria-labelledby="admin-reports-title">
      <header className="admin-reports__header">
        <div>
          <span className="admin-reports__eyebrow">BUSINESS INSIGHTS</span>
          <h1 id="admin-reports-title">Reports</h1>
          <p>
            Review client activity, document progress, and fee request summaries
            in one place.
          </p>
        </div>

        <button
          type="button"
          className="admin-reports__export-button"
          onClick={handleExport}
          disabled={loading || Boolean(error)}
        >
          <ArrowDownToLine size={18} aria-hidden="true" />
          Export CSV
        </button>
      </header>

      <div className="admin-reports__demo-note" role="note">
        <Activity size={19} aria-hidden="true" />
        <p>
          <strong>Live report data:</strong> Figures are generated from the
          client, document, document-request, and fee APIs. The reports reflect
          the records available to the current admin account.
        </p>
      </div>

      {notice && (
        <p className="admin-reports__notice" role="status">
          {notice}
        </p>
      )}

      {error && (
        <div role="alert" className="admin-reports__notice">
          <p>{error}</p>
          <button type="button" onClick={loadReports}>
            Retry loading reports
          </button>
        </div>
      )}

      {loading && (
        <p role="status" aria-live="polite">
          Loading report data…
        </p>
      )}

      <section className="admin-reports__filters" aria-label="Report filters">
        <div className="admin-reports__filters-title">
          <Filter size={18} aria-hidden="true" />
          <h2>Report filters</h2>
        </div>

        <div className="admin-reports__filter-grid">
          <label className="admin-reports__field">
            <span>Reporting period</span>
            <select
              value={period}
              onChange={(event) => setPeriod(event.target.value)}
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="all">All records</option>
            </select>
          </label>

          <label className="admin-reports__field">
            <span>Client</span>
            <select
              value={selectedClient}
              onChange={(event) => setSelectedClient(event.target.value)}
            >
              <option value="all">All clients</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </label>

          <label className="admin-reports__field">
            <span>Report type</span>
            <select
              value={reportType}
              onChange={(event) => setReportType(event.target.value)}
            >
              <option value="overview">Activity overview</option>
              <option value="clients">Client report</option>
              <option value="documents">Document report</option>
              <option value="fees">Fee report</option>
            </select>
          </label>
        </div>

        <p className="admin-reports__filter-hint">
          The period filter uses the record creation, upload, or update date.
          Summary amounts remain separated by currency and are not converted.
        </p>
      </section>

      <div className="admin-reports__section-heading">
        <div>
          <span>SUMMARY</span>
          <h2>Key performance indicators</h2>
        </div>
        <span className="admin-reports__period-chip">
          <CalendarDays size={14} aria-hidden="true" />
          {period === "all" ? "All records" : `Last ${period} days`}
        </span>
      </div>

      <div className="admin-reports__stats">
        <article className="admin-reports__stat">
          <div className="admin-reports__stat-icon admin-reports__stat-icon--blue">
            <Users size={21} aria-hidden="true" />
          </div>
          <p>Active clients</p>
          <strong>{stats.activeClients}</strong>
          <span>{stats.pendingApprovals} pending approvals in filtered records</span>
        </article>

        <article className="admin-reports__stat">
          <div className="admin-reports__stat-icon admin-reports__stat-icon--teal">
            <FileText size={21} aria-hidden="true" />
          </div>
          <p>Documents received</p>
          <strong>{stats.receivedDocuments}</strong>
          <span>{stats.requestedDocuments} still requested</span>
        </article>

        <article className="admin-reports__stat">
          <div className="admin-reports__stat-icon admin-reports__stat-icon--green">
            <CheckCircle2 size={21} aria-hidden="true" />
          </div>
          <p>Paid fee requests</p>
          <strong>{stats.paidCount}</strong>
          <span>
            {money(stats.paidPKR, "PKR")} PKR · {money(stats.paidUSD, "USD")} USD
          </span>
        </article>

        <article className="admin-reports__stat">
          <div className="admin-reports__stat-icon admin-reports__stat-icon--orange">
            <CircleDollarSign size={21} aria-hidden="true" />
          </div>
          <p>Outstanding fees</p>
          <strong>{stats.pendingCount + stats.overdueCount}</strong>
          <span>
            {money(stats.outstandingPKR, "PKR")} PKR ·{" "}
            {money(stats.outstandingUSD, "USD")} USD
          </span>
        </article>
      </div>

      <div className="admin-reports__secondary-stats">
        <div>
          <span>Overdue fee requests</span>
          <strong>{stats.overdueCount}</strong>
        </div>
        <div>
          <span>Cancelled fee requests</span>
          <strong>{stats.cancelledCount}</strong>
        </div>
        <div>
          <span>Total activity records</span>
          <strong>{activityRows.length}</strong>
        </div>
      </div>

      <section className="admin-reports__activity">
        <div className="admin-reports__activity-header">
          <div>
            <span className="admin-reports__eyebrow">LATEST RECORDS</span>
            <h2>{reportTitle}</h2>
            <p>
              Filtered database records for the selected client and period.
            </p>
          </div>
          <BarChart3 size={25} aria-hidden="true" />
        </div>

        {loading ? (
          <p>Preparing report records…</p>
        ) : activityRows.length > 0 ? (
          <div className="admin-reports__table-wrap">
            <table className="admin-reports__table">
              <thead>
                <tr>
                  <th scope="col">Date</th>
                  <th scope="col">Category</th>
                  <th scope="col">Client</th>
                  <th scope="col">Record</th>
                  <th scope="col">Details</th>
                </tr>
              </thead>
              <tbody>
                {activityRows.slice(0, 12).map((row, index) => (
                  <tr
                    key={`${row.category}-${row.clientId}-${row.date}-${index}`}
                  >
                    <td>{displayDate(row.date)}</td>
                    <td>
                      <span
                        className={`admin-reports__category admin-reports__category--${row.category.toLowerCase()}`}
                      >
                        {row.category}
                      </span>
                    </td>
                    <td>{clientName(row.clientId)}</td>
                    <td className="admin-reports__record-name">{row.item}</td>
                    <td>{row.detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="admin-reports__empty">
            <BriefcaseBusiness size={32} aria-hidden="true" />
            <h3>No records for these filters</h3>
            <p>
              Try another reporting period or client, or check whether records
              exist in the connected modules.
            </p>
          </div>
        )}

        <p className="admin-reports__table-note">
          The table shows up to 12 recent activity records. CSV export includes
          all records matching the selected filters and report type.
        </p>
      </section>

      <section className="admin-reports__currency-note">
        <CircleDollarSign size={19} aria-hidden="true" />
        <p>
          <strong>Currency handling:</strong> PKR and USD totals are kept
          separate. Paid totals use fees marked as paid; outstanding totals use
          pending and overdue fees. No exchange-rate conversion is applied.
        </p>
      </section>
    </section>
  );
}

export default Reports;
