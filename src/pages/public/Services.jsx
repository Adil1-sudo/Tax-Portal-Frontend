import { useState } from "react";
import { Link } from "react-router-dom";
import usePublicWebsitePage from "../../hooks/usePublicWebsitePage";
import {
  ArrowDown,
  ArrowRight,
  BriefcaseBusiness,
  Calculator,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  FileCheck2,
  FileText,
  Landmark,
  MessageCircle,
  ShieldCheck,
  Users,
} from "lucide-react";
import "./Services.css";

const services = [
  {
    id: "tax-preparation",
    number: "01",
    icon: FileText,
    title: "Tax Preparation Support",
    description:
      "Get help organizing the information and documents needed for Zafar Law Chamber-related work.",
    features: [
      "Organizing relevant tax documents",
      "Reviewing information provided",
      "Identifying missing information",
      "Discussing the next steps",
    ],
  },
  {
    id: "business-tax",
    number: "02",
    icon: BriefcaseBusiness,
    title: "Business Tax Support",
    description:
      "Practical support for businesses that need a more organized approach to tax-related responsibilities.",
    features: [
      "Understanding business requirements",
      "Organizing financial records",
      "Preparing relevant information",
      "Planning the workflow with your adviser",
    ],
  },
  {
    id: "tax-planning",
    number: "03",
    icon: Calculator,
    title: "Tax Planning Guidance",
    description:
      "Discuss your circumstances and understand the questions to consider when planning ahead.",
    features: [
      "Understanding your circumstances",
      "Identifying relevant considerations",
      "Discussing potential options",
      "Planning appropriate next steps",
    ],
  },
  {
    id: "document-management",
    number: "04",
    icon: ClipboardCheck,
    title: "Document Organization",
    description:
      "Make relevant paperwork easier to collect, review, and keep organized throughout the process.",
    features: [
      "Creating a document checklist",
      "Organizing records by category",
      "Identifying missing documents",
      "Preparing information for review",
    ],
  },
  {
    id: "individual-support",
    number: "05",
    icon: Users,
    title: "Individual Tax Support",
    description:
      "Get help understanding the information and documents relevant to your individual circumstances.",
    features: [
      "Discussing your requirements",
      "Identifying relevant records",
      "Clarifying the preparation process",
      "Understanding the next steps",
    ],
  },
  {
    id: "business-consultation",
    number: "06",
    icon: Landmark,
    title: "Tax Consultation",
    description:
      "Start with a conversation about your requirements and determine what type of professional support may be appropriate.",
    features: [
      "Discussing your main concerns",
      "Clarifying the scope of support",
      "Identifying information to prepare",
      "Agreeing on a way forward",
    ],
  },
];

const processSteps = [
  {
    number: "01",
    title: "Share your requirements",
    description:
      "Tell us about your situation and the kind of tax-related support you are looking for.",
  },
  {
    number: "02",
    title: "Review the details",
    description:
      "Discuss relevant information, documents, the scope of work, and any outstanding questions.",
  },
  {
    number: "03",
    title: "Agree on next steps",
    description:
      "Understand the proposed process and any agreed responsibilities before work begins.",
  },
];

const faqs = [
  {
    question: "How do I know which service I need?",
    answer:
      "Start by contacting us and briefly explaining your circumstances. We can discuss your requirements and clarify which type of support may be appropriate.",
  },
  {
    question: "What documents should I prepare?",
    answer:
      "The documents depend on your circumstances and the service required. After discussing your needs, you can prepare the relevant records and ask which additional documents may be necessary.",
  },
  {
    question: "Can businesses request tax-related support?",
    answer:
      "The services listed include business-oriented support. Contact us with your business requirements so we can clarify whether the requested work falls within our actual service scope.",
  },
  {
    question: "How do I get started?",
    answer:
      "Visit our Contact page and send an enquiry describing the support you need. We can then discuss the requirements and possible next steps.",
  },
  {
    question: "Does contacting Zafar Law Chamber automatically engage your services?",
    answer:
      "No. An enquiry is an initial conversation, not an engagement agreement. The scope, responsibilities, fees, and any applicable terms should be agreed upon separately before work starts.",
  },
];

