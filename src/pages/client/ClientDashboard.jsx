import { useEffect, useMemo, useState } from "react";
import {
  uploadClientDocument,
  downloadClientDocument,
  getClientProfile,
  updateClientProfile,
  getClientDocuments,
  getClientDocumentRequests,
  createClientDocumentRequest,
  getClientFees,
  submitClientPaymentReference,
  getClientReportSummary,
} from "../../services/clientApi";
import { logout } from "../../services/auth";
import {
  LayoutDashboard,
  Files,
  Wallet,
  ChartNoAxesCombined,
  Settings,
  Menu,
  X,
  Search,
  Bell,
  ChevronDown,
  ChevronRight,
  LogOut,
  Upload,
  Download,
  Eye,
  FileText,
  FileSpreadsheet,
  FileImage,
  File,
  Clock3,
  CircleCheck,
  CircleAlert,
  ArrowUpRight,
  ArrowDownToLine,
  Send,
  UserRound,
  Building2,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  CalendarDays,
  CreditCard,
  RefreshCw,
  MessageSquareText,
  Plus,
  Check,
  LockKeyhole,
  ExternalLink,
} from "lucide-react";
import "./ClientDashboard.css";

const initialDocuments = [
  {
    id: "DOC-104",
    title: "Business Registration Certificate",
    filename: "business-registration.pdf",
    category: "Business",
    date: "2026-10-19",
    status: "Submitted",
    source: "Client upload",
    size: "1.2 MB",
  },
  {
    id: "DOC-103",
    title: "Bank Statement — September",
    filename: "bank-statement-sep.pdf",
    category: "Financial",
    date: "2026-10-17",
    status: "Submitted",
    source: "Client upload",
    size: "840 KB",
  },
  {
    id: "DOC-102",
    title: "National Tax Reference",
    filename: "tax-reference.pdf",
    category: "Tax",
    date: "2026-10-15",
    status: "Completed",
    source: "Admin upload",
    size: "420 KB",
  },
  {
    id: "DOC-101",
    title: "Monthly Sales Record",
    filename: "sales-record.xlsx",
    category: "Financial",
    date: "2026-10-12",
    status: "Pending",
    source: "Document request",
    size: "—",
  },
];

const initialRequests = [
  {
    id: "REQ-204",
    title: "Monthly Sales Record",
    message: "Please provide your sales record for September 2026.",
    dueDate: "2026-10-30",
    status: "Pending",
  },
  {
    id: "REQ-203",
    title: "Purchase Expense Receipts",
    message: "Upload readable copies of your September purchase receipts.",
    dueDate: "2026-11-02",
    status: "Pending",
  },
  {
    id: "REQ-202",
    title: "Business Registration Certificate",
    message: "Your submitted document has been received.",
    dueDate: "2026-10-20",
    status: "Submitted",
  },
];

const initialFees = [
  {
    id: "FEE-301",
    title: "Monthly Accounting Services",
    description: "Accounting services for September 2026.",
    amount: 25000,
    currency: "PKR",
    dueDate: "2026-10-30",
    status: "Pending",
    reference: "",
  },
  {
    id: "FEE-302",
    title: "Tax Return Preparation",
    description: "Preparation and review of the current tax return.",
    amount: 15000,
    currency: "PKR",
    dueDate: "2026-10-10",
    status: "Overdue",
    reference: "",
  },
  {
    id: "FEE-303",
    title: "Previous Month Services",
    description: "Accounting services for August 2026.",
    amount: 20000,
    currency: "PKR",
    dueDate: "2026-09-15",
    status: "Paid",
    reference: "TXN-845192",
  },
];

const initialReports = [
  {
    id: "RPT-401",
    title: "September Accounting Summary",
    category: "Accounting",
    period: "September 2026",
    date: "2026-10-18",
    format: "PDF",
    status: "Available",
    description: "A summary of accounting records shared with your account.",
  },
  {
    id: "RPT-402",
    title: "Quarterly Financial Overview",
    category: "Financial",
    period: "Q3 2026",
    date: "2026-10-15",
    format: "PDF",
    status: "Available",
    description: "An overview of financial information for the third quarter.",
  },
  {
    id: "RPT-403",
    title: "Annual Tax Summary",
    category: "Tax",
    period: "Tax year 2026",
    date: "",
    format: "PDF",
    status: "Not available",
    description: "This report has not been shared with your account yet.",
  },
];

const navigation = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "documents", label: "Document Management", icon: Files },
  { id: "fees", label: "Fee Management", icon: Wallet },
  { id: "reports", label: "Reports", icon: ChartNoAxesCombined },
  { id: "settings", label: "Account Settings", icon: Settings },
];

const initialProfile = {
  fullName: "Alex Morgan",
  email: "alex@example.com",
  businessName: "Morgan Trading Co.",
  phone: "+92 300 1234567",
  address: "Lahore, Pakistan",
  country: "Pakistan",
  taxReference: "NTN-1234567-8",
};

function formatMoney(amount, currency = "PKR") {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);
}


function formatDate(value) {
  if (!value) return "Not set";

  const dateText = String(value);
  const date = new Date(
    /^\d{4}-\d{2}-\d{2}$/.test(dateText)
      ? `${dateText}T00:00:00`
      : dateText
  );

  if (Number.isNaN(date.getTime())) return dateText;

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}


function StatusBadge({ status }) {
  const normalized = String(status || "").toLowerCase();
  let tone = "neutral";

  if (["completed", "paid", "available", "active"].includes(normalized)) {
    tone = "success";
  } else if (["pending", "submitted", "in review"].includes(normalized)) {
    tone = "warning";
  } else if (
    ["overdue", "rejected", "cancelled", "not available"].includes(normalized)
  ) {
    tone = "danger";
  }

  return (
    <span className={`client-status client-status--${tone}`}>
      <span className="client-status__dot" />
      {status || "Unknown"}
    </span>
  );
}

function SectionHeading({ eyebrow, title, description, action }) {
  return (
    <div className="client-section-heading">
      <div>
        {eyebrow && <span className="client-eyebrow">{eyebrow}</span>}
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {action && <div className="client-section-heading__action">{action}</div>}
    </div>
  );
}

function StatCard({ label, value, note, icon: Icon, tone = "blue" }) {
  return (
    <article className="client-stat-card">
      <div className={`client-stat-card__icon client-stat-card__icon--${tone}`}>
        <Icon size={21} strokeWidth={1.8} />
      </div>
      <p className="client-stat-card__label">{label}</p>
      <div className="client-stat-card__value">{value}</div>
      <p className="client-stat-card__note">{note}</p>
    </article>
  );
}

