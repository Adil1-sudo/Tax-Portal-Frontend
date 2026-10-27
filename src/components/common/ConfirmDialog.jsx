
import { AlertTriangle } from "lucide-react";
import Modal from "./Modal";
import Button from "./Button";
import "./ConfirmDialog.css";

function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  loading = false,
  icon: CustomIcon = AlertTriangle,
}) {
  const isDanger = variant === "danger";

  const handleConfirm = () => {
    if (loading) return;
    onConfirm?.();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={message}
      size="small"
      closeOnBackdrop={!loading}
      showCloseButton={!loading}
      className="confirm-dialog-modal"
    >
      <div className="confirm-dialog">
        <div
          className={`confirm-dialog__icon ${
            isDanger
              ? "confirm-dialog__icon--danger"
              : "confirm-dialog__icon--primary"
          }`}
          aria-hidden="true"
        >
          <CustomIcon size={25} strokeWidth={1.8} />
        </div>

        <p className="confirm-dialog__message">{message}</p>

        <div className="confirm-dialog__actions">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="confirm-dialog__cancel"
          >
            {cancelText}
          </Button>

          <Button
            type="button"
            variant={isDanger ? "danger" : "primary"}
            onClick={handleConfirm}
            loading={loading}
            disabled={loading}
            className="confirm-dialog__confirm"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default ConfirmDialog;
