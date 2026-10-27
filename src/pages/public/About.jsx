import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  FileCheck2,
  HeartHandshake,
  Lightbulb,
  LockKeyhole,
  MessagesSquare,
  ShieldCheck,
  Target,
  Users,
} from "lucide-react";
import usePublicWebsitePage from "../../hooks/usePublicWebsitePage";
import "./About.css";

const values = [
  {
    icon: ShieldCheck,
    title: "Accuracy-minded",
    description:
      "We emphasize organized information, careful review, and clear communication throughout the process.",
  },
  {
    icon: MessagesSquare,
    title: "Clear communication",
    description:
      "Tax-related questions can feel complicated. Our goal is to explain the next steps in straightforward language.",
  },
  {
    icon: LockKeyhole,
    title: "Respect for privacy",
    description:
      "Personal and business financial documents deserve careful handling and appropriate access controls.",
  },
  {
    icon: HeartHandshake,
    title: "Client-focused support",
    description:
      "Every client has different circumstances, so support should begin with understanding their needs.",
  },
];

const processSteps = [
  {
    number: "01",
    icon: ClipboardCheck,
    title: "Understand your needs",
    description:
      "We discuss your situation, identify the support you need, and clarify the information required to get started.",
  },
  {
    number: "02",
    icon: FileCheck2,
    title: "Organize and review",
    description:
      "Relevant documents and details are organized for review, with missing information identified where necessary.",
  },
  {
    number: "03",
    icon: CheckCircle2,
    title: "Discuss next steps",
    description:
      "We communicate the progress, explain outstanding requirements, and clarify the next agreed actions.",
  },
];

