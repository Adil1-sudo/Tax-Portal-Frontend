import { LoaderCircle } from "lucide-react";
import "./LoadingSpinner.css";

function LoadingSpinner({
  size = "medium",
  label = "Loading...",
  fullScreen = false,
  className = "",
}) {
  const spinnerClasses = [
    "loading-spinner",
    `loading-spinner--${size}`,
    fullScreen ? "loading-spinner--fullscreen" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={spinnerClasses}
      role="status"
      aria-live="polite"
    >
      <LoaderCircle
        className="loading-spinner__icon"
        aria-hidden="true"
      />

      {label && (
        <span className="loading-spinner__label">
          {label}
        </span>
      )}
    </div>
  );
}

export default LoadingSpinner;