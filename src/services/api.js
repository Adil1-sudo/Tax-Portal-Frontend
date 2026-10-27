
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem("yourTaxToken");
  const isFormData =
    typeof FormData !== "undefined" &&
    options.body instanceof FormData;

  const headers = {
    ...(
      options.body && !isFormData
        ? { "Content-Type": "application/json" }
        : {}
    ),
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;

  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
  } catch {
    throw new Error(
      "Cannot connect to the server. Check that the backend is running."
    );
  }

  const result = await response.json().catch(() => ({}));

if (!response.ok || result.success === false) {
  const error = new Error(
    result.message || `Request failed with status ${response.status}.`
  );

  error.status = response.status;
  error.code = result.code;
  error.accountStatus = result.accountStatus;

  throw error;
}

  return result;
}
