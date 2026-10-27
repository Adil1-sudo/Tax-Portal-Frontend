import { LoaderCircle } from "lucide-react";
import "./Button.css";

function Button({
  children,
  variant = "primary",
  size = "medium",
  type = "button",
  icon: Icon,
  iconPosition = "right",
  loading = false,
  disabled = false,
  fullWidth = false,
  className = "",
  onClick,
  ...props
}) {
  const buttonClasses = [
    "app-button",
    `app-button--${variant}`,
    `app-button--${size}`,
    fullWidth ? "app-button--full-width" : "",
    loading ? "app-button--loading" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {loading ? (
        <LoaderCircle
          className="app-button__spinner"
          size={18}
          aria-hidden="true"
        />
      ) : (
        iconPosition === "left" &&
        Icon && (
          <Icon
            className="app-button__icon"
            size={18}
            aria-hidden="true"
          />
        )
      )}

      <span className="app-button__label">
        {loading ? "Please wait..." : children}
      </span>

      {!loading && iconPosition === "right" && Icon && (
        <Icon
          className="app-button__icon"
          size={18}
          aria-hidden="true"
        />
      )}
    </button>
  );
}

export default Button;