function EmptyState({ icon: Icon = Files, title, description, action }) {
  return (
    <div className="client-empty-state">
      <div className="client-empty-state__icon">
        <Icon size={27} />
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}

function Modal({ title, description, onClose, children, wide = false }) {
  return (
    <div
      className="client-modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className={`client-modal${wide ? " client-modal--wide" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="client-modal__header">
          <div>
            <h2>{title}</h2>
            {description && <p>{description}</p>}
          </div>
          <button
            type="button"
            className="client-icon-button"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={19} />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}

function DocumentIcon({ filename = "" }) {
  const extension = filename.split(".").pop()?.toLowerCase();

  if (["xls", "xlsx", "csv"].includes(extension)) {
    return <FileSpreadsheet size={20} />;
  }
  if (["png", "jpg", "jpeg", "webp"].includes(extension)) {
    return <FileImage size={20} />;
  }
  if (extension === "pdf") return <FileText size={20} />;
  return <File size={20} />;
}

export default function ClientDashboard() {
  const [activeSection, setActiveSection] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [documentSearch, setDocumentSearch] = useState("");
  const [documentFilter, setDocumentFilter] = useState("All");
  const [feeSearch, setFeeSearch] = useState("");
  const [feeFilter, setFeeFilter] = useState("All");
  const [reportSearch, setReportSearch] = useState("");
  const [reportFilter, setReportFilter] = useState("All");
  const [modal, setModal] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadCategory, setUploadCategory] = useState("Tax");
  const [uploadRequestId, setUploadRequestId] = useState("");
  const [requestTitle, setRequestTitle] = useState("");
  const [requestMessage, setRequestMessage] = useState("");
  const [paymentFeeId, setPaymentFeeId] = useState("");
  const [paymentReference, setPaymentReference] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");
  const [reportPreview, setReportPreview] = useState(null);
  const [settingsTab, setSettingsTab] = useState("profile");
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
const [isUploading, setIsUploading] = useState(false);
const [documents, setDocuments] = useState([]);
const [requests, setRequests] = useState([]);
const [fees, setFees] = useState([]);
const [reports] = useState(initialReports);

const [profile, setProfile] = useState(initialProfile);
const [savedProfile, setSavedProfile] = useState(initialProfile);

const [dashboardLoading, setDashboardLoading] = useState(true);
const [dashboardError, setDashboardError] = useState("");
const [reportSummary, setReportSummary] = useState(null);
const [saving, setSaving] = useState(false);

  const activeItem =
    navigation.find((item) => item.id === activeSection) || navigation[0];

  const notify = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 3200);
  };

  const navigate = (section) => {
    setActiveSection(section);
    setSidebarOpen(false);
    setProfileMenuOpen(false);
  };
const handleDocumentDownload = async (documentRecord) => {
  try {
    await downloadClientDocument(documentRecord.id);
    notify("Document download started.");
  } catch (error) {
    notify(error.message || "Unable to download the document.");
  }
};
  const filteredDocuments = useMemo(() => {
    const query = documentSearch.trim().toLowerCase();
    return documents.filter((document) => {
      const matchesSearch =
        !query ||
        [document.title, document.filename, document.id, document.category]
          .join(" ")
          .toLowerCase()
          .includes(query);
      const matchesStatus =
        documentFilter === "All" || document.status === documentFilter;
      return matchesSearch && matchesStatus;
    });
  }, [documents, documentSearch, documentFilter]);

  const filteredFees = useMemo(() => {
    const query = feeSearch.trim().toLowerCase();
    return fees.filter((fee) => {
      const matchesSearch =
        !query ||
        [fee.title, fee.id, fee.description].join(" ").toLowerCase().includes(query);
      const matchesStatus = feeFilter === "All" || fee.status === feeFilter;
      return matchesSearch && matchesStatus;
    });
  }, [fees, feeSearch, feeFilter]);

  const filteredReports = useMemo(() => {
    const query = reportSearch.trim().toLowerCase();
    return reports.filter((report) => {
      const matchesSearch =
        !query ||
        [report.title, report.category, report.period]
          .join(" ")
          .toLowerCase()
          .includes(query);
      const matchesCategory = reportFilter === "All" || report.category === reportFilter;
      return matchesSearch && matchesCategory;
    });
  }, [reports, reportSearch, reportFilter]);
const documentCategories = [
  "Tax document",
  "Identity document",
  "Bank statement",
  "Business record",
  "Receipt or invoice",
  "Other",
];
  const pendingRequestCount = requests.filter(
    (request) => request.status === "Pending"
  ).length;
  const outstandingFees = fees
    .filter((fee) => ["Pending", "Overdue"].includes(fee.status))
    .reduce((total, fee) => total + fee.amount, 0);
  const submittedDocuments = documents.filter(
    (document) => document.source === "Client upload"
  ).length;
  const availableReports = reports.filter(
    (report) => report.status === "Available"
  ).length;

  const openUploadModal = (request = null) => {
    setSelectedFile(null);
    setUploadTitle(request?.title || "");
    setUploadCategory(request?.title?.toLowerCase().includes("bank") ? "Financial" : "Tax");
    setUploadRequestId(request?.id || "");
    setModal({ type: "upload" });
  };

const handleUpload = async (event) => {
  event.preventDefault();

  if (isUploading) return;

  if (!selectedFile) {
    notify("Please choose a file to upload.");
    return;
  }

  if (selectedFile.size > 10 * 1024 * 1024) {
    notify("The selected file exceeds the 10 MB limit.");
    return;
  }

  try {
    setIsUploading(true);

    await uploadClientDocument({
      file: selectedFile,
      title: uploadTitle.trim() || selectedFile.name,
      category: uploadCategory,
      requestId: uploadRequestId || null,
    });

    const [documentResult, requestResult] = await Promise.all([
      getClientDocuments(),
      getClientDocumentRequests(),
    ]);

    const documentRows = documentResult.data;
    const requestRows = requestResult.data;

    setDocuments(
      documentRows.map((item) => ({
        id: item.id,
        title: item.title,
        filename: item.original_filename,
        category: item.document_category || "Other",
        date: item.created_at,
        status:
          item.source === "admin_upload" ? "Completed" : "Submitted",
        source:
          item.source === "admin_upload" ? "Admin upload" : "Client upload",
        size:
          item.file_size >= 1024 * 1024
            ? `${(item.file_size / (1024 * 1024)).toFixed(1)} MB`
            : `${Math.max(1, Math.round(item.file_size / 1024))} KB`,
        requestId: item.request_id,
      }))
    );

    setRequests(
      requestRows.map((item) => ({
        id: item.id,
        title: item.title,
        message: item.message || "",
        dueDate: item.due_date,
        status:
          item.status.charAt(0).toUpperCase() + item.status.slice(1),
      }))
    );

    setSelectedFile(null);
    setUploadTitle("");
    setUploadRequestId("");
    setModal(null);
    notify("Document uploaded successfully.");
  } catch (error) {
    notify(error.message || "Unable to upload the document.");
  } finally {
    setIsUploading(false);
  }
};


const handleDocumentRequest = async (event) => {
  event.preventDefault();

  if (!requestTitle.trim() || !requestMessage.trim()) {
    notify("Enter a title and message before submitting.");
    return;
  }

  setSaving(true);

  try {
    await createClientDocumentRequest({
      title: requestTitle.trim(),
      message: requestMessage.trim(),
    });

    const result = await getClientDocumentRequests();

    setRequests(
      (result.data || []).map((request) => ({
        id: String(request.id),
        title: request.title,
        message: request.message || "",
        dueDate: request.dueDate,
        status:
          request.status.charAt(0).toUpperCase() +
          request.status.slice(1),
      }))
    );

    setRequestTitle("");
    setRequestMessage("");
    setModal(null);
    notify("Document request saved successfully.");
  } catch (error) {
    notify(error.message || "Unable to submit your request.");
  } finally {
    setSaving(false);
  }
};


  const openPaymentModal = (fee) => {
    setPaymentFeeId(fee.id);
    setPaymentReference(fee.reference || "");
    setPaymentNotes("");
    setModal({ type: "payment" });
  };


