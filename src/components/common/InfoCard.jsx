import "./InfoCard.css";

function InfoCard({
  icon: Icon,
  title,
  description,
  value,
  label,
  variant = "default",
  align = "left",
  className = "",
}) {
  const cardClasses = [
    "info-card",
    `info-card--${variant}`,
    `info-card--${align}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <article className={cardClasses}>
      {Icon && (
        <div className="info-card__icon">
          <Icon size={25} strokeWidth={1.8} aria-hidden="true" />
        </div>
      )}

      {value && (
        <div className="info-card__value">
          {value}
        </div>
      )}

      {title && (
        <h3 className="info-card__title">
          {title}
        </h3>
      )}

      {description && (
        <p className="info-card__description">
          {description}
        </p>
      )}

      {label && (
        <span className="info-card__label">
          {label}
        </span>
      )}
    </article>
  );
}

export default InfoCard;