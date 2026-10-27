
import { ChevronDown } from "lucide-react";
import "./SelectField.css";

function SelectField({
  id,
  name,
  label,
  value,
  onChange,
  onBlur,
  options = [],
  placeholder = "Select an option",
  error,
  helperText,
  required = false,
  disabled = false,
  className = "",
  ...rest
}) {
  const fieldId = id || name;
  const errorId = `${fieldId}-error`;
  const helperId = `${fieldId}-helper`;

  const describedBy = [
    error ? errorId : null,
    helperText ? helperId : null,
  ]
    .filter(Boolean)
    .join(" ") || undefined;

  return (
    <div className={`select-field ${className}`.trim()}>
      {label && (
        <label className="select-field__label" htmlFor={fieldId}>
          {label}
          {required && (
            <span className="select-field__required" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      <div
        className={`select-field__control ${
          error ? "select-field__control--error" : ""
        } ${disabled ? "select-field__control--disabled" : ""}`}
      >
        <select
          id={fieldId}
          name={name}
          value={value ?? ""}
          onChange={onChange}
          onBlur={onBlur}
          required={required}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className="select-field__select"
          {...rest}
        >
          <option value="" disabled>
            {placeholder}
          </option>

          {options.map((option) => {
            const item =
              typeof option === "string"
                ? { label: option, value: option }
                : option;

            return (
              <option
                key={item.value}
                value={item.value}
                disabled={item.disabled ?? false}
              >
                {item.label}
              </option>
            );
          })}
        </select>

        <ChevronDown
          className="select-field__icon"
          size={18}
          aria-hidden="true"
        />
      </div>

      {error && (
        <p
          className="select-field__message select-field__message--error"
          id={errorId}
          role="alert"
        >
          {error}
        </p>
      )}

      {!error && helperText && (
        <p
          className="select-field__message select-field__message--helper"
          id={helperId}
        >
          {helperText}
        </p>
      )}
    </div>
  );
}

export default SelectField;