function Services() {
const { page, status, error } =
  usePublicWebsitePage("services");

const [openFaq, setOpenFaq] = useState(0);

if (status === "loading") {
  return (
    <main className="services-page" aria-live="polite">
      <div className="services-container">
        <p>Loading services...</p>
      </div>
    </main>
  );
}

if (status === "error") {
  return (
    <main className="services-page">
      <div className="services-container" role="status">
        <h1>Services page unavailable</h1>
        <p>{error}</p>
      </div>
    </main>
  );
}

const savedServices = Array.isArray(page.content)
  ? page.content
  : [];

const displayServices = savedServices
  .filter((service) => service.active !== false)
  .map((service, index) => {
    const original = services[index];

    return {
      ...service,
      id: original?.id ?? `service-${index + 1}`,
      number: String(index + 1).padStart(2, "0"),
      icon: original?.icon ?? FileCheck2,
      features: original?.features ?? [],
    };
  });
  return (
    <div className="services-page">
      {/* Page hero */}
      <section className="services-hero">
        <div className="services-container services-hero__inner">
          <div className="services-hero__content">
            <span className="services-eyebrow">
              <ShieldCheck size={17} aria-hidden="true" />
              OUR SERVICES
            </span>

            <h1><h1>{page.title}</h1></h1>

            <p>{page.description}</p>

            <div className="services-hero__actions">
              <Link
                to="/contact"
                className="services-button services-button--primary"
              >
                Discuss Your Needs
                <ArrowRight size={18} aria-hidden="true" />
              </Link>

              <a
                href="#service-list"
                className="services-button services-button--secondary"
              >
                Explore Services
                <ArrowDown size={17} aria-hidden="true" />
              </a>
            </div>
          </div>

          <div className="services-hero__visual" aria-hidden="true">
            <div className="services-hero__orbit services-hero__orbit--outer" />
            <div className="services-hero__orbit services-hero__orbit--inner" />

            <div className="services-hero__center">
              <FileCheck2 size={53} strokeWidth={1.6} />
            </div>

            <div className="services-hero__float services-hero__float--one">
              <FileText size={23} />
            </div>

            <div className="services-hero__float services-hero__float--two">
              <Calculator size={23} />
            </div>

            <div className="services-hero__float services-hero__float--three">
              <ShieldCheck size={23} />
            </div>

            <div className="services-hero__label">
              <span />
              Organized. Clear. Practical.
            </div>
          </div>
        </div>
      </section>

      {/* Service overview */}
      <section className="services-section" id="service-list">
        <div className="services-container">
          <div className="services-section-heading">
            <span className="services-eyebrow">HOW WE CAN HELP</span>
            <h2>
              Find the support
              <span> you’re looking for.</span>
            </h2>
            <p>
              Start with the service that best matches your needs. The exact
              scope will be confirmed during your initial discussion.
            </p>
          </div>

          <div className="services-grid">
            {displayServices.map((service) => {
              const Icon = service.icon;

              return (
                <article
                  className="services-card"
                  id={service.id}
                  key={service.id}
                >
                  <div className="services-card__top">
                    <div className="services-icon">
                      <Icon size={25} aria-hidden="true" />
                    </div>
                    <span className="services-card__number">
                      {service.number}
                    </span>
                  </div>

                  <h3>{service.title}</h3>
                  <p className="services-card__description">
                    {service.description}
                  </p>

                  <div className="services-card__divider" />

                  <ul className="services-card__features">
                    {service.features.map((feature) => (
                      <li key={feature}>
                        <CheckCircle2 size={17} aria-hidden="true" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    to="/contact"
                    className="services-card__link"
                    state={{ service: service.title }}
                  >
                    Enquire about this service
                    <ArrowRight size={17} aria-hidden="true" />
                  </Link>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="services-process">
        <div className="services-container">
          <div className="services-section-heading">
            <span className="services-eyebrow">OUR APPROACH</span>
            <h2>
              Simple steps.
              <span> Clear expectations.</span>
            </h2>
            <p>
              Understand how an initial enquiry can progress into an agreed
              working arrangement.
            </p>
          </div>

          <div className="services-process__grid">
            {processSteps.map((step) => (
              <article className="services-process-card" key={step.number}>
                <span className="services-process-card__number">
                  {step.number}
                </span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Professional approach */}
      <section className="services-approach">
        <div className="services-container services-approach__grid">
          <div className="services-approach__visual">
            <div className="services-approach__document">
              <div className="services-approach__document-icon">
                <ClipboardCheck size={32} aria-hidden="true" />
              </div>

              <span className="services-approach__document-label">
                A CLEARER PROCESS
              </span>

              <div className="services-approach__line services-approach__line--long" />
              <div className="services-approach__line" />
              <div className="services-approach__line services-approach__line--short" />

              <div className="services-approach__document-check">
                <CheckCircle2 size={18} aria-hidden="true" />
                Keep the next step clear
              </div>
            </div>
          </div>

          <div className="services-approach__content">
            <span className="services-eyebrow">A PRACTICAL APPROACH</span>
            <h2>
              Know what’s needed
              <span> before moving forward.</span>
            </h2>
            <p>
              Good preparation starts with understanding your requirements,
              gathering relevant records, and agreeing on what will happen
              next.
            </p>

            <ul>
              <li>
                <CheckCircle2 size={20} aria-hidden="true" />
                Clear communication about requirements
              </li>
              <li>
                <CheckCircle2 size={20} aria-hidden="true" />
                An agreed scope of work
              </li>
              <li>
                <CheckCircle2 size={20} aria-hidden="true" />
                Relevant documents organized for review
              </li>
              <li>
                <CheckCircle2 size={20} aria-hidden="true" />
                Transparent discussion of the next steps
              </li>
            </ul>

            <Link
              to="/about"
              className="services-button services-button--primary"
            >
              Learn About Zafar Law Chamber
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="services-faq">
        <div className="services-container services-faq__grid">
          <div className="services-faq__intro">
            <span className="services-eyebrow">COMMON QUESTIONS</span>
            <h2>
              A few things
              <span> you may want to know.</span>
            </h2>
            <p>
              Have a question that isn’t covered here? Contact us and tell us
              what you need help with.
            </p>

            <Link to="/contact" className="services-faq__contact">
              <MessageCircle size={18} aria-hidden="true" />
              Ask us a question
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>

          <div className="services-faq__list">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              const answerId = `services-faq-answer-${index}`;

              return (
                <article
                  className={`services-faq__item ${
                    isOpen ? "is-open" : ""
                  }`}
                  key={faq.question}
                >
                  <h3>
                    <button
                      type="button"
                      className="services-faq__question"
                      aria-expanded={isOpen}
                      aria-controls={answerId}
                      onClick={() =>
                        setOpenFaq(isOpen ? -1 : index)
                      }
                    >
                      <span>{faq.question}</span>
                      <ChevronDown
                        size={20}
                        aria-hidden="true"
                        className="services-faq__chevron"
                      />
                    </button>
                  </h3>

                  {isOpen && (
                    <div
                      className="services-faq__answer"
                      id={answerId}
                    >
                      <p>{faq.answer}</p>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="services-cta">
        <div className="services-container services-cta__inner">
          <div>
            <span className="services-eyebrow services-eyebrow--light">
              YOUR NEXT STEP STARTS HERE
            </span>
            <h2>Let’s discuss what you need.</h2>
            <p>
              Tell us about your requirements and start a conversation with
              Zafar Law Chamber.
            </p>
          </div>

          <Link
            to="/contact"
            className="services-button services-button--light"
          >
            Contact Our Team
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Services;
