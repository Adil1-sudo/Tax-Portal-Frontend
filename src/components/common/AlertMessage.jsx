import {
  CheckCircle2,
  CircleAlert,
  Info,
  TriangleAlert,
  X,
} from "lucide-react";

import "./AlertMessage.css";

const alertConfig = {
  success: {
    icon: CheckCircle2,
    role: "status",
  },
  error: {
    icon: CircleAlert,
    role: "alert",
  },
  warning: {
    icon: TriangleAlert,
    role: "status",
  },
  info: {
    icon: Info,
    role: "status",
  },
};

function AlertMessage({
  type = "info",
  title,
  children,
  onClose,
  className = "",
}) {
  const config = alertConfig[type] || alertConfig.info;
  const Icon = config.icon;

  const alertClasses = [
    "alert-message",
    `alert-message--${alertConfig[type] ? type : "info"}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={alertClasses}
      role={config.role}
      aria-atomic="true"
    >
      <Icon
        className="alert-message__icon"
        size={21}
        strokeWidth={2}
        aria-hidden="true"
      />

      <div className="alert-message__content">
        {title && (
          <h3 className="alert-message__title">
            {title}
          </h3>
        )}

        {children && (
          <div className="alert-message__description">
            {children}
          </div>
        )}
      </div>

      {onClose && (
        <button
          type="button"
          className="alert-message__close"
          onClick={onClose}
          aria-label="Dismiss notification"
        >
          <X size={18} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

export default AlertMessage;