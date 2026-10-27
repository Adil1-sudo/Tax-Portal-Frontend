import { useState } from "react";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import "./FormInput.css";

function FormInput({
  id,
  name,
  label,
  type = "text",
  placeholder = "",
  value,
  onChange,
  onBlur,
  error = "",
  helperText = "",
  required = false,
  disabled = false,
  autoComplete,
  className = "",
  ...rest
}) {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";
  const inputType =
    isPassword && showPassword ? "text" : type;

  const inputId = id || name;
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;

  const inputClasses = [
    "form-input__control",
    error ? "form-input__control--error" : "",
    isPassword ? "form-input__control--password" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const describedBy = [
    error ? errorId : "",
    helperText && !error ? helperId : "",
  ]
    .filter(Boolean)
    .join(" ") || undefined;

  return (
    <div className={`form-input ${className}`.trim()}>
      {label && (
        <label
          className="form-input__label"
          htmlFor={inputId}
        >
          {label}

          {required && (
            <span
              className="form-input__required"
              aria-hidden="true"
            >
              *
            </span>
          )}
        </label>
      )}

      <div className="form-input__wrapper">
        <input
          id={inputId}
          name={name}
          type={inputType}
          className={inputClasses}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          required={required}
          disabled={disabled}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          {...rest}
        />

        {isPassword && (
          <button
            type="button"
            className="form-input__toggle"
            onClick={() =>
              setShowPassword((previous) => !previous)
            }
            aria-label={
              showPassword ? "Hide password" : "Show password"
            }
            aria-pressed={showPassword}
            disabled={disabled}
          >
            {showPassword ? (
              <EyeOff size={19} aria-hidden="true" />
            ) : (
              <Eye size={19} aria-hidden="true" />
            )}
          </button>
        )}
      </div>

      {error && (
        <p
          className="form-input__message form-input__message--error"
          id={errorId}
          role="alert"
        >
          <AlertCircle size={15} aria-hidden="true" />
          <span>{error}</span>
        </p>
      )}

      {!error && helperText && (
        <p
          className="form-input__message form-input__message--helper"
          id={helperId}
        >
          {helperText}
        </p>
      )}
    </div>
  );
}

export default FormInput;