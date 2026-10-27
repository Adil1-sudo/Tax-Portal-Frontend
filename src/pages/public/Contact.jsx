import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import usePublicWebsitePage from "../../hooks/usePublicWebsitePage";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileQuestion,
  MessageCircle,
  Send,
  ShieldCheck,
} from "lucide-react";
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";
import "./Contact.css";

const enquiryTypes = [
  "General enquiry",
  "Individual tax support",
  "Business tax support",
  "Tax planning guidance",
  "Document organization",
  "Other",
];


function Contact() {
  const { page, status, error } =  usePublicWebsitePage("contact");
  const location = useLocation();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    enquiryType: location.state?.service
      ? enquiryTypes.includes(location.state.service)
        ? location.state.service
        : "General enquiry"
      : "General enquiry",
    message: "",
    consent: false,
  });
  
  const [formStatus, setFormStatus] = useState("idle");
  if (status === "loading") {
  return (
    <main className="contact-page" aria-live="polite">
      <div className="container">
        <p>Loading contact page...</p>
      </div>
    </main>
  );
}

if (status === "error") {
  return (
    <main className="contact-page">
      <div className="container" role="status">
        <h1>Contact page unavailable</h1>
        <p>{error}</p>
      </div>
    </main>
  );
}

const contactDetails = page.content || {};

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (formStatus !== "idle") {
      setFormStatus("idle");
    }
  };


