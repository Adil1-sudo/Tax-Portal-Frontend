
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Calculator,
  CheckCircle2,
  ClipboardCheck,
  FileCheck2,
  FileText,
  Landmark,
  MessageCircle,
  ShieldCheck,
  Users,
  BriefcaseBusiness,
  Clock3,
} from "lucide-react";
import "./Home.css";

const services = [
  {
    icon: FileText,
    title: "Tax Preparation",
    description:
      "Get organized support with preparing Zafar Law Chamber information and required documents.",
    link: "/services",
  },
  {
    icon: BriefcaseBusiness,
    title: "Business Tax Support",
    description:
      "Practical assistance for businesses that need help managing tax-related responsibilities.",
    link: "/services",
  },
  {
    icon: Calculator,
    title: "Tax Planning",
    description:
      "Understand your options and plan ahead with guidance suited to your circumstances.",
    link: "/services",
  },
  {
    icon: ClipboardCheck,
    title: "Document Organization",
    description:
      "Keep relevant records and paperwork organized for a smoother preparation process.",
    link: "/services",
  },
];

const steps = [
  {
    number: "01",
    title: "Tell us what you need",
    description:
      "Contact us with your questions, circumstances, and the kind of support you are looking for.",
  },
  {
    number: "02",
    title: "Review your requirements",
    description:
      "We discuss the relevant information, documents, scope of work, and next steps.",
  },
  {
    number: "03",
    title: "Move forward with clarity",
    description:
      "Follow an agreed process for Zafar Law Chamber-related work and any necessary follow-up.",
  },
];

const benefits = [
  "Clear communication and next steps",
  "Organized handling of relevant documents",
  "Support tailored to your requirements",
  "A straightforward consultation process",
];

