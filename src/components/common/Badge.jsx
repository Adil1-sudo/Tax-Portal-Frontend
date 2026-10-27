import {
  CheckCircle2,
  Clock3,
  CircleAlert,
  XCircle,
  Info,
} from "lucide-react";

import "./Badge.css";

const badgeConfig = {
  success: {
    icon: CheckCircle2,
  },
  warning: {
    icon: Clock3,
  },
  danger: {
    icon: CircleAlert,
  },
  neutral: {
    icon: Info,
  },
  info: {
    icon: Info,
  },
  outline: {
    icon: null,
  },
};

function Badge({
  children,
  variant = "neutral",
  size = "medium",
  icon: CustomIcon,
  showIcon = false,
  dot = false,
  className = "",
}) {
  const config = badgeConfig[variant] || badgeConfig.neutral;
  const Icon = CustomIcon || config.icon;

  const badgeClasses = [
    "badge",
    `badge--${badgeConfig[variant] ? variant : "neutral"}`,
    `badge--${size === "small" || size === "large" ? size : "medium"}`,
    dot ? "badge--with-dot" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={badgeClasses}>
      {dot && (
        <span
          className="badge__dot"
          aria-hidden="true"
        />
      )}

      {showIcon && Icon && (
        <Icon
          className="badge__icon"
          size={14}
          strokeWidth={2}
          aria-hidden="true"
        />
      )}

      <span className="badge__text">{children}</span>
    </span>
  );
}

export default Badge;