const handlePaymentReference = async (event) => {
  event.preventDefault();

  if (!paymentReference.trim()) {
    notify("Enter your payment reference.");
    return;
  }

  setSaving(true);

  try {
    await submitClientPaymentReference(
      paymentFeeId,
      paymentReference.trim()
    );

    const result = await getClientFees();

    setFees(
      (result.data || []).map((fee) => ({
        id: String(fee.id),
        title: fee.title,
        description: fee.description || "",
        amount: Number(fee.amount) || 0,
        currency: fee.currency || "PKR",
        dueDate: fee.dueDate,
        status:
          fee.status.charAt(0).toUpperCase() + fee.status.slice(1),
        reference: fee.paymentReference || "",
      }))
    );

    setModal(null);
    notify("Payment reference saved for admin verification.");
  } catch (error) {
    notify(error.message || "Unable to submit the payment reference.");
  } finally {
    setSaving(false);
  }
};



const handleProfileSave = async (event) => {
  event.preventDefault();

  if (!profile.fullName.trim() || !profile.email.trim()) {
    notify("Name and email are required.");
    return;
  }

  setSaving(true);

  try {
    await updateClientProfile({
      fullName: profile.fullName,
      businessName: profile.businessName,
      phone: profile.phone,
      address: profile.address,
      country: profile.country,
      taxReference: profile.taxReference,
    });

    const result = await getClientProfile();
    const data = result.data;

    const updatedProfile = {
      fullName: data.fullName || "",
      email: data.email || "",
      businessName: data.businessName || "",
      phone: data.phone || "",
      address: data.address || "",
      country: data.country || "",
      taxReference: data.taxReference || "",
    };

    setProfile(updatedProfile);
    setSavedProfile(updatedProfile);
    notify("Profile updated successfully.");
  } catch (error) {
    notify(error.message || "Unable to save your profile.");
  } finally {
    setSaving(false);
  }
};


  const handlePasswordChange = (event) => {
    event.preventDefault();

    if (passwordForm.newPassword.length < 8) {
      notify("Your new password must contain at least 8 characters.");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      notify("The new passwords do not match.");
      return;
    }

    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    notify("Password form validated. Connect the backend to change it.");
  };

  const downloadDemoReport = (report) => {
    const content = [
      "Zafar Law Chamber — CLIENT REPORT PREVIEW",
      `Report: ${report.title}`,
      `Category: ${report.category}`,
      `Period: ${report.period}`,
      `Issued: ${formatDate(report.date)}`,
      "",
      "This is a demonstration file created by the frontend preview.",
      "It is not an official tax, accounting, or financial report.",
    ].join("\n");

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${report.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-preview.txt`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    notify("Demo preview file downloaded, not an official report.");
  };


const downloadDemoDocument = (docRecord) => {
  const content = [
    "Zafar Law Chamber — DOCUMENT PREVIEW",
    `Title: ${docRecord.title}`,
    `Filename: ${docRecord.filename}`,
    `Category: ${docRecord.category}`,
    `Status: ${docRecord.status}`,
    "",
    "This is a demo placeholder. The original document is not stored in this frontend.",
  ].join("\n");

  const blob = new Blob([content], {
    type: "text/plain;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const anchor = window.document.createElement("a");

  anchor.href = url;
  anchor.download = `${docRecord.id}-preview.txt`;
  window.document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);

  notify("Downloaded a placeholder file, not the original document.");
};

useEffect(() => {
  let cancelled = false;

  async function loadClientDashboard() {
    setDashboardLoading(true);
    setDashboardError("");

    const results = await Promise.allSettled([
      getClientProfile(),
      getClientDocuments(),
      getClientDocumentRequests(),
      getClientFees(),
      getClientReportSummary(),
    ]);

    if (cancelled) return;

    const [
      profileResult,
      documentsResult,
      requestsResult,
      feesResult,
      reportsResult,
    ] = results;

    const errors = [];

    if (profileResult.status === "fulfilled") {
      const data = profileResult.value.data;

      const loadedProfile = {
        fullName: data.fullName || "",
        email: data.email || "",
        businessName: data.businessName || "",
        phone: data.phone || "",
        address: data.address || "",
        country: data.country || "",
        taxReference: data.taxReference || "",
      };

      setProfile(loadedProfile);
      setSavedProfile(loadedProfile);
    } else {
      errors.push(`Profile: ${profileResult.reason.message}`);
    }

    if (documentsResult.status === "fulfilled") {
      setDocuments(
        (documentsResult.value.data || []).map((doc) => ({
          id: String(doc.id),
          title: doc.title,
          filename: doc.filename,
          category: doc.category || "Other",
          date: doc.createdAt,
          status: doc.source === "admin_upload" ? "Completed" : "Submitted",
          source:
            doc.source === "client_upload"
              ? "Client upload"
              : "Admin upload",
          size: doc.fileSize
            ? `${(Number(doc.fileSize) / 1024).toFixed(0)} KB`
            : "—",
          requestId: doc.requestId,
          mimeType: doc.mimeType,
        }))
      );
    } else {
      errors.push(`Documents: ${documentsResult.reason.message}`);
    }

    if (requestsResult.status === "fulfilled") {
      setRequests(
        (requestsResult.value.data || []).map((request) => ({
          id: String(request.id),
          title: request.title,
          message: request.message || "",
          dueDate: request.dueDate,
          status:
            request.status.charAt(0).toUpperCase() +
            request.status.slice(1),
        }))
      );
    } else {
      errors.push(`Document requests: ${requestsResult.reason.message}`);
    }

    if (feesResult.status === "fulfilled") {
      setFees(
        (feesResult.value.data || []).map((fee) => ({
          id: String(fee.id),
          title: fee.title,
          description: fee.description || "",
          amount: Number(fee.amount) || 0,
          currency: fee.currency || "PKR",
          dueDate: fee.dueDate,
          status:
            fee.status.charAt(0).toUpperCase() + fee.status.slice(1),
          reference: fee.paymentReference || "",
        }))
      );
    } else {
      errors.push(`Fees: ${feesResult.reason.message}`);
    }

    if (reportsResult.status === "fulfilled") {
      setReportSummary(reportsResult.value.data);
    } else {
      errors.push(`Report summary: ${reportsResult.reason.message}`);
    }

    if (errors.length) {
      setDashboardError(errors.join(" "));
    }

    setDashboardLoading(false);
  }

  loadClientDashboard();

  return () => {
    cancelled = true;
  };
}, []);

  const renderOverview = () => (
    <>
      <div className="client-welcome">
        <div className="client-welcome__content">
          <span className="client-eyebrow">CLIENT PORTAL</span>
          <h2>Welcome back, {savedProfile.fullName.split(" ")[0]}.</h2>
          <p>
            Keep your documents organized, review your fees, and stay up to date
            with your accounting services.
          </p>
          <div className="client-welcome__actions">
            <button
              className="client-btn client-btn--light"
              onClick={() => navigate("documents")}
              type="button"
            >
              <Upload size={16} />
              Submit documents
            </button>
            <button
              className="client-btn client-btn--outline-light"
              onClick={() => navigate("fees")}
              type="button"
            >
              View fees
              <ArrowUpRight size={16} />
            </button>
          </div>
        </div>
        <div className="client-welcome__illustration" aria-hidden="true">
          <div className="client-welcome__circle client-welcome__circle--one" />
          <div className="client-welcome__circle client-welcome__circle--two" />
          <div className="client-welcome__document-art">
            <FileText size={51} strokeWidth={1.25} />
            <span />
            <span />
            <span />
            <div className="client-welcome__check">
              <ShieldCheck size={25} />
            </div>
          </div>
        </div>
      </div>

      <div className="client-account-strip">
        <div className="client-account-strip__identity">
          <div className="client-avatar">
            {savedProfile.fullName
              .split(" ")
              .map((part) => part[0])
              .slice(0, 2)
              .join("")
              .toUpperCase()}
          </div>
          <div>
            <strong>{savedProfile.businessName || "Business name not set"}</strong>
            <span>{savedProfile.email}</span>
          </div>
        </div>
        <div className="client-account-strip__meta">
          <span>Account status</span>
          <StatusBadge status="Active" />
        </div>
        <button
          className="client-text-button"
          onClick={() => navigate("settings")}
          type="button"
        >
          View profile <ChevronRight size={16} />
        </button>
      </div>

      <div className="client-stats-grid">
        <StatCard
          label="Document Requests"
          value={pendingRequestCount}
          note="Require your attention"
          icon={Files}
          tone="blue"
        />
        <StatCard
          label="Documents Submitted"
          value={submittedDocuments}
          note="Uploaded by you"
          icon={CircleCheck}
          tone="teal"
        />
        <StatCard
          label="Outstanding Fees"
          value={formatMoney(outstandingFees)}
          note="Pending and overdue"
          icon={Wallet}
          tone="orange"
        />
        <StatCard
          label="Available Reports"
          value={availableReports}
          note="Shared with your account"
          icon={ChartNoAxesCombined}
          tone="purple"
        />
      </div>

      <div className="client-overview-grid">
        <section className="client-panel client-panel--main">
          <div className="client-panel__header">
            <div>
              <h3>Document requests</h3>
              <p>Documents your accountant needs from you.</p>
            </div>
            <button
              className="client-text-button"
              type="button"
              onClick={() => navigate("documents")}
            >
              View all <ChevronRight size={16} />
            </button>
          </div>
          {requests.filter((request) => request.status === "Pending").length ? (
            <div className="client-request-list">
              {requests
                .filter((request) => request.status === "Pending")
                .slice(0, 3)
                .map((request) => (
                  <div className="client-request-item" key={request.id}>
                    <div className="client-file-icon client-file-icon--blue">
                      <FileText size={20} />
                    </div>
                    <div className="client-request-item__body">
                      <strong>{request.title}</strong>
                      <span>{request.message}</span>
                      <small>
                        <CalendarDays size={13} />
                        Due: {formatDate(request.dueDate)}
                      </small>
                    </div>
                    <button
                      className="client-btn client-btn--primary client-btn--small"
                      type="button"
                      onClick={() => openUploadModal(request)}
                    >
                      Upload
                    </button>
                  </div>
                ))}
            </div>
          ) : (
            <EmptyState
              icon={CircleCheck}
              title="You're all caught up"
              description="There are no pending document requests."
            />
          )}
        </section>

        <section className="client-panel">
          <div className="client-panel__header">
            <div>
              <h3>Fee summary</h3>
              <p>Your current outstanding balance.</p>
            </div>
            <div className="client-panel__header-icon client-panel__header-icon--orange">
              <Wallet size={18} />
            </div>
          </div>
          <div className="client-balance">
            <span>Total outstanding</span>
            <strong>{formatMoney(outstandingFees)}</strong>
            <small>Pending and overdue fee requests</small>
          </div>
          <div className="client-fee-summary-list">
            {fees
              .filter((fee) => ["Pending", "Overdue"].includes(fee.status))
              .slice(0, 3)
              .map((fee) => (
                <div className="client-fee-summary-item" key={fee.id}>
                  <div>
                    <strong>{fee.title}</strong>
                    <span>Due {formatDate(fee.dueDate)}</span>
                  </div>
                  <div className="client-fee-summary-item__amount">
                    <strong>{formatMoney(fee.amount, fee.currency)}</strong>
                    <StatusBadge status={fee.status} />
                  </div>
                </div>
              ))}
          </div>
          <button
            className="client-btn client-btn--secondary client-btn--full"
            type="button"
            onClick={() => navigate("fees")}
          >
            Manage fees <ArrowUpRight size={16} />
          </button>
        </section>

        <section className="client-panel client-panel--main">
          <div className="client-panel__header">
            <div>
              <h3>Recent documents</h3>
              <p>Your latest document activity.</p>
            </div>
            <button
              className="client-text-button"
              type="button"
              onClick={() => navigate("documents")}
            >
              All documents <ChevronRight size={16} />
            </button>
          </div>
          <div className="client-mini-document-list">
            {documents.slice(0, 4).map((document) => (
              <div className="client-mini-document" key={document.id}>
                <div className="client-file-icon">
                  <DocumentIcon filename={document.filename} />
                </div>
                <div className="client-mini-document__body">
                  <strong>{document.title}</strong>
                  <span>{document.filename}</span>
                </div>
                <StatusBadge status={document.status} />
              </div>
            ))}
          </div>
        </section>

        <section className="client-panel">
          <div className="client-panel__header">
            <div>
              <h3>Quick actions</h3>
              <p>Common tasks for your account.</p>
            </div>
          </div>
          <div className="client-quick-actions">
            <button type="button" onClick={() => openUploadModal()}>
              <span className="client-quick-actions__icon client-quick-actions__icon--blue">
                <Upload size={19} />
              </span>
              <span>
                <strong>Upload a document</strong>
                <small>Submit a file to your accountant</small>
              </span>
              <ChevronRight size={17} />
            </button>
            <button
              type="button"
              onClick={() => {
                setRequestTitle("");
                setRequestMessage("");
                setModal({ type: "request" });
              }}
            >
              <span className="client-quick-actions__icon client-quick-actions__icon--teal">
                <MessageSquareText size={19} />
              </span>
              <span>
                <strong>Request a document</strong>
                <small>Ask for a complete or corrected file</small>
              </span>
              <ChevronRight size={17} />
            </button>
            <button type="button" onClick={() => navigate("reports")}>
              <span className="client-quick-actions__icon client-quick-actions__icon--purple">
                <ArrowDownToLine size={19} />
              </span>
              <span>
                <strong>View reports</strong>
                <small>Access reports shared with you</small>
              </span>
              <ChevronRight size={17} />
            </button>
            <button type="button" onClick={() => navigate("settings")}>
              <span className="client-quick-actions__icon client-quick-actions__icon--orange">
                <UserRound size={19} />
              </span>
              <span>
                <strong>Update your profile</strong>
                <small>Keep your details up to date</small>
              </span>
              <ChevronRight size={17} />
            </button>
          </div>
        </section>
      </div>
    </>
  );

  const renderDocuments = () => (
    <>
      <SectionHeading
        eyebrow="DOCUMENT CENTER"
        title="Document Management"
        description="Submit requested files, track their status, and access documents shared by your accountant."
        action={
          <button
            type="button"
            className="client-btn client-btn--primary"
            onClick={() => openUploadModal()}
          >
            <Plus size={17} /> Upload document
          </button>
        }
      />

      <div className="client-stats-grid client-stats-grid--three">
        <StatCard
          label="All Documents"
          value={documents.length}
          note="Available in this preview"
          icon={Files}
          tone="blue"
        />
        <StatCard
          label="Submitted by You"
          value={documents.filter((item) => item.source === "Client upload").length}
          note="Uploaded client files"
          icon={Upload}
          tone="teal"
        />
        <StatCard
          label="Pending Requests"
          value={pendingRequestCount}
          note="Awaiting your documents"
          icon={Clock3}
          tone="orange"
        />
      </div>

      <section className="client-panel">
        <div className="client-panel__header client-panel__header--wrap">
          <div>
            <h3>Your document library</h3>
            <p>Search files and filter them by their current status.</p>
          </div>
          <div className="client-table-tools">
            <label className="client-search">
              <Search size={17} />
              <input
                type="search"
                value={documentSearch}
                onChange={(event) => setDocumentSearch(event.target.value)}
                placeholder="Search documents..."
                aria-label="Search documents"
              />
            </label>
            <select
              value={documentFilter}
              onChange={(event) => setDocumentFilter(event.target.value)}
              aria-label="Filter documents by status"
              className="client-select"
            >
              <option>All</option>
              <option>Pending</option>
              <option>Submitted</option>
              <option>Completed</option>
            </select>
          </div>
        </div>

        {filteredDocuments.length ? (
          <div className="client-table-wrap">
            <table className="client-table">
              <thead>
                <tr>
                  <th>Document</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Source</th>
                  <th>Status</th>
                  <th className="client-table__actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocuments.map((document) => (
                  <tr key={document.id}>
                    <td>
                      <div className="client-table-document">
                        <div className="client-file-icon">
                          <DocumentIcon filename={document.filename} />
                        </div>
                        <div>
                          <strong>{document.title}</strong>
                          <span>{document.filename}</span>
                        </div>
                      </div>
                    </td>
                    <td>{document.category}</td>
                    <td>{formatDate(document.date)}</td>
                    <td>{document.source}</td>
                    <td><StatusBadge status={document.status} /></td>
                    <td>
                      <div className="client-row-actions">
                        {document.status === "Pending" ? (
                          <button
                            type="button"
                            className="client-icon-button client-icon-button--primary"
                            title="Upload requested document"
                            aria-label={`Upload ${document.title}`}
                            onClick={() =>
                              openUploadModal(
                                requests.find((request) => request.title === document.title)
                              )
                            }
                          >
                            <Upload size={17} />
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="client-icon-button"
                            title="Download document"
                            aria-label={`Download ${document.title}`}
                            onClick={() => handleDocumentDownload(document)}
                          >
                            <Download size={17} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={Search}
            title="No matching documents"
            description="Try a different search or change the status filter."
            action={
              <button
                type="button"
                className="client-btn client-btn--secondary"
                onClick={() => {
                  setDocumentSearch("");
                  setDocumentFilter("All");
                }}
              >
                Clear filters
              </button>
            }
          />
        )}
      </section>

      <section className="client-panel">
        <div className="client-panel__header">
          <div>
            <h3>Document requests</h3>
            <p>Requests and instructions from your accountant.</p>
          </div>
          <button
            className="client-btn client-btn--secondary"
            type="button"
            onClick={() => setModal({ type: "request" })}
          >
            <MessageSquareText size={16} /> Request a document
          </button>
        </div>
        <div className="client-request-list client-request-list--panel">
          {requests.length ? requests.map((request) => (
            <div className="client-request-item" key={request.id}>
              <div className="client-file-icon client-file-icon--blue">
                <FileText size={20} />
              </div>
              <div className="client-request-item__body">
                <strong>{request.title}</strong>
                <span>{request.message}</span>
                <small>
                  <CalendarDays size={13} />
                  Due: {formatDate(request.dueDate)}
                </small>
              </div>
              <div className="client-request-item__action">
                <StatusBadge status={request.status} />
                {request.status === "Pending" && (
                  <button
                    className="client-btn client-btn--primary client-btn--small"
                    type="button"
                    onClick={() => openUploadModal(request)}
                  >
                    Upload file
                  </button>
                )}
              </div>
            </div>
          )) : (
            <EmptyState
              icon={CircleCheck}
              title="No document requests"
              description="New requests from your accountant will appear here."
            />
          )}
        </div>
      </section>
    </>
  );

  const renderFees = () => (
    <>
      <SectionHeading
        eyebrow="BILLING CENTER"
        title="Fee Management"
        description="Review service fees, check due dates, and submit payment references for your accountant to verify."
      />

      <div className="client-stats-grid">
        <StatCard
          label="Outstanding Balance"
          value={formatMoney(outstandingFees)}
          note="Pending and overdue fees"
          icon={Wallet}
          tone="orange"
        />
        <StatCard
          label="Pending Fees"
          value={fees.filter((fee) => fee.status === "Pending").length}
          note="Awaiting payment confirmation"
          icon={Clock3}
          tone="blue"
        />
        <StatCard
          label="Overdue Fees"
          value={fees.filter((fee) => fee.status === "Overdue").length}
          note="Past their due date"
          icon={CircleAlert}
          tone="orange"
        />
        <StatCard
          label="Paid Fees"
          value={fees.filter((fee) => fee.status === "Paid").length}
          note="Marked as paid in this preview"
          icon={CircleCheck}
          tone="teal"
        />
      </div>

      <section className="client-panel">
        <div className="client-panel__header client-panel__header--wrap">
          <div>
            <h3>Service fees</h3>
            <p>Fee requests and payment status.</p>
          </div>
          <div className="client-table-tools">
            <label className="client-search">
              <Search size={17} />
              <input
                type="search"
                value={feeSearch}
                onChange={(event) => setFeeSearch(event.target.value)}
                placeholder="Search fees..."
                aria-label="Search fees"
              />
            </label>
            <select
              className="client-select"
              value={feeFilter}
              onChange={(event) => setFeeFilter(event.target.value)}
              aria-label="Filter fees by status"
            >
              <option>All</option>
              <option>Pending</option>
              <option>Overdue</option>
              <option>Paid</option>
            </select>
          </div>
        </div>

        {filteredFees.length ? (
          <div className="client-table-wrap">
            <table className="client-table">
              <thead>
                <tr>
                  <th>Fee / Service</th>
                  <th>Due date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Payment reference</th>
                  <th className="client-table__actions">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredFees.map((fee) => (
                  <tr key={fee.id}>
                    <td>
                      <div className="client-table-document">
                        <div className="client-file-icon client-file-icon--orange">
                          <CreditCard size={19} />
                        </div>
                        <div>
                          <strong>{fee.title}</strong>
                          <span>{fee.id} · {fee.description}</span>
                        </div>
                      </div>
                    </td>
                    <td>{formatDate(fee.dueDate)}</td>
                    <td className="client-money-cell">
                      {formatMoney(fee.amount, fee.currency)}
                    </td>
                    <td><StatusBadge status={fee.status} /></td>
                    <td>{fee.reference || "—"}</td>
                    <td>
                      {fee.status !== "Paid" ? (
                        <button
                          type="button"
                          className="client-btn client-btn--secondary client-btn--small"
                          onClick={() => openPaymentModal(fee)}
                        >
                          Submit reference
                        </button>
                      ) : (
                        <span className="client-completed-label">
                          <Check size={15} /> Recorded
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={Wallet}
            title="No matching fees"
            description="Try a different search or status filter."
            action={
              <button
                type="button"
                className="client-btn client-btn--secondary"
                onClick={() => {
                  setFeeSearch("");
                  setFeeFilter("All");
                }}
              >
                Clear filters
              </button>
            }
          />
        )}
      </section>

      <div className="client-information-card">
        <div className="client-information-card__icon">
          <ShieldCheck size={21} />
        </div>
        <div>
          <h3>How payment confirmation works</h3>
          <p>
            Submit the transaction reference supplied by your payment provider.
            Your accountant can verify the payment and update the fee status.
            A reference submission does not itself confirm that payment has been
            received.
          </p>
        </div>
      </div>
    </>
  );

  const renderReports = () => (
    <>
      <SectionHeading
        eyebrow="YOUR RECORDS"
        title="Reports"
        description="View reports shared by your accountant and access the reporting periods available to your account."
      />

      <div className="client-stats-grid client-stats-grid--three">
        <StatCard
          label="Total Reports"
          value={reports.length}
          note="Shown in this preview"
          icon={Files}
          tone="blue"
        />
        <StatCard
          label="Available"
          value={availableReports}
          note="Ready to view"
          icon={CircleCheck}
          tone="teal"
        />
        <StatCard
          label="Not Yet Available"
          value={reports.filter((report) => report.status !== "Available").length}
          note="Not shared yet"
          icon={Clock3}
          tone="orange"
        />
      </div>

      <section className="client-panel">
        <div className="client-panel__header client-panel__header--wrap">
          <div>
            <h3>Report library</h3>
            <p>Reports are shown when they have been made available to you.</p>
          </div>
          <div className="client-table-tools">
            <label className="client-search">
              <Search size={17} />
              <input
                type="search"
                value={reportSearch}
                onChange={(event) => setReportSearch(event.target.value)}
                placeholder="Search reports..."
                aria-label="Search reports"
              />
            </label>
            <select
              className="client-select"
              value={reportFilter}
              onChange={(event) => setReportFilter(event.target.value)}
              aria-label="Filter reports by category"
            >
              {documentCategories.map((curElem)=> <option value={curElem}>{curElem}</option> )}
            </select>
          </div>
        </div>

        {filteredReports.length ? (
          <div className="client-report-grid">
            {filteredReports.map((report) => (
              <article className="client-report-card" key={report.id}>
                <div className="client-report-card__top">
                  <div className="client-report-icon">
                    <FileText size={24} />
                  </div>
                  <StatusBadge status={report.status} />
                </div>
                <span className="client-eyebrow">{report.category}</span>
                <h3>{report.title}</h3>
                <p>{report.description}</p>
                <div className="client-report-card__meta">
                  <span><CalendarDays size={14} /> {report.period}</span>
                  <span><File size={14} /> {report.format}</span>
                </div>
                <div className="client-report-card__footer">
                  <small>
                    {report.date ? `Shared ${formatDate(report.date)}` : "Not shared yet"}
                  </small>
                  {report.status === "Available" ? (
                    <div className="client-report-card__actions">
                      <button
                        type="button"
                        className="client-icon-button"
                        title="Preview report"
                        aria-label={`Preview ${report.title}`}
                        onClick={() => setReportPreview(report)}
                      >
                        <Eye size={17} />
                      </button>
                      <button
                        type="button"
                        className="client-icon-button client-icon-button--primary"
                        title="Download demo placeholder"
                        aria-label={`Download ${report.title} preview`}
                        onClick={() => downloadDemoReport(report)}
                      >
                        <Download size={17} />
                      </button>
                    </div>
                  ) : (
                    <span className="client-report-card__unavailable">
                      Unavailable
                    </span>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={ChartNoAxesCombined}
            title="No matching reports"
            description="Try another search or category."
            action={
              <button
                type="button"
                className="client-btn client-btn--secondary"
                onClick={() => {
                  setReportSearch("");
                  setReportFilter("All");
                }}
              >
                Clear filters
              </button>
            }
          />
        )}
      </section>

      <div className="client-information-card">
        <div className="client-information-card__icon">
          <CircleAlert size={21} />
        </div>
        <div>
          <h3>About report availability</h3>
          <p>
            The database currently has no dedicated reports table. In the
            frontend preview, reports are sample records. Backend integration
            will require an agreed report-storage approach before actual files
            can be listed or downloaded.
          </p>
        </div>
      </div>
    </>
  );

  const renderSettings = () => (
    <>
      <SectionHeading
        eyebrow="ACCOUNT PREFERENCES"
        title="Account Settings"
        description="Manage your personal and business information and review account security."
      />

      <div className="client-settings-layout">
        <aside className="client-settings-nav">
          <button
            type="button"
            className={settingsTab === "profile" ? "is-active" : ""}
            onClick={() => setSettingsTab("profile")}
          >
            <UserRound size={18} /> Profile information
          </button>
          <button
            type="button"
            className={settingsTab === "business" ? "is-active" : ""}
            onClick={() => setSettingsTab("business")}
          >
            <Building2 size={18} /> Business details
          </button>
          <button
            type="button"
            className={settingsTab === "security" ? "is-active" : ""}
            onClick={() => setSettingsTab("security")}
          >
            <LockKeyhole size={18} /> Password & security
          </button>
        </aside>

        <section className="client-panel client-settings-panel">
          {settingsTab === "profile" && (
            <form onSubmit={handleProfileSave}>
              <div className="client-panel__header">
                <div>
                  <h3>Personal information</h3>
                  <p>These details identify your client account.</p>
                </div>
                <div className="client-settings-avatar">
                  <UserRound size={23} />
                </div>
              </div>
              <div className="client-form-grid">
                <label className="client-form-field">
                  <span>Full name <b>*</b></span>
                  <input
                    required
                    value={profile.fullName}
                    onChange={(event) =>
                      setProfile({ ...profile, fullName: event.target.value })
                    }
                    placeholder="Your full name"
                  />
                </label>
                <label className="client-form-field">
                  <span>Email address <b>*</b></span>
                  <div className="client-input-with-icon">
                    <Mail size={16} />
                    <input
                      required
                      type="email"
                      value={profile.email}
                      onChange={(event) =>
                        setProfile({ ...profile, email: event.target.value })
                      }
                      placeholder="you@example.com"
                      readOnly
                    />
                  </div>
                </label>
                <label className="client-form-field">
                  <span>Phone number</span>
                  <div className="client-input-with-icon">
                    <Phone size={16} />
                    <input
                      value={profile.phone}
                      onChange={(event) =>
                        setProfile({ ...profile, phone: event.target.value })
                      }
                      placeholder="+92 ..."
                    />
                  </div>
                </label>
                <label className="client-form-field">
                  <span>Country</span>
                  <input
                    value={profile.country}
                    onChange={(event) =>
                      setProfile({ ...profile, country: event.target.value })
                    }
                    placeholder="Country"
                  />
                </label>
                <label className="client-form-field client-form-field--full">
                  <span>Address</span>
                  <div className="client-input-with-icon">
                    <MapPin size={16} />
                    <input
                      value={profile.address}
                      onChange={(event) =>
                        setProfile({ ...profile, address: event.target.value })
                      }
                      placeholder="Business or mailing address"
                    />
                  </div>
                </label>
              </div>
              <div className="client-form-footer">
                <button
                  className="client-btn client-btn--secondary"
                  type="button"
                  onClick={() => setProfile({ ...savedProfile })}
                >
                  Cancel
                </button>
                <button className="client-btn client-btn--primary" type="submit">
                  <Check size={16} /> Save changes
                </button>
              </div>
            </form>
          )}

          {settingsTab === "business" && (
            <form onSubmit={handleProfileSave}>
              <div className="client-panel__header">
                <div>
                  <h3>Business details</h3>
                  <p>Keep the business information for your account accurate.</p>
                </div>
                <div className="client-settings-avatar">
                  <Building2 size={23} />
                </div>
              </div>
              <div className="client-form-grid">
                <label className="client-form-field client-form-field--full">
                  <span>Business name</span>
                  <input
                    value={profile.businessName}
                    onChange={(event) =>
                      setProfile({ ...profile, businessName: event.target.value })
                    }
                    placeholder="Registered business name"
                  />
                </label>
                <label className="client-form-field">
                  <span>Tax reference / NTN</span>
                  <input
                    value={profile.taxReference}
                    onChange={(event) =>
                      setProfile({ ...profile, taxReference: event.target.value })
                    }
                    placeholder="Tax reference"
                  />
                </label>
                <label className="client-form-field">
                  <span>Country</span>
                  <input
                    value={profile.country}
                    onChange={(event) =>
                      setProfile({ ...profile, country: event.target.value })
                    }
                    placeholder="Country"
                  />
                </label>
                <label className="client-form-field client-form-field--full">
                  <span>Business address</span>
                  <div className="client-input-with-icon">
                    <MapPin size={16} />
                    <input
                      value={profile.address}
                      onChange={(event) =>
                        setProfile({ ...profile, address: event.target.value })
                      }
                      placeholder="Business address"
                    />
                  </div>
                </label>
                <label className="client-form-field">
                  <span>Contact phone</span>
                  <input
                    value={profile.phone}
                    onChange={(event) =>
                      setProfile({ ...profile, phone: event.target.value })
                    }
                    placeholder="Contact phone"
                  />
                </label>
              </div>
              <div className="client-form-footer">
                <button
                  className="client-btn client-btn--secondary"
                  type="button"
                  onClick={() => setProfile({ ...savedProfile })}
                >
                  Cancel
                </button>
                <button className="client-btn client-btn--primary" type="submit">
                  <Check size={16} /> Save business details
                </button>
              </div>
            </form>
          )}

          {settingsTab === "security" && (
            <form onSubmit={handlePasswordChange}>
              <div className="client-panel__header">
                <div>
                  <h3>Password & security</h3>
                  <p>Use a strong password to protect your account.</p>
                </div>
                <div className="client-settings-avatar">
                  <LockKeyhole size={23} />
                </div>
              </div>
              <div className="client-security-note">
                <ShieldCheck size={20} />
                <div>
                  <strong>Account security</strong>
                  <p>
                    Password changes will be connected to the authenticated
                    backend in the API integration phase.
                  </p>
                </div>
              </div>
              <div className="client-form-grid client-form-grid--single">
                <label className="client-form-field">
                  <span>Current password <b>*</b></span>
                  <input
                    type="password"
                    required
                    autoComplete="current-password"
                    value={passwordForm.currentPassword}
                    onChange={(event) =>
                      setPasswordForm({
                        ...passwordForm,
                        currentPassword: event.target.value,
                      })
                    }
                    placeholder="Enter current password"
                  />
                </label>
                <label className="client-form-field">
                  <span>New password <b>*</b></span>
                  <input
                    type="password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    value={passwordForm.newPassword}
                    onChange={(event) =>
                      setPasswordForm({
                        ...passwordForm,
                        newPassword: event.target.value,
                      })
                    }
                    placeholder="At least 8 characters"
                  />
                </label>
                <label className="client-form-field">
                  <span>Confirm new password <b>*</b></span>
                  <input
                    type="password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    value={passwordForm.confirmPassword}
                    onChange={(event) =>
                      setPasswordForm({
                        ...passwordForm,
                        confirmPassword: event.target.value,
                      })
                    }
                    placeholder="Re-enter new password"
                  />
                </label>
              </div>
              <div className="client-form-footer">
                <button
                  className="client-btn client-btn--secondary"
                  type="button"
                  onClick={() =>
                    setPasswordForm({
                      currentPassword: "",
                      newPassword: "",
                      confirmPassword: "",
                    })
                  }
                >
                  Clear
                </button>
                <button className="client-btn client-btn--primary" type="submit">
                  <LockKeyhole size={16} /> Validate password form
                </button>
              </div>
            </form>
          )}
        </section>
      </div>

      <section className="client-panel client-account-security">
        <div className="client-account-security__icon">
          <ShieldCheck size={22} />
        </div>
        <div>
          <h3>Your account information</h3>
          <p>
            Your account status and access permissions are controlled by the
            Zafar Law Chamber administration team. Contact your accountant if your
            business details or account access need to be corrected.
          </p>
        </div>
        <StatusBadge status="Active" />
      </section>
    </>
  );

  const renderModal = () => {
    if (!modal) return null;

    if (modal.type === "upload") {
      return (
        <Modal
          title="Upload a document"
          description="Choose a file and provide its details."
          onClose={() => setModal(null)}
        >
          <form className="client-modal__body" onSubmit={handleUpload}>
            <label className="client-form-field">
              <span>Document title</span>
              <input
                value={uploadTitle}
                onChange={(event) => setUploadTitle(event.target.value)}
                placeholder="e.g. September bank statement"
              />
            </label>
            <label className="client-form-field">
              <span>Document category</span>
              <select
                value={uploadCategory}
                onChange={(event) => setUploadCategory(event.target.value)}
              >
                <option>Tax</option>
                <option>Financial</option>
                <option>Business</option>
                <option>Identity</option>
                <option>Other</option>
              </select>
            </label>
            <label className="client-upload-dropzone">
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.xls,.xlsx"
                onChange={(event) => {
                  setSelectedFile(event.target.files?.[0] ?? null);
                }}
              />
              <span className="client-upload-dropzone__icon">
                <Upload size={24} />
              </span>
              <strong>
                {selectedFile ? selectedFile.name : "Choose a file to upload"}
              </strong>
              <span>
                {selectedFile
                  ? `${(selectedFile.size / 1024).toFixed(0)} KB selected`
                  : "PDF, images, spreadsheets, and documents · Max 10 MB in preview"}
              </span>
              <span className="client-upload-dropzone__browse">Browse files</span>
            </label>
            {uploadRequestId && (
              <div className="client-inline-note">
                <CircleAlert size={16} />
                This file will be associated with request {uploadRequestId} in
                this preview.
              </div>
            )}
            <div className="client-modal__footer">
              <button
                type="button"
                className="client-btn client-btn--secondary"
                onClick={() => setModal(null)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="client-btn client-btn--primary"
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <RefreshCw size={16} />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload size={16} />
                    Upload document
                  </>
                )}
              </button>
            </div>
          </form>
        </Modal>
      );
    }

    if (modal.type === "request") {
      return (
        <Modal
          title="Request a document"
          description="Ask your accountant for a complete, corrected, or additional document."
          onClose={() => setModal(null)}
        >
          <form className="client-modal__body" onSubmit={handleDocumentRequest}>
            <label className="client-form-field">
              <span>Request title <b>*</b></span>
              <input
                required
                value={requestTitle}
                onChange={(event) => setRequestTitle(event.target.value)}
                placeholder="e.g. Request corrected invoice"
              />
            </label>
            <label className="client-form-field">
              <span>Message <b>*</b></span>
              <textarea
                required
                rows={4}
                value={requestMessage}
                onChange={(event) => setRequestMessage(event.target.value)}
                placeholder="Explain which document you need and why..."
              />
            </label>
            <div className="client-inline-note">
              <ShieldCheck size={16} />
              Your request will be saved to your account and shared with your
              accountant.
            </div>
            <div className="client-modal__footer">
              <button
                type="button"
                className="client-btn client-btn--secondary"
                onClick={() => setModal(null)}
              >
                Cancel
              </button>
              <button type="submit" className="client-btn client-btn--primary">
                <Send size={16} /> Submit request
              </button>
            </div>
          </form>
        </Modal>
      );
    }

    if (modal.type === "payment") {
      const fee = fees.find((item) => item.id === paymentFeeId);

      return (
        <Modal
          title="Submit payment reference"
          description="Provide the transaction reference for your accountant to verify."
          onClose={() => setModal(null)}
        >
          <form className="client-modal__body" onSubmit={handlePaymentReference}>
            {fee && (
              <div className="client-payment-summary">
                <span>{fee.title}</span>
                <strong>{formatMoney(fee.amount, fee.currency)}</strong>
                <small>{fee.id} · Due {formatDate(fee.dueDate)}</small>
              </div>
            )}
            <label className="client-form-field">
              <span>Transaction / payment reference <b>*</b></span>
              <input
                required
                value={paymentReference}
                onChange={(event) => setPaymentReference(event.target.value)}
                placeholder="Enter your transaction reference"
              />
            </label>
            <label className="client-form-field">
              <span>Additional notes (optional)</span>
              <textarea
                rows={3}
                value={paymentNotes}
                onChange={(event) => setPaymentNotes(event.target.value)}
                placeholder="Optional payment details"
              />
            </label>
            <div className="client-inline-note">
              <ShieldCheck size={16} />
              Submitting a reference does not mark the fee as paid. The admin
              must verify the payment.
            </div>
            <div className="client-modal__footer">
              <button
                type="button"
                className="client-btn client-btn--secondary"
                onClick={() => setModal(null)}
              >
                Cancel
              </button>
              <button type="submit" className="client-btn client-btn--primary">
                <Send size={16} /> Submit reference
              </button>
            </div>
          </form>
        </Modal>
      );
    }

    return null;
  };

  return (
    <div className="client-app">
      {sidebarOpen && (
        <button
          type="button"
          className="client-mobile-backdrop"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`client-sidebar${sidebarOpen ? " is-open" : ""}`}>
        <div className="client-sidebar__brand">
          <div className="client-brand-mark">
            <span>Y</span>
          </div>
          <div className="client-brand-text">
            <strong>Zafar Law Chamber</strong>
            <span>CLIENT PORTAL</span>
          </div>
          <button
            type="button"
            className="client-sidebar__close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        <div className="client-sidebar__section-label">WORKSPACE</div>
        <nav className="client-sidebar__nav" aria-label="Client dashboard">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <button
                key={item.id}
                type="button"
                className={`client-nav-item${isActive ? " is-active" : ""}`}
                onClick={() => navigate(item.id)}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon size={19} strokeWidth={1.8} />
                <span>{item.label}</span>
                {item.id === "documents" && pendingRequestCount > 0 && (
                  <span className="client-nav-item__count">{pendingRequestCount}</span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="client-sidebar__spacer" />

        <div className="client-sidebar-help">
          <div className="client-sidebar-help__icon">
            <MessageSquareText size={19} />
          </div>
          <strong>Need assistance?</strong>
          <p>Contact your accountant for help with your records or fees.</p>
          <button
            type="button"
            onClick={() =>
              notify("Contact your accountant through your agreed communication channel.")
            }
          >
            Get support <ArrowUpRight size={15} />
          </button>
        </div>

        <div className="client-sidebar__footer">
          <div className="client-sidebar__secure">
            <ShieldCheck size={15} />
            <span>Secure client area</span>
          </div>
          <span>© {new Date().getFullYear()} Zafar Law Chamber</span>
        </div>
      </aside>

      <div className="client-main">
        <header className="client-topbar">
          <div className="client-topbar__left">
            <button
              type="button"
              className="client-icon-button client-mobile-menu"
              aria-label="Open navigation"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={21} />
            </button>
            <div className="client-breadcrumb">
              <span>Client Portal</span>
              <ChevronRight size={15} />
              <strong>{activeItem.label}</strong>
            </div>
          </div>

          <div className="client-topbar__right">
            <span className="client-topbar__account-label">Client account</span>
            <div className="client-profile-menu-wrap">
              <button
                type="button"
                className="client-profile-trigger"
                onClick={() => setProfileMenuOpen((current) => !current)}
                aria-expanded={profileMenuOpen}
              >
                <div className="client-avatar client-avatar--small">
                  {savedProfile.fullName
                    .split(" ")
                    .map((part) => part[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()}
                </div>
                <span className="client-profile-trigger__text">
                  <strong>{savedProfile.fullName}</strong>
                  <small>Client</small>
                </span>
                <ChevronDown size={16} />
              </button>

              {profileMenuOpen && (
                <div className="client-profile-dropdown">
                  <div className="client-profile-dropdown__header">
                    <strong>{savedProfile.fullName}</strong>
                    <span>{savedProfile.email}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate("settings")}
                  >
                    <UserRound size={16} /> Account settings
                  </button>
                  <button
                    type="button"
                    onClick={logout}
                  >
                    <LogOut size={16} /> Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="client-content">
          {dashboardLoading && (
            <div className="client-inline-note" role="status">
              <RefreshCw size={16} />
              Loading your account records...
            </div>
          )}

          {dashboardError && (
            <div className="client-inline-note" role="alert">
              <CircleAlert size={16} />
              <span>{dashboardError}</span>
            </div>
          )}
          {activeSection === "overview" && renderOverview()}
          {activeSection === "documents" && renderDocuments()}
          {activeSection === "fees" && renderFees()}
          {activeSection === "reports" && renderReports()}
          {activeSection === "settings" && renderSettings()}

          <footer className="client-page-footer">
            <span>Zafar Law Chamber Client Portal</span>
            <span>Private account workspace</span>
          </footer>
        </main>
      </div>

      {renderModal()}

      {reportPreview && (
        <Modal
          title={reportPreview.title}
          description="Report preview"
          onClose={() => setReportPreview(null)}
          wide
        >
          <div className="client-report-preview">
            <div className="client-report-preview__banner">
              <div className="client-brand-mark"><span>Y</span></div>
              <div>
                <strong>Zafar Law Chamber</strong>
                <span>Client report preview</span>
              </div>
              <StatusBadge status={reportPreview.status} />
            </div>
            <h3>{reportPreview.title}</h3>
            <p>{reportPreview.description}</p>
            <dl>
              <div><dt>Category</dt><dd>{reportPreview.category}</dd></div>
              <div><dt>Reporting period</dt><dd>{reportPreview.period}</dd></div>
              <div><dt>Shared date</dt><dd>{formatDate(reportPreview.date)}</dd></div>
            </dl>
            <div className="client-inline-note">
              <CircleAlert size={17} />
              This is a frontend demonstration. It does not contain real financial
              figures and is not an official report.
            </div>
            <div className="client-modal__footer">
              <button
                type="button"
                className="client-btn client-btn--secondary"
                onClick={() => setReportPreview(null)}
              >
                Close preview
              </button>
              <button
                type="button"
                className="client-btn client-btn--primary"
                onClick={() => downloadDemoReport(reportPreview)}
              >
                <Download size={16} /> Download demo file
              </button>
            </div>
          </div>
        </Modal>
      )}

      {toast && (
        <div className="client-toast" role="status">
          <CircleCheck size={18} />
          <span>{toast}</span>
          <button
            type="button"
            onClick={() => setToast("")}
            aria-label="Dismiss notification"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
