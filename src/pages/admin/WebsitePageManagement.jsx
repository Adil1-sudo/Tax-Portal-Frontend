import { useEffect, useState } from "react";
import {
  getAdminWebsitePages,
  saveAdminWebsitePage,
} from "../../services/adminApi";
import {
  Globe,
  Info,
  BriefcaseBusiness,
  Contact,
  Save,
  RotateCcw,
  Plus,
  Trash2,
  Eye,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import "./WebsitePageManagement.css";

const initialWebsiteContent = {
  about: {
    title: "Tax Support Built Around Your Business",
    description:
      "Zafar Law Chamber helps individuals and businesses organize their tax-related work with a clear, structured, and professional approach.",
    mission:
      "Make tax-related processes easier to understand and manage through organized records and dependable support.",
    values: [
      {
        title: "Professionalism",
        description:
          "We aim to provide a clear and respectful experience at every stage.",
      },
      {
        title: "Organization",
        description:
          "We encourage structured records and straightforward workflows.",
      },
      {
        title: "Transparency",
        description:
          "We communicate processes, requirements, and next steps clearly.",
      },
      {
        title: "Client Focus",
        description:
          "We build our service experience around each client's requirements.",
      },
    ],
  },
  services: [
    {
      id: 1,
      title: "Tax Preparation Support",
      description:
        "Organize relevant information and documentation for tax preparation.",
      active: true,
    },
    {
      id: 2,
      title: "Business Tax Support",
      description:
        "Support businesses with structured tax records and administrative workflows.",
      active: true,
    },
    {
      id: 3,
      title: "Tax Planning Guidance",
      description:
        "Help clients understand tax-related planning considerations and next steps.",
      active: true,
    },
    {
      id: 4,
      title: "Document Organization",
      description:
        "Keep important tax-related documents organized and accessible.",
      active: true,
    },
    {
      id: 5,
      title: "Individual Tax Support",
      description:
        "Assist individuals with organizing their tax information and records.",
      active: true,
    },
    {
      id: 6,
      title: "Tax Consultation",
      description:
        "Discuss tax-related questions and identify suitable next steps.",
      active: true,
    },
  ],
  contact: {
    email: "info@yourtax.com",
    phone: "+92 300 0000000",
    address: "Update your business address here",
    hours: "Monday–Friday, 9:00 AM–5:00 PM",
  },
};

const tabs = [
  { id: "about", label: "About Us", icon: Info },
  { id: "services", label: "Services", icon: BriefcaseBusiness },
  { id: "contact", label: "Contact Details", icon: Contact },
];

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}) {
  const fieldId = label.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  return (
    <div className="website-field">
      <label htmlFor={fieldId}>{label}</label>
      <input
        id={fieldId}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
      />
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
  required = false,
}) {
  const fieldId = label.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  return (
    <div className="website-field">
      <label htmlFor={fieldId}>{label}</label>
      <textarea
        id={fieldId}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={rows}
        required={required}
      />
    </div>
  );
}

function mapWebsitePages(rows, fallback) {
  const pages = Object.fromEntries(
    (Array.isArray(rows) ? rows : []).map((page) => [
      page.pageKey,
      page,
    ])
  );

  const aboutPage = pages.about;
  const servicesPage = pages.services;
  const contactPage = pages.contact;

  const aboutContent =
    aboutPage?.content &&
    typeof aboutPage.content === "object" &&
    !Array.isArray(aboutPage.content)
      ? aboutPage.content
      : {};

  const servicesContent = Array.isArray(servicesPage?.content)
    ? servicesPage.content
    : fallback.services;

  const contactContent =
    contactPage?.content &&
    typeof contactPage.content === "object" &&
    !Array.isArray(contactPage.content)
      ? contactPage.content
      : {};

  return {
    content: {
      about: {
        ...fallback.about,
        title: aboutPage?.title ?? fallback.about.title,
        description:
          aboutPage?.description ?? fallback.about.description,
        mission: aboutContent.mission ?? fallback.about.mission,
        values: Array.isArray(aboutContent.values)
          ? aboutContent.values
          : fallback.about.values,
      },

      services: servicesContent.map((service, index) => ({
        id: service.id ?? index + 1,
        title: service.title ?? "",
        description: service.description ?? "",
        active: service.active ?? service.isActive ?? true,
      })),

      contact: {
        ...fallback.contact,
        ...contactContent,
      },
    },

    publication: {
      about: Boolean(aboutPage?.isPublished),
      services: Boolean(servicesPage?.isPublished),
      contact: Boolean(contactPage?.isPublished),
    },
  };
}