function Home() {
  return (
    <div className="home-page">
      {/* Hero */}
      <section className="home-hero">
        <div className="home-container home-hero__grid">
          <div className="home-hero__content">
            <span className="home-eyebrow">
              <ShieldCheck size={17} aria-hidden="true" />
              TAX SUPPORT MADE CLEARER
            </span>

            <h1>
              Make tax matters
              <span> easier to manage.</span>
            </h1>

            <p className="home-hero__description">
              Get clear guidance, organized support, and a straightforward
              process for your personal or business tax needs.
            </p>

            <div className="home-hero__actions">
              <Link to="/contact" className="home-button home-button--primary">
                Talk to Our Team
                <ArrowRight size={18} aria-hidden="true" />
              </Link>

              <Link
                to="/services"
                className="home-button home-button--secondary"
              >
                Explore Services
              </Link>
            </div>

            <div className="home-hero__note">
              <CheckCircle2 size={17} aria-hidden="true" />
              <span>Clear process. Practical support. Informed decisions.</span>
            </div>
          </div>

          <div className="home-hero__visual">
            <div className="home-hero__glow" aria-hidden="true" />

            <div className="home-overview-card">
              <div className="home-overview-card__header">
                <div className="home-icon-box home-icon-box--large">
                  <FileCheck2 size={27} aria-hidden="true" />
                </div>
                <span className="home-status">
                  <span className="home-status__dot" />
                  A clearer way forward
                </span>
              </div>

              <h2>Zafar Law Chamber checklist</h2>
              <p className="home-overview-card__intro">
                A simple starting point for getting organized.
              </p>

              <div className="home-checklist">
                <div className="home-checklist__item">
                  <span className="home-checklist__icon">
                    <CheckCircle2 size={18} aria-hidden="true" />
                  </span>
                  <div>
                    <strong>Gather your documents</strong>
                    <span>Collect relevant records</span>
                  </div>
                </div>

                <div className="home-checklist__item">
                  <span className="home-checklist__icon">
                    <Users size={18} aria-hidden="true" />
                  </span>
                  <div>
                    <strong>Discuss your requirements</strong>
                    <span>Identify the support you need</span>
                  </div>
                </div>

                <div className="home-checklist__item">
                  <span className="home-checklist__icon">
                    <ClipboardCheck size={18} aria-hidden="true" />
                  </span>
                  <div>
                    <strong>Agree on next steps</strong>
                    <span>Know what happens next</span>
                  </div>
                </div>
              </div>

              <div className="home-overview-card__footer">
                <ShieldCheck size={18} aria-hidden="true" />
                <span>Start with a conversation</span>
              </div>
            </div>

            <div className="home-floating-card home-floating-card--top">
              <span className="home-floating-card__icon">
                <MessageCircle size={20} aria-hidden="true" />
              </span>
              <div>
                <strong>Personalized guidance</strong>
                <span>Focused on your needs</span>
              </div>
            </div>

            <div className="home-floating-card home-floating-card--bottom">
              <span className="home-floating-card__icon">
                <Clock3 size={20} aria-hidden="true" />
              </span>
              <div>
                <strong>Stay organized</strong>
                <span>Know your next steps</span>
              </div>
            </div>
          </div>
        </div>

        <div className="home-hero__bottom-line" aria-hidden="true" />
      </section>

      {/* Introductory benefits */}
      <section className="home-benefit-strip">
        <div className="home-container home-benefit-strip__grid">
          <div>
            <ShieldCheck size={23} aria-hidden="true" />
            <span>Guidance with clarity</span>
          </div>
          <div>
            <FileCheck2 size={23} aria-hidden="true" />
            <span>Organized documentation</span>
          </div>
          <div>
            <MessageCircle size={23} aria-hidden="true" />
            <span>Direct communication</span>
          </div>
          <div>
            <Landmark size={23} aria-hidden="true" />
            <span>Personal and business support</span>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="home-section home-services" id="services">
        <div className="home-container">
          <div className="home-section-heading">
            <span className="home-eyebrow">WHAT WE CAN HELP WITH</span>
            <h2>
              Tax support for
              <span> your next step.</span>
            </h2>
            <p>
              Explore our services and find the support that best matches your
              personal or business requirements.
            </p>
          </div>

          <div className="home-services__grid">
            {services.map((service, index) => {
              const Icon = service.icon;

              return (
                <article
                  className="home-service-card"
                  key={service.title}
                  style={{ "--card-index": index }}
                >
                  <div className="home-icon-box">
                    <Icon size={25} aria-hidden="true" />
                  </div>

                  <h3>{service.title}</h3>
                  <p>{service.description}</p>

                  <Link
                    to={service.link}
                    className="home-text-link"
                    aria-label={`Learn more about ${service.title}`}
                  >
                    Learn more
                    <ArrowRight size={17} aria-hidden="true" />
                  </Link>
                </article>
              );
            })}
          </div>

          <div className="home-services__footer">
            <p>Looking for something specific?</p>
            <Link to="/services" className="home-button home-button--outline">
              View All Services
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* Why choose us */}
      <section className="home-section home-why">
        <div className="home-container home-why__grid">
          <div className="home-why__visual">
            <div className="home-why__main-card">
              <div className="home-why__illustration">
                <div className="home-why__illustration-circle">
                  <FileCheck2 size={46} aria-hidden="true" />
                </div>
                <div className="home-why__decor home-why__decor--one" />
                <div className="home-why__decor home-why__decor--two" />
              </div>

              <div className="home-why__card-caption">
                <span>THE Zafar Law Chamber APPROACH</span>
                <h3>Less confusion. More clarity.</h3>
                <p>
                  Understand the process and the information needed at each
                  stage.
                </p>
              </div>
            </div>
          </div>

          <div className="home-why__content">
            <span className="home-eyebrow">WHY Zafar Law Chamber</span>
            <h2>
              A more organized approach to
              <span> tax matters.</span>
            </h2>
            <p className="home-why__description">
              Tax-related tasks can feel complicated when information and next
              steps are unclear. Our approach focuses on communication,
              organization, and helping you understand the process.
            </p>

            <ul className="home-benefit-list">
              {benefits.map((benefit) => (
                <li key={benefit}>
                  <CheckCircle2 size={20} aria-hidden="true" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>

            <Link to="/about" className="home-button home-button--primary">
              Learn About Us
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="home-section home-process">
        <div className="home-container">
          <div className="home-section-heading">
            <span className="home-eyebrow">HOW IT WORKS</span>
            <h2>
              Three steps to
              <span> get started.</span>
            </h2>
            <p>
              A straightforward process helps you understand what information
              is needed and what to expect.
            </p>
          </div>

          <div className="home-process__grid">
            {steps.map((step) => (
              <article className="home-process-card" key={step.number}>
                <span className="home-process-card__number">
                  {step.number}
                </span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="home-cta">
        <div className="home-container home-cta__inner">
          <div className="home-cta__content">
            <span className="home-eyebrow home-eyebrow--light">
              READY TO GET STARTED?
            </span>
            <h2>Let’s make your next step clearer.</h2>
            <p>
              Tell us what you need help with. We’ll take it from there and
              discuss the most appropriate next steps.
            </p>
          </div>

          <Link to="/contact" className="home-button home-button--light">
            Contact Zafar Law Chamber
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Home;
