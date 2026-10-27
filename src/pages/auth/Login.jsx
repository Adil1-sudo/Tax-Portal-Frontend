
import { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../../services/api";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";

import "./Login.css";

function getLoginFeedback(error) {
  const code = String(error.code || "").toUpperCase();
  const accountStatus = String(error.accountStatus || "").toLowerCase();
  const message = String(error.message || "").toLowerCase();

  if (
    code === "ACCOUNT_SUSPENDED" ||
    accountStatus === "suspended" ||
    message.includes("suspended")
  ) {
    return {
      type: "warning",
      title: "Account suspended",
      message:
        "Your account has been suspended. Please contact the administrator for assistance.",
    };
  }

  if (
    code === "ACCOUNT_PENDING" ||
    accountStatus === "pending" ||
    message.includes("awaiting approval") ||
    message.includes("pending approval")
  ) {
    return {
      type: "pending",
      title: "Approval pending",
      message:
        "Your registration has been received and is awaiting administrator approval. Please try again after your account is approved.",
    };
  }

  if (
    code === "ACCOUNT_REJECTED" ||
    accountStatus === "rejected" ||
    message.includes("registration was rejected") ||
    message.includes("account was rejected")
  ) {
    return {
      type: "error",
      title: "Registration not approved",
      message:
        "Your account registration was not approved. Please contact the administrator if you need further information.",
    };
  }

  if (
    code === "ACCOUNT_INACTIVE" ||
    (accountStatus && accountStatus !== "active")
  ) {
    return {
      type: "warning",
      title: "Account unavailable",
      message:
        "Your account is not currently active. Please contact the administrator for assistance.",
    };
  }

  if (
    code === "INVALID_CREDENTIALS" ||
    message.includes("invalid credentials") ||
    message.includes("incorrect password") ||
    message.includes("email or password")
  ) {
    return {
      type: "error",
      title: "Sign-in unsuccessful",
      message: "The email address or password is incorrect. Please try again.",
    };
  }

  if (
    error.status >= 500 ||
    message.includes("cannot connect") ||
    message.includes("network")
  ) {
    return {
      type: "warning",
      title: "Service temporarily unavailable",
      message:
        "We couldn't complete your sign-in. Please try again in a moment.",
    };
  }

  return {
    type: "error",
    title: "Unable to sign in",
    message: error.message || "Something went wrong. Please try again.",
  };
}

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  });
  const navigate = useNavigate();
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

  setStatus("submitting");
  setErrorMessage("");
  setFeedback(null);

  try {
    const result = await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: formData.email.trim(),
        password: formData.password,
      }),
    });

    if (!result.token || !result.user) {
      throw new Error("The server returned an invalid login response.");
    }

    localStorage.setItem("yourTaxToken", result.token);
    localStorage.setItem(
      "yourTaxUser",
      JSON.stringify(result.user)
    );

    setStatus("success");

    if (result.user.role === "admin") {
      navigate("/admin/dashboard", { replace: true });
    } else if (result.user.role === "client") {
      navigate("/client/dashboard", { replace: true });
    } else {
      localStorage.removeItem("yourTaxToken");
      localStorage.removeItem("yourTaxUser");
      throw new Error("Your account has an unrecognized role.");
    }
  }catch (error) {
  setStatus("error");
  setFeedback(getLoginFeedback(error));
  setErrorMessage(error.message);
}
};


  return (
    <main className="auth-page login-page">
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

            <span className="auth-eyebrow">WELCOME BACK</span>

            <h1>
              Good to see you
              <span> again.</span>
            </h1>

            <p>
              Access to Zafar Law Chamber-related information should start with a
              clear, secure sign-in process.
            </p>

            <div className="auth-intro__benefits">
              <div>
                <span className="auth-intro__check">
                  <ShieldCheck size={18} aria-hidden="true" />
                </span>
                <div>
                  <strong>Account access</strong>
                  <span>A dedicated place for your account</span>
                </div>
              </div>

              <div>
                <span className="auth-intro__check">
                  <LockKeyhole size={18} aria-hidden="true" />
                </span>
                <div>
                  <strong>Privacy-conscious design</strong>
                  <span>Security needs to be built into the system</span>
                </div>
              </div>
            </div>
          </div>

          <div className="auth-intro__footer">
            <span>Zafar Law Chamber</span>
            <span>Clear processes. Practical support.</span>
          </div>
        </div>

        <div className="auth-form-area">
          <div className="auth-form-card">
            <div className="auth-form-card__heading">
              <span className="auth-form-card__icon">
                <LockKeyhole size={23} aria-hidden="true" />
              </span>
              <h2>Sign in to your account</h2>
              <p>Enter your account details to continue.</p>
            </div>

            {feedback && (
              <div
                className={`auth-notice auth-notice--${feedback.type}`}
                role="alert"
                aria-live="assertive"
              >
                <ShieldCheck size={20} aria-hidden="true" />
                        
                <div>
                  <strong>{feedback.title}</strong>
                  <p>{feedback.message}</p>
                </div>
              </div>
            )}

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="auth-field">
                <label htmlFor="login-email">Email address</label>
                <input
                  id="login-email"
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
                <label htmlFor="login-password">Password</label>

                <div className="auth-password-wrap">
                  <input
                    id="login-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
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
              </div>

              <div className="auth-form__options">
                <label className="auth-checkbox">
                  <input
                    type="checkbox"
                    name="remember"
                    checked={formData.remember}
                    onChange={handleChange}
                  />
                  <span>Remember me</span>
                </label>
              </div>

              <button type="submit" className="auth-submit">
                Sign In
                <ArrowRight size={18} aria-hidden="true" />
              </button>
            </form>

            <div className="auth-form-card__divider">
              <span>NEW TO Zafar Law Chamber?</span>
            </div>

            <p className="auth-switch">
              Don&apos;t have an account?{" "}
              <Link to="/signup">Create an account</Link>
            </p>

            <p className="auth-form-card__back">
              <Link to="/">
                <ArrowRight size={15} aria-hidden="true" />
                Back to home
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Login;
