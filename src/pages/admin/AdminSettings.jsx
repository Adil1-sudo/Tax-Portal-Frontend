import { useEffect, useState } from "react";
import { useBusinessSettings } from "../../context/BusinessSettingsContext";
import {
  getAdminSettings,
  saveAdminSettings,
} from "../../services/adminApi";
import {
  Bell,
  Building2,
  Check,
  Eye,
  EyeOff,
  LockKeyhole,
  Save,
  Settings2,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import "./AdminSettings.css";

const initialBusiness = {
  businessName: "Zafar Law Chamber",
  contactName: "",
  email: "",
  phone: "",
  website: "",
  address: "",
  currency: "PKR",
  timezone: "Asia/Karachi",
};

const initialNotifications = {
  newClient: true,
  clientDocuments: true,
  feeRequests: true,
  overduePayments: true,
  productUpdates: false,
};

const initialPreferences = {
  dateFormat: "DD MMM YYYY",
  rowsPerPage: "10",
  compactTables: false,
  confirmActions: true,
};

function AdminSettings() {
  const [business, setBusiness] = useState(initialBusiness);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [preferences, setPreferences] = useState(initialPreferences);
  const [activeSection, setActiveSection] = useState("business");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [showSecurityDemo, setShowSecurityDemo] = useState(false);
  const [securityForm, setSecurityForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [savingSection, setSavingSection] = useState("");
  const { refreshBusinessSettings } = useBusinessSettings();
useEffect(() => {
  const businessName = business.businessName.trim() || "Zafar Law Chamber";
  document.title = `${businessName} | Admin Settings`;
}, [business.businessName]);
  const updateBusiness = (event) => {
    const { name, value } = event.target;
    setBusiness((current) => ({ ...current, [name]: value }));
    setNotice("");
    setError("");
  };

  const updateSecurity = (event) => {
    const { name, value } = event.target;
    setSecurityForm((current) => ({ ...current, [name]: value }));
    setNotice("");
    setError("");
  };

 const handleBusinessSave = async (event) => {
  event.preventDefault();
  setNotice("");
  setError("");

  if (!business.businessName.trim()) {
    setError("Enter a business name.");
    return;
  }

  if (!business.contactName.trim()) {
    setError("Enter the main contact person's name.");
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(business.email.trim())) {
    setError("Enter a valid business email address.");
    return;
  }

  await handleSaveSettings("business_profile", {
    ...business,
    businessName: business.businessName.trim(),
    contactName: business.contactName.trim(),
    email: business.email.trim(),
  });
};
useEffect(() => {
  let cancelled = false;

  async function loadSettings() {
    setIsLoading(true);
    setError("");

    try {
      const result = await getAdminSettings();

      if (cancelled) return;

      const settings = result.settings ?? {};

      setBusiness({
        ...initialBusiness,
        ...(settings.business_profile ?? {}),
      });

      setNotifications({
        ...initialNotifications,
        ...(settings.notification_preferences ?? {}),
      });

      setPreferences({
        ...initialPreferences,
        ...(settings.display_preferences ?? {}),
      });
    } catch (err) {
      if (!cancelled) {
        setError(err.message || "Unable to load settings.");
      }
    } finally {
      if (!cancelled) {
        setIsLoading(false);
      }
    }
  }

  loadSettings();

  return () => {
    cancelled = true;
  };
}, []);

async function handleSaveSettings(key, value) {
  setSavingSection(key);
  setNotice("");
  setError("");

  try {
    const result = await saveAdminSettings(key, value);

    const savedValue = result.setting?.value;

    if (savedValue) {
      if (key === "business_profile") {
        setBusiness((current) => ({
          ...current,
          ...savedValue,
        }));

        await refreshBusinessSettings();
      }

      if (key === "notification_preferences") {
        setNotifications((current) => ({
          ...current,
          ...savedValue,
        }));
      }

      if (key === "display_preferences") {
        setPreferences((current) => ({
          ...current,
          ...savedValue,
        }));
      }
    }

    setNotice("Settings saved successfully.");
  } catch (error) {
    setError(error.message || "Unable to save settings.");
  } finally {
    setSavingSection("");
  }
}
  const handleSecuritySubmit = (event) => {
    event.preventDefault();
    setNotice("");
    setError("");

    if (!securityForm.currentPassword) {
      setError("Enter your current password for this demo form.");
      return;
    }

    if (securityForm.newPassword.length < 8) {
      setError("The new password must contain at least 8 characters.");
      return;
    }

    if (securityForm.newPassword !== securityForm.confirmPassword) {
      setError("The new password and confirmation do not match.");
      return;
    }

    setError(
      "Password changes are not connected yet. Configure secure server-side authentication before enabling this feature."
    );
  };

const handleNotificationsSave = async (event) => {
  event.preventDefault();
  await handleSaveSettings(
    "notification_preferences",
    notifications
  );
};

const handlePreferencesSave = async (event) => {
  event.preventDefault();
  await handleSaveSettings(
    "display_preferences",
    preferences
  );
};

  const navigationItems = [
    { id: "business", label: "Business profile", icon: Building2 },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "preferences", label: "Display preferences", icon: Settings2 },
    { id: "security", label: "Security", icon: ShieldCheck },
  ];

  return (
    <section
      className="admin-settings"
      aria-labelledby="admin-settings-title"
    >
      <header className="admin-settings__header">
        <div>
          <span className="admin-settings__eyebrow">WORKSPACE CONFIGURATION</span>
          <h1 id="admin-settings-title">Admin Settings</h1>
          <p>
            Manage business information, notification preferences, display
            options, and security settings.
          </p>
        </div>
      </header>

          {isLoading && (
            <div className="admin-settings__demo-note" role="note">
             <Settings2 size={19} aria-hidden="true" />
              <p role="status">Loading your saved settings...</p>
            </div>
            )}
              
              {error && (
                <div className="admin-settings__demo-note" role="note">
                  <p role="alert">{error}</p>
                </div>
              )}
              
              {notice && (
                <div className="admin-settings__demo-note" role="note">
                  <p role="status">{notice}</p>
                </div>
          )}

      {notice && (
        <div className="admin-settings__notice" role="status">
          <Check size={18} aria-hidden="true" />
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice("")}>
            Dismiss
          </button>
        </div>
      )}

      {error && (
        <p className="admin-settings__error" role="alert">
          {error}
        </p>
      )}

      <div className="admin-settings__layout">
        <nav className="admin-settings__nav" aria-label="Settings sections">
          <div className="admin-settings__nav-heading">
            <Settings2 size={18} aria-hidden="true" />
            <span>Settings</span>
          </div>

          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                className={`admin-settings__nav-item ${
                  activeSection === item.id
                    ? "admin-settings__nav-item--active"
                    : ""
                }`}
                onClick={() => {
                  setActiveSection(item.id);
                  setNotice("");
                  setError("");
                }}
                aria-current={activeSection === item.id ? "page" : undefined}
              >
                <Icon size={18} aria-hidden="true" />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="admin-settings__nav-help">
            <ShieldCheck size={21} aria-hidden="true" />
            <strong>Keep your workspace secure</strong>
            <p>
              Use unique credentials and enable server-side protections when
              authentication is connected.
            </p>
          </div>
        </nav>

        <div className="admin-settings__content">
          {activeSection === "business" && (
            <form
              className="admin-settings__panel"
              onSubmit={handleBusinessSave}
            >
              <div className="admin-settings__panel-heading">
                <div className="admin-settings__panel-icon">
                  <Building2 size={21} aria-hidden="true" />
                </div>
                <div>
                  <h2>Business profile</h2>
                  <p>
                    Keep the main business contact information up to date.
                  </p>
                </div>
              </div>

              <div className="admin-settings__form-grid">
                <label className="admin-settings__field">
                  Business name <span aria-hidden="true">*</span>
                  <input
                    name="businessName"
                    value={business.businessName}
                    onChange={updateBusiness}
                    maxLength={100}
                    required
                  />
                </label>

                <label className="admin-settings__field">
                  Main contact person <span aria-hidden="true">*</span>
                  <input
                    name="contactName"
                    value={business.contactName}
                    onChange={updateBusiness}
                    placeholder="Enter contact name"
                    maxLength={100}
                    required
                  />
                </label>

                <label className="admin-settings__field">
                  Business email <span aria-hidden="true">*</span>
                  <input
                    name="email"
                    type="email"
                    value={business.email}
                    onChange={updateBusiness}
                    placeholder="office@example.com"
                    maxLength={254}
                    required
                  />
                </label>

                <label className="admin-settings__field">
                  Contact phone
                  <input
                    name="phone"
                    type="tel"
                    value={business.phone}
                    onChange={updateBusiness}
                    placeholder="Enter business phone"
                    maxLength={30}
                  />
                </label>

                <label className="admin-settings__field">
                  Business website
                  <input
                    name="website"
                    type="url"
                    value={business.website}
                    onChange={updateBusiness}
                    placeholder="https://example.com"
                    maxLength={255}
                  />
                </label>

                <label className="admin-settings__field">
                  Default currency
                  <select
                    name="currency"
                    value={business.currency}
                    onChange={updateBusiness}
                  >
                    <option value="PKR">PKR — Pakistani Rupee</option>
                    <option value="USD">USD — US Dollar</option>
                  </select>
                </label>

                <label className="admin-settings__field admin-settings__field--full">
                  Business address
                  <textarea
                    name="address"
                    value={business.address}
                    onChange={updateBusiness}
                    placeholder="Enter your business address"
                    rows={3}
                    maxLength={500}
                  />
                </label>

                <label className="admin-settings__field admin-settings__field--full">
                  Time zone
                  <select
                    name="timezone"
                    value={business.timezone}
                    onChange={updateBusiness}
                  >
                    <option value="Asia/Karachi">
                      Pakistan Standard Time — Asia/Karachi
                    </option>
                    <option value="America/New_York">
                      US Eastern Time — America/New_York
                    </option>
                    <option value="America/Chicago">
                      US Central Time — America/Chicago
                    </option>
                    <option value="America/Los_Angeles">
                      US Pacific Time — America/Los_Angeles
                    </option>
                    <option value="Europe/London">
                      UK Time — Europe/London
                    </option>
                    <option value="Asia/Dubai">
                      Gulf Standard Time — Asia/Dubai
                    </option>
                  </select>
                </label>
              </div>

              <div className="admin-settings__form-footer">
                <p>Fields marked with * are required.</p>
            <button
              type="submit"
              className="admin-settings__primary-button "
              disabled={isLoading || savingSection === "business_profile"}
            >
              <Save size={16} aria-hidden="true" />
              {savingSection === "business_profile"
                ? "Saving..."
                : "Save Changes"}
            </button>
              </div>
            </form>
          )}

          {activeSection === "notifications" && (
            <form className="admin-settings__panel" onSubmit={handleNotificationsSave}>
              <div className="admin-settings__panel-heading">
                <div className="admin-settings__panel-icon">
                  <Bell size={21} aria-hidden="true" />
                </div>
                <div>
                  <h2>Notification preferences</h2>
                  <p>
                    Choose which workspace events you want to receive
                    notifications about.
                  </p>
                </div>
              </div>

              <div className="admin-settings__toggle-list">
                {[
                  {
                    id: "newClient",
                    title: "New client registrations",
                    description:
                      "Notify the admin when someone submits a registration.",
                  },
                  {
                    id: "clientDocuments",
                    title: "Client document activity",
                    description:
                      "Notify the admin when requested documents are uploaded.",
                  },
                  {
                    id: "feeRequests",
                    title: "Fee request activity",
                    description:
                      "Notify the admin about fee request changes.",
                  },
                  {
                    id: "overduePayments",
                    title: "Overdue payments",
                    description:
                      "Notify the admin when a fee request becomes overdue.",
                  },
                  {
                    id: "productUpdates",
                    title: "Product and system updates",
                    description:
                      "Receive notices about changes to the application.",
                  },
                ].map((item) => (
                  <label className="admin-settings__toggle-row" key={item.id}>
                    <span className="admin-settings__toggle-copy">
                      <strong>{item.title}</strong>
                      <span>{item.description}</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={notifications[item.id]}
                      onChange={(event) => {
                        setNotifications((current) => ({
                          ...current,
                          [item.id]: event.target.checked,
                        }));
                        setNotice("");
                      }}
                    />
                  </label>
                ))}
              </div>

              <div className="admin-settings__form-footer">
                <p>These preferences do not send real notifications yet.</p>
                <button
                  type="submit"
                  disabled={isLoading || savingSection === "notification_preferences"}
                  className="admin-settings__primary-button"
                >
                  <Save size={17} aria-hidden="true" />
                  {savingSection === "notification_preferences"
                    ? "Saving..."
                    : "Save preferences"}
                </button>
              </div>
            </form>
          )}

          {activeSection === "preferences" && (
            <form className="admin-settings__panel" onSubmit={handlePreferencesSave}>
              <div className="admin-settings__panel-heading">
                <div className="admin-settings__panel-icon">
                  <Settings2 size={21} aria-hidden="true" />
                </div>
                <div>
                  <h2>Display preferences</h2>
                  <p>
                    Configure how dates and records should appear in the
                    dashboard.
                  </p>
                </div>
              </div>

              <div className="admin-settings__form-grid">
                <label className="admin-settings__field">
                  Date format
                  <select
                    value={preferences.dateFormat}
                    onChange={(event) =>
                      setPreferences((current) => ({
                        ...current,
                        dateFormat: event.target.value,
                      }))
                    }
                  >
                    <option value="DD MMM YYYY">21 Oct 2026</option>
                    <option value="YYYY-MM-DD">2026-10-21</option>
                    <option value="MM/DD/YYYY">10/21/2026</option>
                  </select>
                </label>

                <label className="admin-settings__field">
                  Rows per page
                  <select
                    value={preferences.rowsPerPage}
                    onChange={(event) =>
                      setPreferences((current) => ({
                        ...current,
                        rowsPerPage: event.target.value,
                      }))
                    }
                  >
                    <option value="10">10 rows</option>
                    <option value="25">25 rows</option>
                    <option value="50">50 rows</option>
                  </select>
                </label>
              </div>

              <div className="admin-settings__toggle-list">
                <label className="admin-settings__toggle-row">
                  <span className="admin-settings__toggle-copy">
                    <strong>Compact tables</strong>
                    <span>
                      Prefer tighter spacing in data tables when supported.
                    </span>
                  </span>
                  <input
                    type="checkbox"
                    checked={preferences.compactTables}
                    onChange={(event) =>
                      setPreferences((current) => ({
                        ...current,
                        compactTables: event.target.checked,
                      }))
                    }
                  />
                </label>

                <label className="admin-settings__toggle-row">
                  <span className="admin-settings__toggle-copy">
                    <strong>Confirm important actions</strong>
                    <span>
                      Prefer confirmation before destructive actions when
                      supported by a module.
                    </span>
                  </span>
                  <input
                    type="checkbox"
                    checked={preferences.confirmActions}
                    onChange={(event) =>
                      setPreferences((current) => ({
                        ...current,
                        confirmActions: event.target.checked,
                      }))
                    }
                  />
                </label>
              </div>

              <div className="admin-settings__form-footer">
                <p>Other pages must be connected to apply these preferences.</p>
                <button
                  type="submit"
                  disabled={isLoading || savingSection === "display_preferences"}
                  className="admin-settings__primary-button"
                >
                  <Save size={17} aria-hidden="true" />
                  {savingSection === "display_preferences"
                    ? "Saving..."
                    : "Save preferences"}
                </button>
              </div>
            </form>
          )}

          {activeSection === "security" && (
            <div className="admin-settings__panel">
              <div className="admin-settings__panel-heading">
                <div className="admin-settings__panel-icon">
                  <ShieldCheck size={21} aria-hidden="true" />
                </div>
                <div>
                  <h2>Security settings</h2>
                  <p>
                    Security controls that need backend authentication to work
                    safely.
                  </p>
                </div>
              </div>

              <div className="admin-settings__security-card">
                <div className="admin-settings__security-icon">
                  <LockKeyhole size={22} aria-hidden="true" />
                </div>
                <div>
                  <h3>Password management</h3>
                  <p>
                    A real password change must verify the current password on
                    the server and store only a securely hashed password.
                  </p>
                </div>
                <button
                  type="button"
                  className="admin-settings__secondary-button"
                  onClick={() => {
                    setShowSecurityDemo((current) => !current);
                    setError("");
                    setNotice("");
                  }}
                >
                  {showSecurityDemo ? "Close form" : "View demo form"}
                </button>
              </div>

              {showSecurityDemo && (
                <form
                  className="admin-settings__security-form"
                  onSubmit={handleSecuritySubmit}
                >
                  <div className="admin-settings__security-form-heading">
                    <UserRound size={19} aria-hidden="true" />
                    <h3>Demo password form</h3>
                  </div>

                  <p className="admin-settings__security-warning">
                    This form does not change your password. Do not enter a
                    real password here.
                  </p>

                  <label className="admin-settings__field">
                    Current password
                    <input
                      name="currentPassword"
                      type={showPasswords ? "text" : "password"}
                      value={securityForm.currentPassword}
                      onChange={updateSecurity}
                      autoComplete="off"
                      required
                    />
                  </label>

                  <label className="admin-settings__field">
                    New password
                    <input
                      name="newPassword"
                      type={showPasswords ? "text" : "password"}
                      value={securityForm.newPassword}
                      onChange={updateSecurity}
                      minLength={8}
                      autoComplete="off"
                      required
                    />
                  </label>

                  <label className="admin-settings__field">
                    Confirm new password
                    <input
                      name="confirmPassword"
                      type={showPasswords ? "text" : "password"}
                      value={securityForm.confirmPassword}
                      onChange={updateSecurity}
                      minLength={8}
                      autoComplete="off"
                      required
                    />
                  </label>

                  <button
                    type="button"
                    className="admin-settings__visibility-button"
                    onClick={() => setShowPasswords((current) => !current)}
                  >
                    {showPasswords ? (
                      <EyeOff size={16} aria-hidden="true" />
                    ) : (
                      <Eye size={16} aria-hidden="true" />
                    )}
                    {showPasswords ? "Hide passwords" : "Show passwords"}
                  </button>

                  <button
                    type="submit"
                    className="admin-settings__primary-button"
                  >
                    <LockKeyhole size={17} aria-hidden="true" />
                    Validate demo form
                  </button>
                </form>
              )}

              <div className="admin-settings__security-checklist">
                <h3>Before production</h3>
                <ul>
                  <li>Protect admin routes with server-side authorization.</li>
                  <li>Hash passwords with a suitable password-hashing algorithm.</li>
                  <li>Use secure session handling and appropriate cookie settings.</li>
                  <li>Validate permissions for sensitive client records and files.</li>
                  <li>Record important administrative actions in an audit log.</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default AdminSettings;