export default function WebsitePageManagement() {
  const [activeTab, setActiveTab] = useState("about");
  const [draft, setDraft] = useState(() =>
    JSON.parse(JSON.stringify(initialWebsiteContent))
  );
  const [savedContent, setSavedContent] = useState(() =>
    JSON.parse(JSON.stringify(initialWebsiteContent))
  );
  const [notice, setNotice] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [nextServiceId, setNextServiceId] = useState(7);

  const updateAbout = (field, value) => {
    setDraft((current) => ({
      ...current,
      about: {
        ...current.about,
        [field]: value,
      },
    }));
    setNotice(null);
  };

const [publication, setPublication] = useState({
  about: false,
  services: false,
  contact: false,
});

const [savedPublication, setSavedPublication] = useState({
  about: false,
  services: false,
  contact: false,
});
const [isLoading, setIsLoading] = useState(true);
const [isSaving, setIsSaving] = useState(false);

useEffect(() => {
  let cancelled = false;

  async function loadWebsitePages() {
    setIsLoading(true);

    try {
      const result = await getAdminWebsitePages();
      const mapped = mapWebsitePages(
        result.data,
        initialWebsiteContent
      );

      if (cancelled) return;

      setDraft(mapped.content);
      setSavedContent(
        JSON.parse(JSON.stringify(mapped.content))
      );

      setPublication(mapped.publication);
      setSavedPublication(mapped.publication);

      const highestServiceId = mapped.content.services.reduce(
        (highest, service) => Math.max(highest, Number(service.id) || 0),
        0
      );

      setNextServiceId(highestServiceId + 1);
      setNotice(null);
    } catch (error) {
      if (cancelled) return;

      setNotice({
        type: "error",
        text: error.message || "Unable to load website pages.",
      });
    } finally {
      if (!cancelled) setIsLoading(false);
    }
  }

  loadWebsitePages();

  return () => {
    cancelled = true;
  };
}, []);


  const updateValue = (index, field, value) => {
    setDraft((current) => ({
      ...current,
      about: {
        ...current.about,
        values: current.about.values.map((item, itemIndex) =>
          itemIndex === index ? { ...item, [field]: value } : item
        ),
      },
    }));
    setNotice(null);
  };

  const updateContact = (field, value) => {
    setDraft((current) => ({
      ...current,
      contact: {
        ...current.contact,
        [field]: value,
      },
    }));
    setNotice(null);
  };

  const updateService = (id, field, value) => {
    setDraft((current) => ({
      ...current,
      services: current.services.map((service) =>
        service.id === id ? { ...service, [field]: value } : service
      ),
    }));
    setNotice(null);
  };

  const addService = () => {
    const newService = {
      id: nextServiceId,
      title: "",
      description: "",
      active: true,
    };

    setDraft((current) => ({
      ...current,
      services: [...current.services, newService],
    }));

    setNextServiceId((current) => current + 1);
    setNotice(null);
  };

  const removeService = (id) => {
    setDraft((current) => ({
      ...current,
      services: current.services.filter((service) => service.id !== id),
    }));
    setNotice(null);
  };

const saveDraft = async (event) => {
  event.preventDefault();

  if (isLoading || isSaving) return;

  if (
    activeTab === "about" &&
    (!draft.about.title.trim() ||
      !draft.about.description.trim())
  ) {
    setNotice({
      type: "error",
      text: "Please complete the About Us heading and description.",
    });
    return;
  }

  if (
    activeTab === "services" &&
    draft.services.some(
      (service) =>
        !service.title.trim() || !service.description.trim()
    )
  ) {
    setNotice({
      type: "error",
      text: "Every service needs a title and description before saving.",
    });
    return;
  }

  if (
    activeTab === "contact" &&
    (!draft.contact.email.trim() ||
      !draft.contact.phone.trim())
  ) {
    setNotice({
      type: "error",
      text: "Please provide a contact email and phone number.",
    });
    return;
  }

  let payload;

  if (activeTab === "about") {
    payload = {
      pageKey: "about",
      title: draft.about.title,
      description: draft.about.description,
      content: {
        mission: draft.about.mission,
        values: draft.about.values,
      },
      isPublished: publication.about,
    };
  } else if (activeTab === "services") {
    payload = {
      pageKey: "services",
      title: "Our Services",
      description: "Explore the services offered by Zafar Law Chamber.",
      content: draft.services,
      isPublished: publication.services,
    };
  } else {
    payload = {
      pageKey: "contact",
      title: "Contact Us",
      description: "Contact Zafar Law Chamber for assistance and enquiries.",
      content: draft.contact,
      isPublished: publication.contact,
    };
  }

  setIsSaving(true);
  setNotice(null);

  try {
    const result = await saveAdminWebsitePage(payload);

    setSavedContent((current) => ({
      ...current,
      [activeTab]: JSON.parse(
        JSON.stringify(draft[activeTab])
      ),
    }));

    setSavedPublication((current) => ({
      ...current,
      [activeTab]: publication[activeTab],
    }));

    setNotice({
      type: "success",
      text: result.message || "Website page saved successfully.",
    });
  } catch (error) {
    setNotice({
      type: "error",
      text: error.message || "Unable to save this website page.",
    });
  } finally {
    setIsSaving(false);
  }
};
const resetDraft = () => {
  const confirmed = window.confirm(
    "Discard unsaved changes to this page and restore its last saved version?"
  );

  if (!confirmed) return;

  setDraft((current) => ({
    ...current,
    [activeTab]: JSON.parse(
      JSON.stringify(savedContent[activeTab])
    ),
  }));

  setPublication((current) => ({
    ...current,
    [activeTab]: savedPublication[activeTab],
  }));

  setNotice({
    type: "success",
    text: "Unsaved changes have been discarded.",
  });

  setPreviewOpen(false);
};

 const hasUnsavedChanges =
  JSON.stringify(draft[activeTab]) !==
    JSON.stringify(savedContent[activeTab]) ||
  publication[activeTab] !== savedPublication[activeTab];

  const activeServices = draft.services.filter((service) => service.active);

  return (
    <div className="website-page-management">
      <div className="website-page-header">
        <div className="website-page-heading">
          <span className="website-page-eyebrow">
            <Globe size={15} />
            Website administration
          </span>
          <h1>Website Page Management</h1>
          <p>
            Edit your public website content and review a draft preview before
            connecting these changes to the live pages.
          </p>
        </div>

        <div className="website-page-status">
          <span
            className={`website-status-dot ${
              hasUnsavedChanges ? "is-dirty" : ""
            }`}
          />
          {hasUnsavedChanges
            ? "Unsaved changes"
            : publication[activeTab]
              ? "Published"
              : "Saved draft"}
        </div>
      </div>

      <div className="website-demo-notice">
        <Globe size={20} />
        <div>
          <strong>Website content management</strong>
          <p>
            Changes are saved to the database for the selected page.
            Publishing status is stored separately for each page.
          </p>
        </div>
      </div>
                
      {isLoading && (
        <div className="website-notice" role="status">
          Loading website pages from the server...
        </div>
      )}

      {notice && (
        <div
          className={`website-notice website-notice-${notice.type}`}
          role={notice.type === "error" ? "alert" : "status"}
        >
          {notice.type === "success" ? (
            <CheckCircle2 size={19} />
          ) : (
            <AlertCircle size={19} />
          )}
          <span>{notice.text}</span>
        </div>
      )}

      <div className="website-editor-layout">
        <aside className="website-editor-sidebar" aria-label="Website sections">
          <span className="website-sidebar-label">EDIT PAGE</span>

          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              className={`website-tab ${activeTab === id ? "active" : ""}`}
              onClick={() => {
                setActiveTab(id);
                setNotice(null);
              }}
              aria-current={activeTab === id ? "page" : undefined}
            >
              <Icon size={18} />
              <span>{label}</span>
            </button>
          ))}

          <div className="website-sidebar-help">
            <Eye size={18} />
            <p>Use the preview to check your current draft.</p>
          </div>
        </aside>

        <main className="website-editor-main">
          <form onSubmit={saveDraft}>
            {activeTab === "about" && (
              <section className="website-editor-section">
                <div className="website-section-heading">
                  <div>
                    <h2>About Us content</h2>
                    <p>Edit the main introduction and company values.</p>
                  </div>
                  <span className="website-section-tag">About page</span>
                </div>

                <Field
                  label="Page heading"
                  value={draft.about.title}
                  onChange={(value) => updateAbout("title", value)}
                  placeholder="Enter the About Us heading"
                  required
                />

                <TextField
                  label="Introduction"
                  value={draft.about.description}
                  onChange={(value) => updateAbout("description", value)}
                  placeholder="Describe your business"
                  rows={4}
                  required
                />

                <TextField
                  label="Mission statement"
                  value={draft.about.mission}
                  onChange={(value) => updateAbout("mission", value)}
                  placeholder="Enter your mission statement"
                  rows={3}
                />

                <div className="website-subsection-heading">
                  <div>
                    <h3>Company values</h3>
                    <p>Update the values shown on your About Us page.</p>
                  </div>
                </div>

                <div className="website-values-grid">
                  {draft.about.values.map((item, index) => (
                    <div className="website-value-editor" key={index}>
                      <span className="website-value-number">
                        VALUE {index + 1}
                      </span>
                      <Field
                        label={`Value ${index + 1} title`}
                        value={item.title}
                        onChange={(value) =>
                          updateValue(index, "title", value)
                        }
                        required
                      />
                      <TextField
                        label={`Value ${index + 1} description`}
                        value={item.description}
                        onChange={(value) =>
                          updateValue(index, "description", value)
                        }
                        rows={3}
                        required
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {activeTab === "services" && (
              <section className="website-editor-section">
                <div className="website-section-heading">
                  <div>
                    <h2>Services page content</h2>
                    <p>
                      Manage service titles, descriptions, and visibility.
                    </p>
                  </div>
                  <span className="website-section-tag">
                    {activeServices.length} visible
                  </span>
                </div>

                <div className="website-service-list">
                  {draft.services.map((service, index) => (
                    <article className="website-service-editor" key={service.id}>
                      <div className="website-service-editor-top">
                        <span className="website-service-number">
                          SERVICE {index + 1}
                        </span>

                        <button
                          type="button"
                          className="website-remove-button"
                          onClick={() => removeService(service.id)}
                          aria-label={`Remove ${service.title || `service ${index + 1}`}`}
                        >
                          <Trash2 size={16} />
                          Remove
                        </button>
                      </div>

                      <Field
                        label={`Service ${index + 1} title`}
                        value={service.title}
                        onChange={(value) =>
                          updateService(service.id, "title", value)
                        }
                        placeholder="e.g. Business Tax Support"
                        required
                      />

                      <TextField
                        label={`Service ${index + 1} description`}
                        value={service.description}
                        onChange={(value) =>
                          updateService(service.id, "description", value)
                        }
                        placeholder="Explain what this service includes"
                        rows={3}
                        required
                      />

                      <label className="website-visibility-control">
                        <input
                          type="checkbox"
                          checked={service.active}
                          onChange={(event) =>
                            updateService(
                              service.id,
                              "active",
                              event.target.checked
                            )
                          }
                        />
                        <span>
                          <strong>Show this service</strong>
                          <small>
                            {service.active
                              ? "Included in the draft preview."
                              : "Hidden from the draft preview."}
                          </small>
                        </span>
                      </label>
                    </article>
                  ))}
                </div>

                <button
                  type="button"
                  className="website-add-service-button"
                  onClick={addService}
                >
                  <Plus size={18} />
                  Add another service
                </button>

                {draft.services.length === 0 && (
                  <div className="website-empty-state">
                    <BriefcaseBusiness size={24} />
                    <strong>No services added</strong>
                    <p>Add a service to start building this page.</p>
                  </div>
                )}
              </section>
            )}

            {activeTab === "contact" && (
              <section className="website-editor-section">
                <div className="website-section-heading">
                  <div>
                    <h2>Contact details</h2>
                    <p>
                      Manage the business contact information shown on your
                      public Contact page.
                    </p>
                  </div>
                  <span className="website-section-tag">Contact page</span>
                </div>

                <div className="website-form-grid">
                  <Field
                    label="Contact email"
                    value={draft.contact.email}
                    onChange={(value) => updateContact("email", value)}
                    placeholder="info@example.com"
                    type="email"
                    required
                  />

                  <Field
                    label="Phone number"
                    value={draft.contact.phone}
                    onChange={(value) => updateContact("phone", value)}
                    placeholder="+92 300 0000000"
                    type="tel"
                    required
                  />

                  <div className="website-full-width">
                    <TextField
                      label="Business address"
                      value={draft.contact.address}
                      onChange={(value) => updateContact("address", value)}
                      placeholder="Enter your business address"
                      rows={3}
                    />
                  </div>

                  <div className="website-full-width">
                    <Field
                      label="Business hours"
                      value={draft.contact.hours}
                      onChange={(value) => updateContact("hours", value)}
                      placeholder="Monday–Friday, 9:00 AM–5:00 PM"
                    />
                  </div>
                </div>

                <div className="website-contact-preview">
                  <Contact size={21} />
                  <div>
                    <strong>Contact information preview</strong>
                    <p>{draft.contact.email || "Email not provided"}</p>
                    <p>{draft.contact.phone || "Phone not provided"}</p>
                    <p>{draft.contact.address || "Address not provided"}</p>
                    <p>{draft.contact.hours || "Business hours not provided"}</p>
                  </div>
                </div>
              </section>
            )}
              <label className="website-visibility-control">
                <input
                  type="checkbox"
                  checked={publication[activeTab]}
                  onChange={(event) => {
                    setPublication((current) => ({
                      ...current,
                      [activeTab]: event.target.checked,
                    }));
                    setNotice(null);
                  }}
                />
              
                <span>
                  <strong>Publish this page</strong>
                  <small>
                    {publication[activeTab]
                      ? "This page is marked as published in the database."
                      : "This page is marked as an unpublished draft."}
                  </small>
                </span>
              </label>
            <div className="website-editor-actions">
              <button
                type="button"
                className="website-secondary-button"
                onClick={resetDraft}
              >
                <RotateCcw size={17} />
                Reset content
              </button>

              <div className="website-primary-actions">
                <button
                  type="button"
                  className="website-preview-button"
                  onClick={() => setPreviewOpen((current) => !current)}
                >
                  <Eye size={17} />
                  {previewOpen ? "Hide preview" : "Preview draft"}
                </button>
              <button
                type="submit"
                className="website-save-button"
                disabled={isLoading || isSaving}
              >
                <Save size={17} />
                {isLoading
                  ? "Loading..."
                  : isSaving
                    ? "Saving..."
                    : "Save page"}
              </button>
              </div>
            </div>
          </form>

          {previewOpen && (
            <section className="website-live-preview" aria-label="Draft preview">
              <div className="website-preview-heading">
                <div>
                  <span className="website-page-eyebrow">DRAFT PREVIEW</span>
                  <h2>
                    {activeTab === "about"
                      ? "About Us"
                      : activeTab === "services"
                        ? "Our Services"
                        : "Contact Us"}
                  </h2>
                </div>
                <Eye size={21} />
              </div>

              {activeTab === "about" && (
                <div className="website-preview-content">
                  <h3>{draft.about.title || "Untitled page heading"}</h3>
                  <p>{draft.about.description || "No introduction entered yet."}</p>
                  <h4>Our mission</h4>
                  <p>{draft.about.mission || "No mission statement entered yet."}</p>

                  <div className="website-preview-values">
                    {draft.about.values.map((item, index) => (
                      <article key={index}>
                        <strong>{item.title || "Untitled value"}</strong>
                        <p>{item.description || "No description entered."}</p>
                      </article>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "services" && (
                <div className="website-preview-service-grid">
                  {activeServices.map((service) => (
                    <article key={service.id}>
                      <BriefcaseBusiness size={20} />
                      <h3>{service.title || "Untitled service"}</h3>
                      <p>{service.description || "No description entered."}</p>
                    </article>
                  ))}
                  {activeServices.length === 0 && (
                    <p>No visible services in this draft.</p>
                  )}
                </div>
              )}

              {activeTab === "contact" && (
                <div className="website-preview-content">
                  <p><strong>Email:</strong> {draft.contact.email || "Not provided"}</p>
                  <p><strong>Phone:</strong> {draft.contact.phone || "Not provided"}</p>
                  <p><strong>Address:</strong> {draft.contact.address || "Not provided"}</p>
                  <p><strong>Hours:</strong> {draft.contact.hours || "Not provided"}</p>
                </div>
              )}
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
