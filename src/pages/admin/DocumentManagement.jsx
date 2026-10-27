import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FileText,
  FileUp,
  Download,
  Search,
  Send,
  MessageSquare,
  Clock3,
  CheckCircle2,
  FolderOpen,
  X,
  Users,
  ClipboardList,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";

import {
  getClients,
  getAdminDocuments,
  uploadAdminDocument,
  getAdminDocumentRequests,
  createAdminDocumentRequest,
  updateAdminDocumentRequestStatus,
  downloadAdminDocument,
} from "../../services/adminApi";

import "./DocumentManagement.css";

const documentTypes = [
  "Tax document",
  "Identity document",
  "Bank statement",
  "Business record",
  "Receipt or invoice",
  "Other",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_EXTENSIONS = /\.(pdf|png|jpe?g|docx?|xlsx?)$/i;

function unwrapCollection(result, keys) {
  if (Array.isArray(result)) return result;

  const candidates = [
    result,
    result?.data,
    result?.result,
    result?.data?.data,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;

    if (candidate && typeof candidate === "object") {
      for (const key of keys) {
        if (Array.isArray(candidate[key])) {
          return candidate[key];
        }
      }
    }
  }

  return [];
}

function normalizeClient(client) {
  const businessName =
    client.business_name ??
    client.businessName ??
    "";

  return {
    id: client.id ?? client.client_id ?? client.user_id,
    name:
      client.full_name ??
      client.fullName ??
      client.name ??
      "Unnamed client",
    email: client.email ?? "",
    businessName,
  };
}

function normalizeDocument(document) {
  const sourceValue = String(
    document.source ?? document.document_source ?? ""
  ).toLowerCase();

  const originalFilename =
    document.original_filename ??
    document.originalFilename ??
    document.fileName ??
    document.filename ??
    "document";

  const rawDate =
    document.created_at ??
    document.createdAt ??
    document.uploaded_at ??
    document.date ??
    "";

  const visibility =
    document.visibility ??
    document.document_visibility ??
    "client_and_admin";

  return {
    ...document,
    id: document.id ?? document.document_id ?? document.documentId,
    clientId: String(
      document.client_id ??
      document.clientId ??
      ""
    ),
    title: document.title ?? originalFilename,
    type:
      document.document_category ??
      document.category ??
      document.type ??
      "Other",
    source:
      sourceValue === "client_upload"
        ? "Client upload"
        : sourceValue === "admin_upload"
          ? "Admin upload"
          : sourceValue,
    date: rawDate,
    status:
      document.status ??
      (visibility === "admin_only"
        ? "Admin only"
        : sourceValue === "admin_upload"
          ? "Shared with client"
          : "Received"),
    fileName: originalFilename,
    visibility,
  };
}

function normalizeRequest(request) {
  const rawStatus = String(
    request.status ?? "pending"
  ).toLowerCase();

  const statusLabels = {
    pending: "Pending",
    submitted: "Submitted",
    completed: "Completed",
    cancelled: "Cancelled",
  };

  return {
    ...request,
    id: request.id ?? request.request_id ?? request.requestId,
    clientId: String(
      request.client_id ??
      request.clientId ??
      ""
    ),
    title: request.title ?? "Untitled request",
    message: request.message ?? "",
    date:
      request.created_at ??
      request.createdAt ??
      request.date ??
      "",
    status: statusLabels[rawStatus] ?? rawStatus,
    rawStatus,
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
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "CL";
}

function DocumentManagement() {
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState("");

  const [activeTab, setActiveTab] = useState("documents");
  const [documents, setDocuments] = useState([]);
  const [requests, setRequests] = useState([]);

  const [clientsLoading, setClientsLoading] = useState(true);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [updatingRequestId, setUpdatingRequestId] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("All files");

  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadType, setUploadType] = useState("Tax document");
  const [uploadFile, setUploadFile] = useState(null);
  const [visibility, setVisibility] = useState("client_and_admin");

  const [requestTitle, setRequestTitle] = useState("");
  const [requestMessage, setRequestMessage] = useState("");
  const [requestDueDate, setRequestDueDate] = useState("");

  const selectedClient = clients.find(
    (client) => String(client.id) === selectedClientId
  );

  const clearMessages = () => {
    setNotice("");
    setError("");
  };

  // Load registered clients from the database.
  const loadClients = useCallback(async () => {
    setClientsLoading(true);
    setError("");

    try {
      const result = await getClients({
        page: 1,
        limit: 100,
        status: "active",
        search: "",
      });

      const rows = unwrapCollection(result, [
        "clients",
        "items",
        "records",
      ])
        .map(normalizeClient)
        .filter((client) => client.id !== undefined && client.id !== null);

      setClients(rows);

      setSelectedClientId((currentId) => {
        const currentExists = rows.some(
          (client) => String(client.id) === String(currentId)
        );

        return currentExists
          ? String(currentId)
          : rows.length
            ? String(rows[0].id)
            : "";
      });
    } catch (err) {
      setError(err.message || "Unable to load clients.");
      setClients([]);
      setSelectedClientId("");
    } finally {
      setClientsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  // Load documents for the selected client.
  const loadDocuments = useCallback(async () => {
    if (!selectedClientId) {
      setDocuments([]);
      return;
    }

    setDocumentsLoading(true);

    try {
      const result = await getAdminDocuments(selectedClientId);

      const rows = unwrapCollection(result, [
        "documents",
        "items",
        "records",
      ]).map(normalizeDocument);

      setDocuments(rows);
    } catch (err) {
      setDocuments([]);
      setError(err.message || "Unable to load client documents.");
    } finally {
      setDocumentsLoading(false);
    }
  }, [selectedClientId]);

  // Load requests for the selected client.
  const loadRequests = useCallback(async () => {
    if (!selectedClientId) {
      setRequests([]);
      return;
    }

    setRequestsLoading(true);

    try {
      const result = await getAdminDocumentRequests(selectedClientId);

      const rows = unwrapCollection(result, [
        "requests",
        "documentRequests",
        "items",
        "records",
      ]).map(normalizeRequest);

      setRequests(rows);
    } catch (err) {
      setRequests([]);
      setError(err.message || "Unable to load file requests.");
    } finally {
      setRequestsLoading(false);
    }
  }, [selectedClientId]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const clientDocuments = useMemo(() => {
    const query = search.trim().toLowerCase();

    return documents.filter((document) => {
      const matchesClient =
        String(document.clientId) === selectedClientId;

      const matchesSearch =
        !query ||
        [
          document.title,
          document.fileName,
          document.type,
        ].some((value) =>
          String(value ?? "").toLowerCase().includes(query)
        );

      const matchesSource =
        sourceFilter === "All files" ||
        document.source === sourceFilter;

      return matchesClient && matchesSearch && matchesSource;
    });
  }, [documents, selectedClientId, search, sourceFilter]);

  const clientRequests = requests.filter(
    (request) => String(request.clientId) === selectedClientId
  );

  const pendingRequests = clientRequests.filter(
    (request) =>
      request.rawStatus === "pending" ||
      request.rawStatus === "submitted"
  ).length;

  const handleClientChange = (event) => {
    setSelectedClientId(event.target.value);
    setSearch("");
    clearMessages();
  };

const handleUpload = async (event) => {
  event.preventDefault();
  clearMessages();

  // Capture the form before any asynchronous operation.
  const form = event.currentTarget;
  const fileInput = form.querySelector('input[type="file"]');

  if (!selectedClientId) {
    setError("Select a client before uploading a document.");
    return;
  }

  if (!uploadTitle.trim() || !uploadFile) {
    setError("Enter a document title and choose a file.");
    return;
  }

  if (!ALLOWED_EXTENSIONS.test(uploadFile.name)) {
    setError("Choose a PDF, PNG, JPG, Word, or Excel file.");
    return;
  }

  if (uploadFile.size > MAX_FILE_SIZE) {
    setError("The file exceeds the 10 MB upload limit.");
    return;
  }

  setUploading(true);

  try {
    await uploadAdminDocument({
      clientId: selectedClientId,
      title: uploadTitle.trim(),
      category: uploadType,
      visibility,
      file: uploadFile,
    });

    setUploadTitle("");
    setUploadType("Tax document");
    setUploadFile(null);
    setVisibility("client_and_admin");

    // Reset the native file input safely.
    if (fileInput) {
      fileInput.value = "";
    }

    setNotice(
      `Document uploaded successfully for ${
        selectedClient?.name ?? "the client"
      }.`
    );

    setActiveTab("documents");
    await loadDocuments();
  } catch (err) {
    setError(err.message || "Unable to upload the document.");
  } finally {
    setUploading(false);
  }
};


  const handleRequest = async (event) => {
    event.preventDefault();
    clearMessages();

    if (!selectedClientId) {
      setError("Select a client before creating a request.");
      return;
    }

    if (!requestTitle.trim() || !requestMessage.trim()) {
      setError("Complete both the request title and message.");
      return;
    }

    setSubmittingRequest(true);

    try {
      await createAdminDocumentRequest({
        clientId: selectedClientId,
        title: requestTitle.trim(),
        message: requestMessage.trim(),
        dueDate: requestDueDate,
      });

      setRequestTitle("");
      setRequestMessage("");
      setRequestDueDate("");

      setNotice(
        `File request created successfully for ${selectedClient?.name ?? "the client"}.`
      );

      setActiveTab("requests");
      await loadRequests();
    } catch (err) {
      setError(err.message || "Unable to create the file request.");
    } finally {
      setSubmittingRequest(false);
    }
  };

  const handleDownload = async (documentRecord) => {
    clearMessages();
    setDownloadingId(documentRecord.id);

    try {
      await downloadAdminDocument(documentRecord.id);
      setNotice(`Download started for ${documentRecord.fileName}.`);
    } catch (err) {
      setError(err.message || "Unable to download this document.");
    } finally {
      setDownloadingId(null);
    }
  };

  const updateRequestStatus = async (request, status) => {
    clearMessages();
    setUpdatingRequestId(request.id);

    try {
      await updateAdminDocumentRequestStatus(request.id, status);

      setNotice(
        status === "completed"
          ? "The file request was marked as completed."
          : "The file request was cancelled."
      );

      await loadRequests();
    } catch (err) {
      setError(err.message || "Unable to update the file request.");
    } finally {
      setUpdatingRequestId(null);
    }
  };

  const openTab = (tab) => {
    setActiveTab(tab);
    clearMessages();
  };

  const refreshCurrentData = async () => {
    clearMessages();
    await Promise.all([loadDocuments(), loadRequests()]);
  };

  return (
    <div className="document-management">
      <header className="dm-page-header">
        <div>
          <span className="dm-eyebrow">CLIENT OPERATIONS</span>
          <h2>Document Management</h2>
          <p>
            Share files with clients and manage documents they submit.
          </p>
        </div>
      </header>

      {notice && (
        <div className="dm-message dm-message--success" role="status">
          <CheckCircle2 size={18} />
          <span>{notice}</span>
          <button
            type="button"
            aria-label="Dismiss message"
            onClick={() => setNotice("")}
          >
            <X size={17} />
          </button>
        </div>
      )}

      {error && (
        <div className="dm-message dm-message--error" role="alert">
          <X size={18} />
          <span>{error}</span>
          <button
            type="button"
            aria-label="Dismiss error"
            onClick={() => setError("")}
          >
            <X size={17} />
          </button>
        </div>
      )}

      <section className="dm-client-selector">
        <div className="dm-client-selector__label">
          <Users size={20} />
          <div>
            <strong>Select a client</strong>
            <span>All document actions apply to this client.</span>
          </div>
        </div>

        <select
          aria-label="Select client"
          value={selectedClientId}
          onChange={handleClientChange}
          disabled={clientsLoading || clients.length === 0}
        >
          {clients.length === 0 && (
            <option value="">
              {clientsLoading ? "Loading clients..." : "No active clients found"}
            </option>
          )}

          {clients.map((client) => (
            <option key={client.id} value={String(client.id)}>
              {client.name} — {client.email}
            </option>
          ))}
        </select>
      </section>

      {clientsLoading && (
        <p role="status">Loading registered clients...</p>
      )}

      {!clientsLoading && clients.length === 0 && (
        <div className="dm-empty-state">
          <Users size={30} />
          <strong>No active clients available</strong>
          <p>
            Approve a client account first, then return here to manage
            documents for that client.
          </p>
          <button
            type="button"
            className="dm-secondary-button"
            onClick={loadClients}
          >
            <RefreshCw size={16} />
            Reload clients
          </button>
        </div>
      )}

      {selectedClient && (
        <>
          <section className="dm-client-summary">
            <div className="dm-client-summary__avatar">
              {getInitials(selectedClient.name)}
            </div>

            <div className="dm-client-summary__details">
              <span>Selected client</span>
              <strong>{selectedClient.name}</strong>
              <small>{selectedClient.email}</small>
            </div>

            <div className="dm-client-summary__stats">
              <div>
                <strong>
                  {
                    documents.filter(
                      (item) =>
                        String(item.clientId) === selectedClientId
                    ).length
                  }
                </strong>
                <span>Documents</span>
              </div>
              <div>
                <strong>{pendingRequests}</strong>
                <span>Open requests</span>
              </div>
            </div>
          </section>

          <nav className="dm-tabs" aria-label="Document management sections">
            <button
              type="button"
              className={
                activeTab === "documents"
                  ? "dm-tab dm-tab--active"
                  : "dm-tab"
              }
              aria-current={activeTab === "documents" ? "page" : undefined}
              onClick={() => openTab("documents")}
            >
              <FolderOpen size={17} />
              Client documents
            </button>

            <button
              type="button"
              className={
                activeTab === "upload"
                  ? "dm-tab dm-tab--active"
                  : "dm-tab"
              }
              aria-current={activeTab === "upload" ? "page" : undefined}
              onClick={() => openTab("upload")}
            >
              <FileUp size={17} />
              Upload for client
            </button>

            <button
              type="button"
              className={
                activeTab === "requests"
                  ? "dm-tab dm-tab--active"
                  : "dm-tab"
              }
              aria-current={activeTab === "requests" ? "page" : undefined}
              onClick={() => openTab("requests")}
            >
              <ClipboardList size={17} />
              File requests
              {pendingRequests > 0 && (
                <span className="dm-tab__count">{pendingRequests}</span>
              )}
            </button>

            <button
              type="button"
              className={
                activeTab === "new-request"
                  ? "dm-tab dm-tab--active"
                  : "dm-tab"
              }
              aria-current={activeTab === "new-request" ? "page" : undefined}
              onClick={() => openTab("new-request")}
            >
              <MessageSquare size={17} />
              Request a file
            </button>
          </nav>

          {activeTab === "documents" && (
            <section className="dm-panel">
              <div className="dm-panel__header">
                <div>
                  <h3>Client documents</h3>
                  <p>
                    Review uploaded files and documents shared by the admin.
                  </p>
                </div>

                <button
                  type="button"
                  className="dm-secondary-button"
                  onClick={refreshCurrentData}
                  disabled={documentsLoading || requestsLoading}
                >
                  <RefreshCw size={16} />
                  Refresh
                </button>
              </div>

              <div className="dm-filters">
                <label className="dm-search">
                  <Search size={17} />
                  <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search this client's files..."
                    aria-label="Search client documents"
                  />
                </label>

                <select
                  value={sourceFilter}
                  onChange={(event) => setSourceFilter(event.target.value)}
                  aria-label="Filter documents by source"
                >
                  <option>All files</option>
                  <option>Client upload</option>
                  <option>Admin upload</option>
                </select>
              </div>

              {documentsLoading ? (
                <p role="status">Loading documents...</p>
              ) : clientDocuments.length > 0 ? (
                <div className="dm-document-list">
                  {clientDocuments.map((document) => (
                    <article
                      className="dm-document-card"
                      key={document.id}
                    >
                      <div className="dm-file-icon">
                        <FileText size={23} />
                      </div>

                      <div className="dm-document-card__details">
                        <strong>{document.title}</strong>
                        <span>{document.fileName}</span>
                        <div className="dm-document-card__meta">
                          <span>{document.type}</span>
                          <span>{document.source}</span>
                          <span>{formatDate(document.date)}</span>
                        </div>
                      </div>

                      <div className="dm-document-card__right">
                        <span
                          className={`dm-file-status ${
                            document.status === "Needs review"
                              ? "dm-file-status--review"
                              : "dm-file-status--received"
                          }`}
                        >
                          {document.status}
                        </span>

                        <button
                          type="button"
                          className="dm-download-button"
                          onClick={() => handleDownload(document)}
                          disabled={downloadingId === document.id}
                          title={`Download ${document.fileName}`}
                        >
                          <Download size={16} />
                          {downloadingId === document.id
                            ? "Preparing..."
                            : "Download"}
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="dm-empty-state">
                  <FolderOpen size={30} />
                  <strong>No matching documents</strong>
                  <p>
                    No documents match this client and your current filters.
                  </p>
                  <button
                    type="button"
                    className="dm-primary-button"
                    onClick={() => openTab("upload")}
                  >
                    <FileUp size={17} />
                    Upload a document
                  </button>
                </div>
              )}
            </section>
          )}

          {activeTab === "upload" && (
            <section className="dm-panel">
              <div className="dm-panel__header">
                <div>
                  <h3>Upload a document</h3>
                  <p>
                    Upload a file for {selectedClient.name}.
                  </p>
                </div>
                <FileUp size={23} />
              </div>

              <form className="dm-form" onSubmit={handleUpload}>
                <div className="dm-form__grid">
                  <label className="dm-field">
                    <span>Document title *</span>
                    <input
                      value={uploadTitle}
                      onChange={(event) =>
                        setUploadTitle(event.target.value)
                      }
                      placeholder="e.g. Tax return supporting documents"
                      required
                      maxLength={120}
                    />
                  </label>

                  <label className="dm-field">
                    <span>Document type *</span>
                    <select
                      value={uploadType}
                      onChange={(event) => setUploadType(event.target.value)}
                      required
                    >
                      {documentTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <label className="dm-field">
                  <span>Client visibility *</span>
                  <select
                    value={visibility}
                    onChange={(event) => setVisibility(event.target.value)}
                    required
                  >
                    <option value="client_and_admin">
                      Visible to client and admin
                    </option>
                    <option value="admin_only">
                      Admin only — private
                    </option>
                  </select>
                </label>

                <label className="dm-upload-zone">
                  <FileUp size={29} />
                  <strong>
                    {uploadFile
                      ? uploadFile.name
                      : "Choose a document to upload"}
                  </strong>
                  <span>
                    PDF, PNG, JPG, DOC, DOCX, XLS, or XLSX · Maximum 10 MB
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.xls,.xlsx"
                    onChange={(event) => {
                      setUploadFile(event.target.files?.[0] || null);
                      setError("");
                    }}
                    required
                  />
                </label>

                {uploadFile && (
                  <div className="dm-selected-file">
                    <FileText size={18} />
                    <span>{uploadFile.name}</span>
                    <button
                      type="button"
                      aria-label="Remove selected file"
                      onClick={() => setUploadFile(null)}
                    >
                      <X size={17} />
                    </button>
                  </div>
                )}

                <div className="dm-form__actions">
                  <button
                    type="button"
                    className="dm-secondary-button"
                    disabled={uploading}
                    onClick={() => {
                      setUploadTitle("");
                      setUploadType("Tax document");
                      setUploadFile(null);
                      setVisibility("client_and_admin");
                      setError("");
                    }}
                  >
                    Clear form
                  </button>

                  <button
                    type="submit"
                    className="dm-primary-button"
                    disabled={uploading}
                  >
                    <FileUp size={17} />
                    {uploading ? "Uploading..." : "Upload document"}
                  </button>
                </div>
              </form>
            </section>
          )}

          {activeTab === "requests" && (
            <section className="dm-panel">
              <div className="dm-panel__header">
                <div>
                  <h3>File requests and messages</h3>
                  <p>Requests associated with {selectedClient.name}.</p>
                </div>
                <MessageSquare size={22} />
              </div>

              {requestsLoading ? (
                <p role="status">Loading file requests...</p>
              ) : clientRequests.length > 0 ? (
                <div className="dm-request-list">
                  {clientRequests.map((request) => (
                    <article className="dm-request-card" key={request.id}>
                      <div className="dm-request-card__top">
                        <div className="dm-request-card__icon">
                          {request.rawStatus === "completed" ? (
                            <CheckCircle2 size={20} />
                          ) : (
                            <Clock3 size={20} />
                          )}
                        </div>

                        <div className="dm-request-card__heading">
                          <strong>{request.title}</strong>
                          <span>Created {formatDate(request.date)}</span>
                        </div>

                        <span
                          className={`dm-file-status ${
                            request.rawStatus === "pending" ||
                            request.rawStatus === "submitted"
                              ? "dm-file-status--review"
                              : "dm-file-status--received"
                          }`}
                        >
                          {request.status}
                        </span>
                      </div>

                      <p>{request.message || "No additional message."}</p>

                      {request.due_date && (
                        <p>Due date: {formatDate(request.due_date)}</p>
                      )}

                      {(request.rawStatus === "pending" ||
                        request.rawStatus === "submitted") && (
                        <div className="dm-form__actions">
                          <button
                            type="button"
                            className="dm-secondary-button"
                            disabled={updatingRequestId === request.id}
                            onClick={() =>
                              updateRequestStatus(request, "cancelled")
                            }
                          >
                            Cancel request
                          </button>

                          <button
                            type="button"
                            className="dm-primary-button"
                            disabled={updatingRequestId === request.id}
                            onClick={() =>
                              updateRequestStatus(request, "completed")
                            }
                          >
                            <CheckCircle2 size={16} />
                            {updatingRequestId === request.id
                              ? "Saving..."
                              : "Mark completed"}
                          </button>
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              ) : (
                <div className="dm-empty-state">
                  <ClipboardList size={30} />
                  <strong>No file requests yet</strong>
                  <p>Create a request for this client to begin tracking it.</p>
                  <button
                    type="button"
                    className="dm-primary-button"
                    onClick={() => openTab("new-request")}
                  >
                    <Send size={16} />
                    Create request
                  </button>
                </div>
              )}
            </section>
          )}

          {activeTab === "new-request" && (
            <section className="dm-panel">
              <div className="dm-panel__header">
                <div>
                  <h3>Request a document</h3>
                  <p>
                    Create a file request for {selectedClient.name}.
                  </p>
                </div>
                <Send size={22} />
              </div>

              <form className="dm-form" onSubmit={handleRequest}>
                <label className="dm-field">
                  <span>Request title *</span>
                  <input
                    value={requestTitle}
                    onChange={(event) => setRequestTitle(event.target.value)}
                    placeholder="e.g. Latest bank statement required"
                    required
                    maxLength={120}
                  />
                </label>

                <label className="dm-field">
                  <span>Message to client *</span>
                  <textarea
                    value={requestMessage}
                    onChange={(event) => setRequestMessage(event.target.value)}
                    placeholder="Explain which file is needed and what the client should provide."
                    rows={5}
                    maxLength={1500}
                    required
                  />
                  <small className="dm-character-count">
                    {requestMessage.length}/1500 characters
                  </small>
                </label>

                <label className="dm-field">
                  <span>Due date (optional)</span>
                  <input
                    type="date"
                    value={requestDueDate}
                    onChange={(event) =>
                      setRequestDueDate(event.target.value)
                    }
                  />
                </label>

                <div className="dm-security-note">
                  <MessageSquare size={18} />
                  <p>
                    This request is saved in the database. Client-side
                    notifications and client document uploads are separate
                    features that still need implementation.
                  </p>
                </div>

                <div className="dm-form__actions">
                  <button
                    type="button"
                    className="dm-secondary-button"
                    disabled={submittingRequest}
                    onClick={() => {
                      setRequestTitle("");
                      setRequestMessage("");
                      setRequestDueDate("");
                      setError("");
                    }}
                  >
                    Clear form
                  </button>

                  <button
                    type="submit"
                    className="dm-primary-button"
                    disabled={submittingRequest}
                  >
                    <Send size={17} />
                    {submittingRequest
                      ? "Creating request..."
                      : "Create file request"}
                  </button>
                </div>
              </form>
            </section>
          )}
        </>
      )}
    </div>
  );
}

export default DocumentManagement;