const handleSubmit = async (event) => {
  event.preventDefault();

  // Keep your existing browser and form validation.
  const form = event.currentTarget;

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  setFormStatus("submitting");

  try {
    const response = await fetch(`${API_BASE_URL}/contact`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        subject: formData.enquiryType,
        message: formData.message.trim(),
      }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(
        result.message || "Unable to submit your enquiry."
      );
    }

    setFormStatus("success");

    setFormData({
      name: "",
      email: "",
      phone: "",
      enquiryType: "",
      message: "",
      consent: false,
    });
  } catch (error) {
    console.error("Contact form submission failed:", error);
    setFormStatus("error");
  }
};


  return (
    <main className="contact-page">
      {/* Hero */}
      <section className="contact-hero">
        <div className="contact-hero__orb contact-hero__orb--one" />
        <div className="contact-hero__orb contact-hero__orb--two" />

        <div className="container contact-hero__inner">
          <div className="contact-hero__content">
            <span className="contact-eyebrow">
              <span className="contact-eyebrow__dot" />
              LET&apos;S START A CONVERSATION
            </span>

            <h1>{page.title}</h1>

            <p>{page.description}</p>

            <div className="contact-hero__features">
              <div>
                <span className="contact-hero__feature-icon">
                  <MessageCircle size={18} aria-hidden="true" />
                </span>
                <span>Tell us what you need</span>
              </div>

              <div>
                <span className="contact-hero__feature-icon">
                  <FileQuestion size={18} aria-hidden="true" />
                </span>
                <span>Clarify your requirements</span>
              </div>

              <div>
                <span className="contact-hero__feature-icon">
                  <ArrowRight size={18} aria-hidden="true" />
                </span>
                <span>Discuss the next steps</span>
              </div>
            </div>
          </div>

          <div className="contact-hero__visual" aria-hidden="true">
            <div className="contact-hero__visual-circle contact-hero__visual-circle--outer" />
            <div className="contact-hero__visual-circle contact-hero__visual-circle--inner" />

            <div className="contact-hero__visual-card">
              <div className="contact-hero__visual-icon">
                <MessageCircle size={31} />
              </div>

              <span className="contact-hero__visual-label">
                YOUR TAX
              </span>

              <h2>Every enquiry starts with understanding.</h2>

              <p>
                Share your question. We can identify what information is
                needed to move forward.
              </p>

              <div className="contact-hero__visual-footer">
                <ShieldCheck size={17} />
                <span>Share only the information needed</span>
              </div>
            </div>

            <div className="contact-hero__floating-icon contact-hero__floating-icon--one">
              <Send size={20} />
            </div>

            <div className="contact-hero__floating-icon contact-hero__floating-icon--two">
              <CheckCircle2 size={21} />
            </div>
          </div>
        </div>
      </section>

      {/* Contact form and enquiry guidance */}
      <section className="contact-main section">
        <div className="container contact-main__grid">
          <div className="contact-form-panel">
            <div className="contact-form-panel__heading">
              <span className="contact-eyebrow">CONTACT FORM</span>
              <h2>Send us an enquiry</h2>
              <p>
                Complete the fields below so your enquiry can be understood
                clearly.
              </p>
            </div>

            {formStatus === "demo" && (
              <div
                className="contact-form-alert"
                role="status"
                aria-live="polite"
              >
                <CheckCircle2 size={22} aria-hidden="true" />
                <div>
                  <strong>Form validation successful</strong>
                  <p>
                    This is a frontend demo. Your message has not been sent
                    or saved. A backend must be connected before this form
                    can submit a real enquiry.
                  </p>
                </div>
              </div>
            )}

            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="contact-form__row">
                <div className="contact-field">
                  <label htmlFor="contact-name">
                    Full name <span aria-hidden="true">*</span>
                  </label>
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                    maxLength={100}
                    required
                  />
                </div>

                <div className="contact-field">
                  <label htmlFor="contact-email">
                    Email address <span aria-hidden="true">*</span>
                  </label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    maxLength={254}
                    required
                  />
                </div>
              </div>

              <div className="contact-form__row">
                <div className="contact-field">
                  <label htmlFor="contact-phone">
                    Phone number <span className="contact-field__optional">(optional)</span>
                  </label>
                  <input
                    id="contact-phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={handleChange}
                    maxLength={30}
                  />
                </div>

                <div className="contact-field">
                  <label htmlFor="contact-enquiry">
                    Enquiry type <span aria-hidden="true">*</span>
                  </label>
                  <select
                    id="contact-enquiry"
                    name="enquiryType"
                    value={formData.enquiryType}
                    onChange={handleChange}
                    required
                  >
                    {enquiryTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="contact-field">
                <label htmlFor="contact-message">
                  How can we help? <span aria-hidden="true">*</span>
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows={6}
                  placeholder="Briefly describe your question or requirements..."
                  value={formData.message}
                  onChange={handleChange}
                  minLength={10}
                  maxLength={3000}
                  required
                />
                <span className="contact-field__hint">
                  {formData.message.length}/3000 characters
                </span>
              </div>

              <label className="contact-consent">
                <input
                  type="checkbox"
                  name="consent"
                  checked={formData.consent}
                  onChange={handleChange}
                  required
                />
                <span>
                  I agree to have the information I provide used to respond
                  to this enquiry, subject to the applicable privacy policy.
                  <span aria-hidden="true"> *</span>
                </span>
              </label>
              {formStatus === "submitting" && (
                <p role="status" aria-live="polite">
                  Submitting your enquiry...
                </p>
              )}
              
              {formStatus === "success" && (
                <p role="status" aria-live="polite">
                  Your enquiry has been submitted successfully.
                </p>
              )}
              
              {formStatus === "error" && (
                <p role="alert">
                  We could not submit your enquiry. Please check your connection
                  and try again.
                </p>
              )}
              <button className="contact-bottom__button" type="submit" disabled={formStatus === "submitting"}>
                {formStatus === "submitting" ? "Submitting..." : "Submit Enquiry"}
              </button>

              <p className="contact-form__disclaimer">
                Please do not include passwords, payment details, identity
                document numbers, or other sensitive financial information
                in this demo form.
              </p>
            </form>
          </div>

          <aside className="contact-sidebar">
            <div className="contact-sidebar__intro">
              <span className="contact-eyebrow">BEFORE YOU WRITE</span>
              <h2>A useful starting point</h2>
              <p>
                A few details can help make your enquiry easier to understand.
              </p>
            </div>

            <article className="contact-tip-card">
              <div className="contact-tip-card__icon">
                <FileQuestion size={22} aria-hidden="true" />
              </div>
              <div>
                <h3>Explain your requirement</h3>
                <p>
                  Tell us whether your question relates to an individual,
                  a business, documents, or another tax-related matter.
                </p>
              </div>
            </article>

            <article className="contact-tip-card">
              <div className="contact-tip-card__icon contact-tip-card__icon--teal">
                <Clock3 size={22} aria-hidden="true" />
              </div>
              <div>
                <h3>Mention important timing</h3>
                <p>
                  If there is a relevant deadline, include its date and
                  jurisdiction when appropriate.
                </p>
              </div>
            </article>

            <article className="contact-tip-card">
              <div className="contact-tip-card__icon contact-tip-card__icon--soft">
                <ShieldCheck size={22} aria-hidden="true" />
              </div>
              <div>
                <h3>Keep sensitive details private</h3>
                <p>
                  Use this initial enquiry to describe the issue, rather than
                  sending confidential financial records.
                </p>
              </div>
            </article>
            {(contactDetails.email ||
              contactDetails.phone ||
              contactDetails.address ||
              contactDetails.hours) && (
              <article className="contact-tip-card">
                <div>
                  <h3>Your Tax contact details</h3>
              
                  {contactDetails.email && (
                    <p>
                      Email:{" "}
                      <a href={`mailto:${contactDetails.email}`}>
                        {contactDetails.email}
                      </a>
                    </p>
                  )}
            
                  {contactDetails.phone && (
                    <p>
                      Phone:{" "}
                      <a href={`tel:${contactDetails.phone}`}>
                        {contactDetails.phone}
                      </a>
                    </p>
                  )}
            
                  {contactDetails.address && (
                    <p>Address: {contactDetails.address}</p>
                  )}
            
                  {contactDetails.hours && (
                    <p>Hours: {contactDetails.hours}</p>
                  )}
                </div>
              </article>
            )}
            <div className="contact-sidebar__help">
              <div className="contact-sidebar__help-icon">
                <MessageCircle size={22} aria-hidden="true" />
              </div>
              <h3>Still exploring your options?</h3>
              <p>
                Review the available service categories before choosing the
                type of enquiry that best fits your needs.
              </p>
              <Link to="/services" className="contact-sidebar__link">
                Explore our services
                <ArrowRight size={17} aria-hidden="true" />
              </Link>
            </div>
          </aside>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="contact-bottom">
        <div className="container contact-bottom__inner">
          <div>
            <span className="contact-bottom__eyebrow">
              A CLEARER NEXT STEP
            </span>
            <h2>Let&apos;s start with what you need.</h2>
            <p>
              Explore the services page to understand the support categories
              currently outlined for Your Tax.
            </p>
          </div>

          <Link to="/services" className="contact-bottom__button">
            View Services
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
  );
}

export default Contact;