function About() {
  const { page, status, error } = usePublicWebsitePage("about");

if (status === "loading") {
  return (
    <main className="about-page" aria-live="polite">
      <div className="container">
        <p>Loading About page...</p>
      </div>
    </main>
  );
}

if (status === "error") {
  return (
    <main className="about-page">
      <div className="container" role="status">
        <h1>About page unavailable</h1>
        <p>{error}</p>
      </div>
    </main>
  );
}

const pageContent = page.content || {};
const displayValues = Array.isArray(pageContent.values)
  ? pageContent.values
  : [];
  return (
    <main className="about-page">
      {/* Hero */}
      <section className="about-hero">
        <div className="about-hero__orb about-hero__orb--one" />
        <div className="about-hero__orb about-hero__orb--two" />

        <div className="container about-hero__inner">
          <div className="about-hero__content">
            <span className="about-eyebrow">
              <span className="about-eyebrow__dot" />
              GET TO KNOW US
            </span>

            <h1>{page.title}</h1>

            <p className="about-hero__description">{page.description}</p>

            <div className="about-hero__actions">
              <Link to="/contact" className="about-button about-button--primary">
                Talk to Our Team
                <ArrowRight size={18} aria-hidden="true" />
              </Link>

              <Link
                to="/services"
                className="about-button about-button--secondary"
              >
                Explore Services
              </Link>
            </div>

            <div className="about-hero__note">
              <CheckCircle2 size={18} aria-hidden="true" />
              <span>Clear steps. Organized information. Practical support.</span>
            </div>
          </div>

          <div className="about-hero__visual" aria-hidden="true">
            <div className="about-visual-card">
              <div className="about-visual-card__top">
                <div className="about-visual-card__icon">
                  <ShieldCheck size={25} />
                </div>
                <span className="about-visual-card__status">
                  Client-focused approach
                </span>
              </div>

              <div className="about-visual-card__heading">
                A clearer way forward
              </div>

              <div className="about-visual-card__line about-visual-card__line--long" />
              <div className="about-visual-card__line about-visual-card__line--medium" />

              <div className="about-visual-card__checklist">
                <div>
                  <CheckCircle2 size={18} />
                  <span>Understand requirements</span>
                </div>
                <div>
                  <CheckCircle2 size={18} />
                  <span>Organize documentation</span>
                </div>
                <div>
                  <CheckCircle2 size={18} />
                  <span>Agree on next steps</span>
                </div>
              </div>

              <div className="about-visual-card__footer">
                <span>Zafar Law Chamber</span>
                <span>Support with clarity</span>
              </div>
            </div>

            <div className="about-floating-note about-floating-note--top">
              <div className="about-floating-note__icon">
                <Target size={19} />
              </div>
              <div>
                <strong>Purposeful support</strong>
                <span>Focused on your needs</span>
              </div>
            </div>

            <div className="about-floating-note about-floating-note--bottom">
              <div className="about-floating-note__icon about-floating-note__icon--teal">
                <FileCheck2 size={19} />
              </div>
              <div>
                <strong>Better organization</strong>
                <span>One step at a time</span>
              </div>
            </div>
          </div>
        </div>

        <div className="about-hero__bottom-line" />
      </section>

      {/* Purpose */}
      <section className="about-purpose section">
        <div className="container about-purpose__grid">
          <div className="about-purpose__visual">
            <div className="about-purpose__icon-wrap">
              <Lightbulb size={36} aria-hidden="true" />
            </div>

            <div className="about-purpose__quote">
              <span className="about-purpose__quote-mark">&ldquo;</span>
              <p>
                A clearer process starts with understanding what matters to
                each client.
              </p>
              <span className="about-purpose__quote-line" />
              <span className="about-purpose__quote-label">OUR APPROACH</span>
            </div>

            <div className="about-purpose__decor about-purpose__decor--one" />
            <div className="about-purpose__decor about-purpose__decor--two" />
          </div>

          <div className="about-purpose__content">
            <span className="about-eyebrow">WHY Zafar Law Chamber</span>

            <h2>
              Tax-related tasks deserve
              <span> a clearer process.</span>
            </h2>

            <p>{pageContent.mission || "Our approach begins with understanding each client's requirements and organizing the information needed to move forward."}</p>

            <p>
              Zafar Law Chamber is designed around a straightforward idea: understand
              the client&apos;s requirements, keep relevant information
              organized, and communicate what needs to happen next.
            </p>

            <div className="about-purpose__points">
              <div>
                <CheckCircle2 size={20} aria-hidden="true" />
                <span>Understand requirements before taking action</span>
              </div>
              <div>
                <CheckCircle2 size={20} aria-hidden="true" />
                <span>Keep documents and information structured</span>
              </div>
              <div>
                <CheckCircle2 size={20} aria-hidden="true" />
                <span>Make responsibilities and next steps clearer</span>
              </div>
            </div>

            <Link to="/services" className="about-text-link">
              See how we can help
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="about-values section">
        <div className="container">
          <div className="about-section-heading">
            <span className="about-eyebrow">WHAT GUIDES US</span>
            <h2>
              Principles behind <span>our approach</span>
            </h2>
            <p>
              The experience should feel structured, respectful, and easy to
              understand at every stage.
            </p>
          </div>

          <div className="about-values__grid">
           {displayValues.map((value, index) => {
              const Icon = values[index % values.length].icon;
                      
              return (
                <article
                  className="about-value-card"
                  key={value.id ?? `${value.title}-${index}`}
                  style={{ "--about-card-index": index }}
                >
                  <div className="about-value-card__icon">
                    <Icon size={25} aria-hidden="true" />
                  </div>
              
                  <h3>{value.title}</h3>
                  <p>{value.description}</p>
              
                  <span className="about-value-card__number">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Working process */}
      <section className="about-process section">
        <div className="container">
          <div className="about-section-heading">
            <span className="about-eyebrow">HOW WE WORK</span>
            <h2>
              A straightforward process,
              <span> step by step.</span>
            </h2>
            <p>
              A simple framework for understanding requirements and keeping
              work moving in the right direction.
            </p>
          </div>

          <div className="about-process__grid">
            {processSteps.map((step) => {
              const Icon = step.icon;

              return (
                <article className="about-process-card" key={step.number}>
                  <div className="about-process-card__top">
                    <span className="about-process-card__number">
                      {step.number}
                    </span>
                    <div className="about-process-card__icon">
                      <Icon size={24} aria-hidden="true" />
                    </div>
                  </div>

                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Client relationship */}
      <section className="about-relationship section">
        <div className="container about-relationship__inner">
          <div className="about-relationship__icon">
            <Users size={29} aria-hidden="true" />
          </div>

          <div className="about-relationship__content">
            <span className="about-eyebrow">BUILT AROUND YOUR NEEDS</span>
            <h2>
              Start with a conversation,
              <span> not a complicated process.</span>
            </h2>
            <p>
              Tell us what you need help with. We can discuss your requirements
              and clarify the appropriate next steps before proceeding.
            </p>
          </div>

          <Link
            to="/contact"
            className="about-button about-button--primary about-relationship__button"
          >
            Contact Zafar Law Chamber
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
  );
}

export default About;
