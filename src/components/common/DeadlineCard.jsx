
import {
  CalendarDays,
  Clock,
  AlertCircle,
  CheckCircle2,
  ArrowUpRight,
} from "lucide-react";

import Badge from "./Badge";
import Button from "./Button";
import "./DeadlineCard.css";

const statusConfig = {
  upcoming: {
    label: "Upcoming",
    variant: "info",
    icon: CalendarDays,
  },
  due_soon: {
    label: "Due Soon",
    variant: "warning",
    icon: Clock,
  },
  overdue: {
    label: "Overdue",
    variant: "danger",
    icon: AlertCircle,
  },
  completed: {
    label: "Completed",
    variant: "success",
    icon: CheckCircle2,
  },
};

function DeadlineCard({
  title,
  description,
  dueDate,
  status = "upcoming",
  category,
  clientName,
  onView,
  onComplete,
  showClient = false,
  className = "",
}) {
  const config = statusConfig[status] || statusConfig.upcoming;
  const StatusIcon = config.icon;

  const formattedDate = dueDate
    ? new Date(`${dueDate}T12:00:00`).toLocaleDateString(
        "en-PK",
        {
          day: "numeric",
          month: "short",
          year: "numeric",
        }
      )
    : "Date not set";

  return (
    <article
      className={`deadline-card deadline-card--${status} ${className}`.trim()}
    >
      <div className="deadline-card__main">
        <div className="deadline-card__icon" aria-hidden="true">
          <StatusIcon size={22} strokeWidth={1.8} />
        </div>

        <div className="deadline-card__content">
          <div className="deadline-card__heading">
            <h3 className="deadline-card__title">{title}</h3>

            <Badge variant={config.variant} size="small">
              {config.label}
            </Badge>
          </div>

          {description && (
            <p className="deadline-card__description">
              {description}
            </p>
          )}

          <div className="deadline-card__meta">
            <span className="deadline-card__date">
              <CalendarDays size={15} aria-hidden="true" />
              <span>{formattedDate}</span>
            </span>

            {category && (
              <span className="deadline-card__category">
                {category}
              </span>
            )}
          </div>

          {showClient && clientName && (
            <p className="deadline-card__client">
              Client: <strong>{clientName}</strong>
            </p>
          )}
        </div>
      </div>

      {(onView || (onComplete && status !== "completed")) && (
        <div className="deadline-card__actions">
          {onView && (
            <Button
              type="button"
              variant="outline"
              size="small"
              icon={ArrowUpRight}
              iconPosition="right"
              onClick={onView}
            >
              View Details
            </Button>
          )}

          {onComplete && status !== "completed" && (
            <Button
              type="button"
              variant="primary"
              size="small"
              onClick={onComplete}
            >
              Mark Complete
            </Button>
          )}
        </div>
      )}
    </article>
  );
}

export default DeadlineCard;
