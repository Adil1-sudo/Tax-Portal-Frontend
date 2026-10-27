import "./SectionHeading.css";

function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  size = "medium",
  className = "",
}) {
  const headingClasses = [
    "section-heading",
    `section-heading--${align}`,
    `section-heading--${size}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={headingClasses}>
      {eyebrow && (
        <span className="section-heading__eyebrow">
          <span className="section-heading__eyebrow-dot" />
          {eyebrow}
        </span>
      )}

      <h2 className="section-heading__title">
        {title}
      </h2>

      {description && (
        <p className="section-heading__description">
          {description}
        </p>
      )}
    </div>
  );
}

export default SectionHeading;