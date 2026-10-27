import { ArrowUpRight } from "lucide-react";
import "./ServiceCard.css";

function ServiceCard({
  icon: Icon,
  title,
  description,
  link = "/services",
  linkText = "Learn More",
  className = "",
}) {
  return (
    <article className={`service-card ${className}`.trim()}>
      <div className="service-card__top">
        <div className="service-card__icon">
          {Icon && <Icon size={27} strokeWidth={1.8} />}
        </div>

        <span className="service-card__number" aria-hidden="true">
          <ArrowUpRight size={20} />
        </span>
      </div>

      <div className="service-card__content">
        <h3 className="service-card__title">{title}</h3>

        <p className="service-card__description">
          {description}
        </p>
      </div>

      <a href={link} className="service-card__link">
        <span>{linkText}</span>
        <ArrowUpRight size={17} />
      </a>
    </article>
  );
}

export default ServiceCard;