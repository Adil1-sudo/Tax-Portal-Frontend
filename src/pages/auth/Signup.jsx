import { useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../../services/api";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  ShieldCheck,
  UserPlus,
} from "lucide-react";

import "./Login.css";
import "./Signup.css";

function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [status, setStatus] = useState("idle");
  const [formStatus, setFormStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    consent: false,
  });

  const handleChange = (event) => {
    const { name, value, checked, type } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (status !== "idle") {
      setStatus("idle");
    }
  };


  const handleSubmit = async (event) => {
    event.preventDefault();

    const form = event.currentTarget;

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    setFormStatus("submitting");

    try {
      await apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          fullName: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
        }),
      });

      setFormStatus("success");  
    } catch (error) {
      setFormStatus("error");
      setErrorMessage(error.message);
    }
  };


  return (
    <main className="auth-page signup-page">
      <section className="auth-shell">
        <div className="auth-intro">
          <div className="auth-intro__orb auth-intro__orb--one" />
          <div className="auth-intro__orb auth-intro__orb--two" />

          <div className="auth-intro__content">
            <Link to="/" className="auth-brand" aria-label="Zafar Law Chamber home">
              <span className="auth-brand__icon">
                <ShieldCheck size={25} aria-hidden="true" />
              </span>
              <span>
                Your <strong>Tax</strong>
              </span>
            </Link>
            <span className="auth-eyebrow">GET STARTED</span>

            <h1>
              A clearer way
              <span> to get organized.</span>
            </h1>

            <p>
              Start by creating your account. Once the backend is connected,
              the account can become your entry point to the appropriate
              Zafar Law Chamber services.
            </p>

            <div className="auth-intro__benefits">
              <div>
                <span className="auth-intro__check">
                  <CheckCircle2 size={18} aria-hidden="true" />
                </span>
                <div>
                  <strong>A straightforward start</strong>
                  <span>Begin with your basic account details</span>
                </div>
              </div>

              <div>
                <span className="auth-intro__check">
                  <ShieldCheck size={18} aria-hidden="true" />
                </span>
                <div>
                  <strong>Security comes first</strong>
                  <span>Real account protection requires backend controls</span>
                </div>
              </div>
            </div>
          </div>

          <div className="auth-intro__footer">
            <span>Zafar Law Chamber</span>
            <span>Clear processes. Practical support.</span>
          </div>
        </div>

        <div className="auth-form-area signup-form-area">
          <div className="auth-form-card signup-form-card">
            <div className="auth-form-card__heading">
              <span className="auth-form-card__icon">
                <UserPlus size={23} aria-hidden="true" />
              </span>
              <h2>Create your account</h2>
              <p>Enter your details to get started.</p>
            </div>

            {status === "mismatch" && (
              <div
                className="signup-notice signup-notice--error"
                role="alert"
              >
                <ShieldCheck size={20} aria-hidden="true" />
                <div>
                  <strong>Passwords do not match</strong>
                  <p>
                    Make sure both password fields contain the same password.
                  </p>
                </div>
              </div>
            )}

            {status === "demo" && (
              <div
                className="auth-notice"
                role="status"
                aria-live="polite"
              >
                <CheckCircle2 size={20} aria-hidden="true" />
                <div>
                  <strong>Form validation successful</strong>
                  <p>
                    This is a frontend demo. No account has been created and
                    your details have not been saved. Account creation will
                    work after the backend is connected.
                  </p>
                </div>
              </div>
            )}

            <form className="auth-form signup-form" method="post" onSubmit={handleSubmit}>
              <div className="auth-field">
                <label htmlFor="signup-name">Full name</label>
                <input
                  id="signup-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  minLength={2}
                  maxLength={100}
                  required
                />
              </div>

              <div className="auth-field">
                <label htmlFor="signup-email">Email address</label>
                <input
                  id="signup-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  maxLength={254}
                  required
                />
              </div>

              <div className="auth-field">
                <label htmlFor="signup-password">Password</label>

                <div className="auth-password-wrap">
                  <input
                    id="signup-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleChange}
                    minLength={8}
                    maxLength={128}
                    required
                  />

                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={() => setShowPassword((current) => !current)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    aria-pressed={showPassword}
                  >
                    {showPassword ? (
                      <EyeOff size={19} aria-hidden="true" />
                    ) : (
                      <Eye size={19} aria-hidden="true" />
                    )}
                  </button>
                </div>

                <span className="signup-field-hint">
                  Use at least 8 characters.
                </span>
              </div>

              <div className="auth-field">
                <label htmlFor="signup-confirm-password">
                  Confirm password
                </label>

                <div className="auth-password-wrap">
                  <input
                    id="signup-confirm-password"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Enter your password again"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    minLength={8}
                    maxLength={128}
                    required
                  />

                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={() =>
                      setShowConfirmPassword((current) => !current)
                    }
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirmation password"
                        : "Show confirmation password"
                    }
                    aria-pressed={showConfirmPassword}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={19} aria-hidden="true" />
                    ) : (
                      <Eye size={19} aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>

              <label className="auth-checkbox signup-consent">
                <input
                  type="checkbox"
                  name="consent"
                  checked={formData.consent}
                  onChange={handleChange}
                  required
                />
                <span>
                  I agree to the applicable Terms of Service and Privacy
                  Policy.
                </span>
              </label>

              {formStatus === "submitting" && (
                <p style={{color: "#15803D"}} role="status" aria-live="polite">
                  Submitting your enquiry...
                </p>
              )}
              
              {formStatus === "success" && (
                <p style={{color: "#15803D"}} role="status" aria-live="polite">
                  Your enquiry has been submitted successfully.
                </p>
              )}
              
              {formStatus === "error" && (
                <p style={{color: "#DC2626"}} role="alert">
                  We could not submit your enquiry. Please check your connection
                  and try again.
                </p>
              )}
              <button type="submit" className="auth-submit">
                Create Account
                <ArrowRight size={18} aria-hidden="true" />
              </button>
            </form>

            <div className="auth-form-card__divider">
              <span>ALREADY REGISTERED?</span>
            </div>

            <p className="auth-switch">
              Already have an account?{" "}
              <Link to="/login">Sign in</Link>
            </p>

            <p className="auth-form-card__back">
              <Link to="/">
                <ArrowRight size={15} aria-hidden="true" />
                Back to home
              </Link>
            </p>
          </div>

          <p className="auth-form-area__note">
            This signup screen is a frontend prototype. No account is created
            until a real registration service is implemented.
          </p>
        </div>
      </section>
    </main>
  );
}

export default Signup;
