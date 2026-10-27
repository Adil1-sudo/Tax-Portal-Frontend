
import {
  Users,
  FileClock,
  Wallet,
  CalendarDays,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
} from "lucide-react";

import "./StatCard.css";

const iconMap = {
  users: Users,
  documents: FileClock,
  revenue: Wallet,
  calendar: CalendarDays,
};

function StatCard({
  title,
  value,
  icon: CustomIcon,
  iconName,
  description,
  trend,
  trendLabel,
  variant = "primary",
  className = "",
}) {
  const Icon =
    CustomIcon ||
    iconMap[iconName] ||
    FileClock;

  const hasTrend =
    trend !== undefined && trend !== null && trend !== "";

  const trendValue = hasTrend ? Number(trend) : null;
  const isPositive = trendValue >= 0;

  const formattedTrend = hasTrend
    ? `${isPositive ? "+" : ""}${trendValue}%`
    : "";

  return (
    <article
      className={`stat-card stat-card--${variant} ${className}`.trim()}
    >
      <div className="stat-card__top">
        <div className="stat-card__heading">
          <h3 className="stat-card__title">{title}</h3>

          <p className="stat-card__value">
            {value ?? "—"}
          </p>
        </div>

        <div className="stat-card__icon">
          <Icon size={23} strokeWidth={1.8} aria-hidden="true" />
        </div>
      </div>

      {(description || hasTrend || trendLabel) && (
        <div className="stat-card__footer">
          {hasTrend && (
            <span
              className={`stat-card__trend ${
                isPositive
                  ? "stat-card__trend--positive"
                  : "stat-card__trend--negative"
              }`}
            >
              {isPositive ? (
                <TrendingUp size={15} aria-hidden="true" />
              ) : (
                <TrendingDown size={15} aria-hidden="true" />
              )}

              <span>{formattedTrend}</span>
            </span>
          )}

          {trendLabel && (
            <span className="stat-card__trend-label">
              {trendLabel}
            </span>
          )}

          {description && (
            <p className="stat-card__description">
              {description}
            </p>
          )}
        </div>
      )}

      <ArrowUpRight
        className="stat-card__decoration"
        size={18}
        aria-hidden="true"
      />
    </article>
  );
}

export default StatCard;
