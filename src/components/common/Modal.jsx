import { useEffect, useId } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import "./Modal.css";

function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = "medium",
  closeOnBackdrop = true,
  showCloseButton = true,
  className = "",
}) {
  const generatedId = useId();
  const titleId = `${generatedId}-title`;
  const descriptionId = `${generatedId}-description`;

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose?.();
      }
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const modalClasses = [
    "modal",
    `modal--${size}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return createPortal(
    <div
      className="modal__backdrop"
      onMouseDown={(event) => {
        if (
          closeOnBackdrop &&
          event.target === event.currentTarget
        ) {
          onClose?.();
        }
      }}
    >
      <section
        className={modalClasses}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descriptionId : undefined}
      >
        <header className="modal__header">
          <div className="modal__heading">
            {title && (
              <h2 className="modal__title" id={titleId}>
                {title}
              </h2>
            )}

            {description && (
              <p
                className="modal__description"
                id={descriptionId}
              >
                {description}
              </p>
            )}
          </div>

          {showCloseButton && (
            <button
              type="button"
              className="modal__close"
              onClick={onClose}
              aria-label="Close dialog"
            >
              <X size={20} aria-hidden="true" />
            </button>
          )}
        </header>

        <div className="modal__body">
          {children}
        </div>
      </section>
    </div>,
    document.body
  );
}

export default Modal;