import { useEffect, useRef, useState } from "react";
import {
  getAdminDashboardSummary,
  getAdminSettings,
} from "../../services/adminApi";
import { apiRequest } from "../../services/api";
import {
  Check,
  CheckCheck,
  CircleAlert,
  RefreshCw,
} from "lucide-react";
import { logout } from "../../services/auth";
import {
  LayoutDashboard,
  Users,
  FolderOpen,
  Wallet,
  BarChart3,
  Settings,
  PanelsTopLeft,
  LogOut,
  Search,
  Bell,
  Menu,
  X,
  ArrowUpRight,
  FileText,
  UserCheck,
  Clock3,
  UploadCloud,
  Contact,
  MessageSquare,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import ClientManagement from "./ClientManagement";
import DocumentManagement from "./DocumentManagement";
import FeeManagement from "./FeeManagement";
import AdminSettings from "./AdminSettings";
import WebsitePageManagement from "./WebsitePageManagement";
import Reports from "./Reports";
import AdminEnquiries from "./AdminEnquiries";
import "./AdminDashboard.css";

const navigationItems = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "Client Management", icon: Users },
  { label: "Documents", icon: FolderOpen },
  { label: "Fee Management", icon: Wallet },
  { label: "Reports", icon: BarChart3 },
  { label: "Admin Enquiries", icon: Contact },
  { label: "Settings", icon: Settings },
  { label: "Website Page Management", icon: PanelsTopLeft },
];  

const recentActivity = [
  {
    id: 1,
    title: "New client registration",
    description: "A client submitted an account application.",
    time: "Recently",
    icon: UserCheck,
    color: "blue",
  },
  {
    id: 2,
    title: "Document uploaded",
    description: "A client submitted a document for review.",
    time: "Recently",
    icon: UploadCloud,
    color: "teal",
  },
  {
    id: 3,
    title: "Fee request pending",
    description: "A fee request is awaiting payment.",
    time: "Recently",
    icon: Wallet,
    color: "orange",
  },
  {
    id: 4,
    title: "Client message",
    description: "A client communication needs attention.",
    time: "Recently",
    icon: MessageSquare,
    color: "purple",
  },
];

const quickActions = [
  {
    title: "Review client applications",
    description: "Approve or reject registrations.",
    icon: Users,
    target: "Client Management",
  },
  {
    title: "Upload a client document",
    description: "Share a file with a specific client.",
    icon: UploadCloud,
    target: "Documents",
  },
  {
    title: "Create a fee request",
    description: "Request a fee from a client.",
    icon: Wallet,
    target: "Fee Management",
  },
  {
    title: "Edit website content",
    description: "Manage public page information.",
    icon: PanelsTopLeft,
    target: "Website Page Management",
  },
  {
    title: "Admin Handle Enquiries",
    description: "Manage public messages.",
    icon: PanelsTopLeft,
    target: "Admin Enquiries",
  },
];


function formatOutstandingFees(fees) {
  if (!Array.isArray(fees) || fees.length === 0) {
    return "0";
  }

  return fees
    .map(({ currency, totalAmount }) => {
      const amount = new Intl.NumberFormat("en-US", {
        maximumFractionDigits: 2,
      }).format(Number(totalAmount) || 0);

      return `${currency} ${amount}`;
    })
    .join(" / ");
}

function getNotificationPreferenceKey(notification) {
  const text = [
    notification.type,
    notification.category,
    notification.eventType,
    notification.title,
    notification.message,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .replace(/[_-]+/g, " ");

  if (
    text.includes("product update") ||
    text.includes("product announcement")
  ) {
    return "productUpdates";
  }

  if (
    text.includes("overdue") ||
    text.includes("late payment")
  ) {
    return "overduePayments";
  }

  if (
    text.includes("document") ||
    text.includes("file upload")
  ) {
    return "clientDocuments";
  }

  if (
    text.includes("fee request") ||
    text.includes("fee payment") ||
    text.includes("payment request")
  ) {
    return "feeRequests";
  }

  if (
    text.includes("new client") ||
    text.includes("client registration") ||
    text.includes("client registered")
  ) {
    return "newClient";
  }

  // Unknown notification types remain visible by default.
  return null;
}

function formatAdminDate(value, dateFormat = "DD MMM YYYY") {
  if (!value) return "Recent";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Recent";
  }

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  switch (dateFormat) {
    case "YYYY-MM-DD":
      return `${year}-${month}-${day}`;

    case "MM/DD/YYYY":
      return `${month}/${day}/${year}`;

    case "DD/MM/YYYY":
      return `${day}/${month}/${year}`;

    case "DD MMM YYYY":
    default:
      return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(date);
  }
}

