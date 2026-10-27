import "./FormTextarea.css";

function FormTextarea({
  id,
  name,
  label,
  placeholder = "",
  value,
  onChange,
  onBlur,
  error = "",
  helperText = "",
  required = false,
  disabled = false,
  rows = 5,
  maxLength,
  showCharacterCount = false,
  className = "",
  ...rest
}) {
  const textareaId = id || name;
  const errorId = `${textareaId}-error`;
  const helperId = `${textareaId}-helper`;

  const currentLength = value == null ? 0 : String(value).length;

  const describedBy = [
    error ? errorId : "",
    helperText && !error ? helperId : "",
  ]
    .filter(Boolean)
    .join(" ") || undefined;

  const textareaClasses = [
    "form-textarea__control",
    error ? "form-textarea__control--error" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={`form-textarea ${className}`.trim()}>
      {label && (
        <label
          className="form-textarea__label"
          htmlFor={textareaId}
        >
          {label}

          {required && (
            <span
              className="form-textarea__required"
              aria-hidden="true"
            >
              *
            </span>
          )}
        </label>
      )}

      <textarea
        id={textareaId}
        name={name}
        className={textareaClasses}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        rows={rows}
        maxLength={maxLength}
        required={required}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        {...rest}
      />

      <div className="form-textarea__footer">
        <div className="form-textarea__feedback">
          {error && (
            <p
              className="form-textarea__message form-textarea__message--error"
              id={errorId}
              role="alert"
            >
              {error}
            </p>
          )}

          {!error && helperText && (
            <p
              className="form-textarea__message form-textarea__message--helper"
              id={helperId}
            >
              {helperText}
            </p>
          )}
        </div>

        {showCharacterCount && maxLength && (
          <span
            className="form-textarea__count"
            aria-live="polite"
          >
            {currentLength}/{maxLength}
          </span>
        )}
      </div>
    </div>
  );
}

export default FormTextarea;