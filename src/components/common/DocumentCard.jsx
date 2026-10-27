
import {
  FileText,
  FileSpreadsheet,
  FileImage,
  File,
  Download,
  Eye,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import Badge from "./Badge";
import Button from "./Button";
import "./DocumentCard.css";

const statusConfig = {
  pending: {
    label: "Pending Review",
    variant: "warning",
    icon: Clock,
  },
  approved: {
    label: "Approved",
    variant: "success",
    icon: CheckCircle2,
  },
  rejected: {
    label: "Rejected",
    variant: "danger",
    icon: AlertCircle,
  },
};

function getFileIcon(fileType = "") {
  const type = fileType.toLowerCase();

  if (
    type.includes("pdf") ||
    type.endsWith(".pdf")
  ) {
    return FileText;
  }

  if (
    type.includes("spreadsheet") ||
    type.includes("excel") ||
    /\.(xls|xlsx|csv)$/.test(type)
  ) {
    return FileSpreadsheet;
  }

  if (
    type.includes("image") ||
    /\.(png|jpe?g|webp)$/.test(type)
  ) {
    return FileImage;
  }

  return File;
}

function DocumentCard({
  title,
  fileName,
  fileType = "",
  fileSize,
  uploadedAt,
  status = "pending",
  category,
  clientName,
  onView,
  onDownload,
  onApprove,
  onReject,
  showClient = false,
  className = "",
}) {
  const config = statusConfig[status] || statusConfig.pending;
  const StatusIcon = config.icon;
  const FileIcon = getFileIcon(fileType || fileName || "");

  const formattedDate = uploadedAt
    ? new Date(uploadedAt).toLocaleDateString("en-PK", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  const hasActions = Boolean(
    onView || onDownload || onApprove || onReject
  );

  return (
    <article
      className={`document-card document-card--${status} ${className}`.trim()}
    >
      <div className="document-card__main">
        <div className="document-card__file-icon" aria-hidden="true">
          <FileIcon size={25} strokeWidth={1.8} />
        </div>

        <div className="document-card__content">
          <div className="document-card__heading">
            <h3 className="document-card__title">
              {title || fileName || "Untitled document"}
            </h3>

            <Badge variant={config.variant} size="small">
              {config.label}
            </Badge>
          </div>

          {fileName && title && fileName !== title && (
            <p className="document-card__filename">
              {fileName}
            </p>
          )}

          <div className="document-card__metadata">
            {category && (
              <span className="document-card__category">
                {category}
              </span>
            )}

            {fileSize && (
              <span className="document-card__meta-item">
                {fileSize}
              </span>
            )}

            {formattedDate && (
              <span className="document-card__meta-item">
                Uploaded {formattedDate}
              </span>
            )}
          </div>

          {showClient && clientName && (
            <p className="document-card__client">
              Client: <strong>{clientName}</strong>
            </p>
          )}

          <div className="document-card__status">
            <StatusIcon size={15} aria-hidden="true" />
            <span>{config.label}</span>
          </div>
        </div>
      </div>

      {hasActions && (
        <div className="document-card__actions">
          {onView && (
            <Button
              type="button"
              variant="outline"
              size="small"
              icon={Eye}
              onClick={onView}
            >
              View
            </Button>
          )}

          {onDownload && (
            <Button
              type="button"
              variant="secondary"
              size="small"
              icon={Download}
              onClick={onDownload}
            >
              Download
            </Button>
          )}

          {onApprove && status !== "approved" && (
            <Button
              type="button"
              variant="primary"
              size="small"
              onClick={onApprove}
            >
              Approve
            </Button>
          )}

          {onReject && status !== "rejected" && (
            <Button
              type="button"
              variant="danger"
              size="small"
              onClick={onReject}
            >
              Reject
            </Button>
          )}
        </div>
      )}
    </article>
  );
}

export default DocumentCard;