function AdminDashboard() {
const [activePage, setActivePage] = useState("Overview");
const [sidebarOpen, setSidebarOpen] = useState(false);
const [searchValue, setSearchValue] = useState("");
const [notificationsOpen, setNotificationsOpen] = useState(false);
const [notifications, setNotifications] = useState([]);
const [notificationsLoading, setNotificationsLoading] = useState(false);
const [notificationsError, setNotificationsError] = useState("");
const [readNotificationIds, setReadNotificationIds] = useState([]);
const notificationRef = useRef(null);
const [dashboardSummary, setDashboardSummary] = useState(null);
const [summaryLoading, setSummaryLoading] = useState(true);
const [summaryError, setSummaryError] = useState("");
const [notificationPreferences, setNotificationPreferences] = useState({
  newClient: true,
  clientDocuments: true,
  feeRequests: true,
  overduePayments: true,
  productUpdates: false,
});

const [displayPreferences, setDisplayPreferences] = useState({
  dateFormat: "DD MMM YYYY",
  rowsPerPage: "10",
  compactTables: false,
  confirmActions: true,
});

const [settingsLoading, setSettingsLoading] = useState(true);

const visibleNotifications = notifications.filter((notification) => {
  const text = [
    notification.type,
    notification.category,
    notification.eventType,
    notification.title,
    notification.message,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .replace(/[_-]+/g, " ");

  if (
    text.includes("overdue") ||
    text.includes("late payment")
  ) {
    return notificationPreferences.overduePayments !== false;
  }

  if (
    text.includes("document") ||
    text.includes("file upload")
  ) {
    return notificationPreferences.clientDocuments !== false;
  }

  if (
    text.includes("fee request") ||
    text.includes("fee payment") ||
    text.includes("payment request")
  ) {
    return notificationPreferences.feeRequests !== false;
  }

  if (
    text.includes("new client") ||
    text.includes("client registration") ||
    text.includes("client registered")
  ) {
    return notificationPreferences.newClient !== false;
  }

  if (
    text.includes("product update") ||
    text.includes("product announcement")
  ) {
    return notificationPreferences.productUpdates !== false;
  }

  return true;
});

const unreadCount = visibleNotifications.filter(
  (notification) =>
    !readNotificationIds.includes(notification.id)
).length;

useEffect(() => {
  let cancelled = false;

  async function loadPreferences() {
    try {
      setSettingsLoading(true);

      const result = await getAdminSettings();
      const settings = result.settings ?? {};

      if (cancelled) return;

      setNotificationPreferences((current) => ({
        ...current,
        ...(settings.notification_preferences ?? {}),
      }));

      setDisplayPreferences((current) => ({
        ...current,
        ...(settings.display_preferences ?? {}),
      }));
    } catch (error) {
      // Keep usable defaults if preferences cannot be loaded.
      console.error("Unable to load admin preferences:", error);
    } finally {
      if (!cancelled) {
        setSettingsLoading(false);
      }
    }
  }

  // Refresh when entering the dashboard or leaving Settings.
  if (activePage !== "Settings") {
    loadPreferences();
  }

  return () => {
    cancelled = true;
  };
}, [activePage]);
useEffect(() => {
  let cancelled = false;

  async function loadDashboardSummary() {
    try {
      setSummaryLoading(true);
      setSummaryError("");

      const result = await getAdminDashboardSummary();

      if (!cancelled) {
        setDashboardSummary(result.data);
      }
    } catch (error) {
      if (!cancelled) {
        setSummaryError(error.message);
      }
    } finally {
      if (!cancelled) {
        setSummaryLoading(false);
      }
    }
  }

  loadDashboardSummary();

  return () => {
    cancelled = true;
  };
}, []);

const overviewStats = [
  {
    label: "Total Clients",
    value: summaryLoading
      ? "Loading..."
      : summaryError
        ? "Unavailable"
        : String(dashboardSummary?.totalClients ?? 0),
    note: "Registered client accounts",
    icon: Users,
    color: "blue",
  },
  {
    label: "Pending Approvals",
    value: summaryLoading
      ? "Loading..."
      : summaryError
        ? "Unavailable"
        : String(dashboardSummary?.pendingApprovals ?? 0),
    note: "Require admin review",
    icon: UserCheck,
    color: "orange",
  },
  {
    label: "Client Documents",
    value: summaryLoading
      ? "Loading..."
      : summaryError
        ? "Unavailable"
        : String(dashboardSummary?.clientDocuments ?? 0),
    note: "Uploaded by clients",
    icon: FileText,
    color: "teal",
  },
  {
    label: "Outstanding Fees",
    value: summaryLoading
      ? "Loading..."
      : summaryError
        ? "Unavailable"
        : formatOutstandingFees(
            dashboardSummary?.outstandingFees
          ),
    note: "Pending and overdue, by currency",
    icon: Wallet,
    color: "purple",
  },
];

const loadNotifications = async () => {
  setNotificationsLoading(true);
  setNotificationsError("");

  try {
    // Backend endpoint to be implemented in Step 2.
    const result = await apiRequest("/admin/notifications");

    const items = Array.isArray(result.data)
      ? result.data
      : result.data?.notifications;

    if (!Array.isArray(items)) {
      throw new Error("The server returned an invalid notification list.");
    }

    setNotifications(items);
  } catch (error) {
    setNotificationsError(
      error.message || "Unable to load notifications."
    );
  } finally {
    setNotificationsLoading(false);
  }
};

const toggleNotifications = async () => {
  const willOpen = !notificationsOpen;
  setNotificationsOpen(willOpen);

  if (willOpen) {
    await loadNotifications();
  }
};

const openNotification = (notification) => {
  const validPages = [
    "Client Management",
    "Documents",
    "Fee Management",
    "Admin Enquiries",
    "Reports",
  ];

  if (validPages.includes(notification.target)) {
    openPage(notification.target);
    setNotificationsOpen(false);
  }

  setReadNotificationIds((current) =>
    current.includes(notification.id)
      ? current
      : [...current, notification.id]
  );
};

const markAllNotificationsRead = () => {
  setReadNotificationIds((current) => [
    ...new Set([
      ...current,
      ...visibleNotifications.map((notification) => notification.id),
    ]),
  ]);
};

useEffect(() => {
  if (!notificationsOpen) return undefined;

  const handleOutsideClick = (event) => {
    if (
      notificationRef.current &&
      !notificationRef.current.contains(event.target)
    ) {
      setNotificationsOpen(false);
    }
  };

  const handleEscape = (event) => {
    if (event.key === "Escape") {
      setNotificationsOpen(false);
    }
  };

  document.addEventListener("mousedown", handleOutsideClick);
  document.addEventListener("keydown", handleEscape);

  return () => {
    document.removeEventListener("mousedown", handleOutsideClick);
    document.removeEventListener("keydown", handleEscape);
  };
}, [notificationsOpen]);
  const openPage = (page) => {
    setActivePage(page);
    setSidebarOpen(false);
  };

  const activeNavItem = navigationItems.find(
    (item) => item.label === activePage
  );

  const ActiveIcon = activeNavItem?.icon || LayoutDashboard;

  return (
    <div
      className={`admin-dashboard ${
        displayPreferences.compactTables
          ? "admin-dashboard--compact-tables"
          : ""
      }`}
      data-rows-per-page={displayPreferences.rowsPerPage}
    >
      {sidebarOpen && (
        <button
          type="button"
          className="admin-dashboard__overlay"
          aria-label="Close navigation menu"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`admin-sidebar ${
          sidebarOpen ? "admin-sidebar--open" : ""
        }`}
      >
        <div className="admin-sidebar__brand">
          <div className="admin-sidebar__brand-icon">
            <ShieldCheck size={25} />
          </div>

          <div className="admin-sidebar__brand-text">
            <span className="admin-sidebar__brand-name">Zafar Law Chamber</span>
            <span className="admin-sidebar__brand-caption">
              ADMIN WORKSPACE
            </span>
          </div>

          <button
            type="button"
            className="admin-icon-button admin-sidebar__close"
            aria-label="Close sidebar"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <div className="admin-sidebar__section-label">
          WORKSPACE
        </div>

        <nav className="admin-sidebar__nav" aria-label="Admin navigation">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.label;

            return (
              <button
                type="button"
                key={item.label}
                className={`admin-nav-item ${
                  isActive ? "admin-nav-item--active" : ""
                }`}
                aria-current={isActive ? "page" : undefined}
                onClick={() => openPage(item.label)}
              >
                <Icon size={19} strokeWidth={1.9} />
                <span>{item.label}</span>
                {isActive && (
                  <span className="admin-nav-item__indicator" />
                )}
              </button>
            );
          })}
        </nav>

        <div className="admin-sidebar__bottom">
          <div className="admin-sidebar__support">
            <div className="admin-sidebar__support-icon">
              <ShieldCheck size={20} />
            </div>
            <div>
              <strong>Secure workspace</strong>
              <p>Manage client information carefully.</p>
            </div>
          </div>

          <button
            type="button"
            className="admin-sidebar__logout"
            onClick={logout}
          >
            <LogOut size={18} />
            <span>Back to Login</span>
          </button>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <div className="admin-topbar__left">
            <button
              type="button"
              className="admin-icon-button admin-topbar__menu"
              aria-label="Open navigation menu"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={22} />
            </button>

            <div className="admin-breadcrumb">
              <span>Admin</span>
              <ChevronRight size={15} />
              <strong>{activePage}</strong>
            </div>
          </div>

          <div className="admin-topbar__right">
            <label className="admin-search">
              <Search size={18} />
              <input
                type="search"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Search dashboard..."
                aria-label="Search dashboard"
              />
            </label>

           <div
  className="admin-notification"
  ref={notificationRef}
>
  <button
    type="button"
    className="admin-icon-button admin-topbar__notification"
    aria-label={
      unreadCount > 0
        ? `Notifications, ${unreadCount} unread`
        : "Notifications"
    }
    aria-expanded={notificationsOpen}
    aria-controls="admin-notification-panel"
    onClick={toggleNotifications}
  >
    <Bell size={20} />

    {unreadCount > 0 && (
      <span className="admin-notification__badge">
        {unreadCount > 99 ? "99+" : unreadCount}
      </span>
    )}
  </button>

  {notificationsOpen && (
    <section
      className="admin-notification__panel"
      id="admin-notification-panel"
      aria-label="Admin notifications"
    >
      <div className="admin-notification__header">
        <div>
          <h2>Notifications</h2>
          <p>
            {unreadCount} unread
          </p>
        </div>

        <button
          type="button"
          className="admin-notification__text-button"
          onClick={markAllNotificationsRead}
          disabled={unreadCount === 0}
        >
          <CheckCheck size={15} />
          Mark all read
        </button>
      </div>

      {notificationsLoading ? (
        <div className="admin-notification__state" role="status">
          <RefreshCw size={18} />
          Loading notifications...
        </div>
      ) : notificationsError ? (
        <div className="admin-notification__state admin-notification__state--error">
          <CircleAlert size={19} />
          <div>
            <p>{notificationsError}</p>
            <button
              type="button"
              className="admin-notification__text-button"
              onClick={loadNotifications}
            >
              Try again
            </button>
          </div>
        </div>
      ) : visibleNotifications.length === 0 ? (
        <div className="admin-notification__state">
          <Check size={20} />
          You're all caught up.
        </div>
      ) : (
        <div className="admin-notification__list">
          {visibleNotifications.map((notification) => {
            const isRead = readNotificationIds.includes(
              notification.id
            );

            return (
              <button
                type="button"
                key={notification.id}
                className={`admin-notification__item ${
                  isRead
                    ? "admin-notification__item--read"
                    : ""
                }`}
                onClick={() => openNotification(notification)}
              >
                <span className="admin-notification__item-icon">
                  <Bell size={17} />
                </span>

                <span className="admin-notification__item-content">
                  <strong>{notification.title}</strong>
                  <span>{notification.message}</span>
                  <small>
                    {formatAdminDate(
                      notification.createdAt,
                      displayPreferences.dateFormat
                    )}
                  </small>
                </span>

                {!isRead && (
                  <span
                    className="admin-notification__unread-dot"
                    aria-label="Unread"
                  />
                )}
              </button>
            );
          })}
        </div>
      )}

      <div className="admin-notification__footer">
        <button
          type="button"
          onClick={() => {
            setNotificationsOpen(false);
            openPage("Reports");
          }}
        >
          Open reports
          <ArrowUpRight size={15} />
        </button>
      </div>
    </section>
  )}
</div>

            <div className="admin-profile">
              <div className="admin-profile__avatar">A</div>
              <div className="admin-profile__details">
                <strong>Administrator</strong>
                <span>Admin account</span>
              </div>
            </div>
          </div>
        </header>

        <main className="admin-content">
          {activePage === "Overview" ? (
            <>
              <section className="admin-welcome">
                <div>
                  <div className="admin-welcome__eyebrow">
                    ADMINISTRATION
                  </div>
                  <h1>Dashboard Overview</h1>
                  <p>
                    Manage client accounts, documents, fees, and your
                    website from one workspace.
                  </p>
                </div>

                <div className="admin-welcome__badge">
                  <ShieldCheck size={17} />
                  <span>Admin workspace</span>
                </div>
              </section>

              <section
                className="admin-stats"
                aria-label="Dashboard summary"
              >
                {overviewStats.map((stat) => {
                  const Icon = stat.icon;

                  return (
                    <article
                      className="admin-stat-card"
                      key={stat.label}
                    >
                      <div className="admin-stat-card__top">
                        <span>{stat.label}</span>
                        <div
                          className={`admin-stat-card__icon admin-stat-card__icon--${stat.color}`}
                        >
                          <Icon size={21} />
                        </div>
                      </div>

                      <div className="admin-stat-card__value">
                        {stat.value}
                      </div>

                      <p>{stat.note}</p>
                    </article>
                  );
                })}
              </section>

{summaryError && (
  <div className="admin-summary-error" role="alert">
    <CircleAlert size={18} />
    <span>{summaryError}</span>
    <button
      type="button"
      onClick={async () => {
        try {
          setSummaryLoading(true);
          setSummaryError("");

          const result = await getAdminDashboardSummary();
          setDashboardSummary(result.data);
        } catch (error) {
          setSummaryError(error.message);
        } finally {
          setSummaryLoading(false);
        }
      }}
    >
      Retry
    </button>
  </div>
)}

              <section className="admin-overview-grid">
                <div className="admin-panel admin-activity">
                  <div className="admin-panel__header">
                    <div>
                      <h2>Recent Activity</h2>
                      <p>Illustrative activity entries</p>
                    </div>

                    <button
                      type="button"
                      className="admin-text-button"
                      onClick={() => openPage("Reports")}
                    >
                      View reports
                      <ArrowUpRight size={16} />
                    </button>
                  </div>

                  <div className="admin-activity__list">
                    {recentActivity
                      .filter((activity) => {
                        const search = searchValue.trim().toLowerCase();

                        return (
                          !search ||
                          `${activity.title} ${activity.description}`
                            .toLowerCase()
                            .includes(search)
                        );
                      })
                      .map((activity) => {
                        const Icon = activity.icon;

                        return (
                          <div
                            className="admin-activity__item"
                            key={activity.id}
                          >
                            <div
                              className={`admin-activity__icon admin-activity__icon--${activity.color}`}
                            >
                              <Icon size={19} />
                            </div>

                            <div className="admin-activity__details">
                              <strong>{activity.title}</strong>
                              <p>{activity.description}</p>
                            </div>

                            <span className="admin-activity__time">
                              {activity.time}
                            </span>
                          </div>
                        );
                      })}

                    {recentActivity.filter((activity) => {
                      const search = searchValue.trim().toLowerCase();

                      return (
                        !search ||
                        `${activity.title} ${activity.description}`
                          .toLowerCase()
                          .includes(search)
                      );
                    }).length === 0 && (
                      <div className="admin-empty-state">
                        No demonstration activities match your search.
                      </div>
                    )}
                  </div>
                </div>

                <div className="admin-panel admin-attention">
                  <div className="admin-panel__header">
                    <div>
                      <h2>Items to Review</h2>
                      <p>Suggested admin actions</p>
                    </div>
                    <Clock3 size={20} />
                  </div>

                  <button
                    type="button"
                    className="admin-attention__item"
                    onClick={() => openPage("Client Management")}
                  >
                    <span className="admin-attention__item-icon admin-attention__item-icon--orange">
                      <UserCheck size={19} />
                    </span>
                    <span className="admin-attention__item-text">
                      <strong>Client applications</strong>
                      <small>Review pending registrations</small>
                    </span>
                    <ChevronRight size={18} />
                  </button>

                  <button
                    type="button"
                    className="admin-attention__item"
                    onClick={() => openPage("Documents")}
                  >
                    <span className="admin-attention__item-icon admin-attention__item-icon--teal">
                      <FileText size={19} />
                    </span>
                    <span className="admin-attention__item-text">
                      <strong>Client documents</strong>
                      <small>Review uploaded files</small>
                    </span>
                    <ChevronRight size={18} />
                  </button>

                  <button
                    type="button"
                    className="admin-attention__item"
                    onClick={() => openPage("Fee Management")}
                  >
                    <span className="admin-attention__item-icon admin-attention__item-icon--purple">
                      <Wallet size={19} />
                    </span>
                    <span className="admin-attention__item-text">
                      <strong>Fee requests</strong>
                      <small>Manage client fee records</small>
                    </span>
                    <ChevronRight size={18} />
                  </button>
                </div>
              </section>

              <section className="admin-panel admin-quick-actions">
                <div className="admin-panel__header">
                  <div>
                    <h2>Quick Actions</h2>
                    <p>Jump directly to a management area</p>
                  </div>
                </div>

                <div className="admin-quick-actions__grid">
                  {quickActions.map((action) => {
                    const Icon = action.icon;

                    return (
                      <button
                        type="button"
                        className="admin-quick-action"
                        key={action.title}
                        onClick={() => openPage(action.target)}
                      >
                        <span className="admin-quick-action__icon">
                          <Icon size={21} />
                        </span>
                        <span className="admin-quick-action__text">
                          <strong>{action.title}</strong>
                          <small>{action.description}</small>
                        </span>
                        <ChevronRight size={18} />
                      </button>
                    );
                  })}
                </div>
              </section>
            </>
          ) : activePage === "Client Management" ? 
          (<ClientManagement />) : activePage === "Documents" ? 
          (<DocumentManagement />) : activePage === "Fee Management" ? 
          (<FeeManagement />) : activePage === "Reports" ? 
          (<Reports />) : activePage === "Settings" ? 
          (<AdminSettings />) : activePage === "Website Page Management" ? 
          (<WebsitePageManagement />) : activePage === "Admin Enquiries" ? 
          (<AdminEnquiries />) : (
            <section className="admin-module-placeholder">
              <div className="admin-module-placeholder__icon">
                <ActiveIcon size={30} />
              </div>
              <span className="admin-welcome__eyebrow">
                ADMIN MODULE
              </span>
              <h1>{activePage}</h1>
              <p>
                This module is reserved for the next development stage.
                The navigation is working, but its management features
                have not been implemented yet.
              </p>

              <button
                type="button"
                className="admin-primary-button"
                onClick={() => openPage("Overview")}
              >
                <LayoutDashboard size={18} />
                Return to Overview
              </button>
            </section>
          )}

          <footer className="admin-footer">
            <span>Zafar Law Chamber Admin Workspace</span>
          </footer>
        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;
