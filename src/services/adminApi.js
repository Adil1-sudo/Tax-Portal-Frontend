import { apiRequest, API_BASE_URL } from "./api";

export async function getClients({
  page = 1,
  limit = 10,
  status = "",
  search = "",
} = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (status) params.set("status", status);
  if (search.trim()) params.set("search", search.trim());

  return apiRequest(`/admin/clients?${params.toString()}`);
}

export async function updateClientStatus(id, status) {
  const allowedStatuses = ["active", "rejected", "suspended"];

  if (!allowedStatuses.includes(status)) {
    throw new Error("Invalid client account status.");
  }

  return apiRequest(
    `/admin/clients/${encodeURIComponent(id)}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }
  );
}

export async function getAdminDocuments(clientId = "") {
  const params = new URLSearchParams();

  if (clientId !== "" && clientId !== null && clientId !== undefined) {
    params.set("clientId", String(clientId));
  }

  const query = params.toString();

  return apiRequest(
    `/admin/documents${query ? `?${query}` : ""}`
  );
}

export async function uploadAdminDocument({
  clientId,
  title,
  category,
  visibility = "client_and_admin",
  file,
}) {
  if (!clientId || !title?.trim() || !file) {
    throw new Error("Client, document title, and file are required.");
  }

  const formData = new FormData();
  formData.append("clientId", String(clientId));
  formData.append("title", title.trim());
  formData.append("category", category || "general");
  formData.append("visibility", visibility);
  formData.append("document", file);

  return apiRequest("/admin/documents", {
    method: "POST",
    body: formData,
  });
}

export async function getAdminDocumentRequests(clientId = "") {
  const params = new URLSearchParams();

  if (clientId !== "" && clientId !== null && clientId !== undefined) {
    params.set("clientId", String(clientId));
  }

  const query = params.toString();

  return apiRequest(
    `/admin/documents/requests${query ? `?${query}` : ""}`
  );
}

export async function createAdminDocumentRequest({
  clientId,
  title,
  message = "",
  dueDate = "",
}) {
  if (!clientId || !title?.trim()) {
    throw new Error("Client and request title are required.");
  }

  return apiRequest("/admin/documents/requests", {
    method: "POST",
    body: JSON.stringify({
      clientId,
      title: title.trim(),
      message: message.trim(),
      dueDate: dueDate || null,
    }),
  });
}

export async function updateAdminDocumentRequestStatus(id, status) {
  if (!id) {
    throw new Error("A valid document request ID is required.");
  }

  if (!["completed", "cancelled"].includes(status)) {
    throw new Error("Invalid document request status.");
  }

  return apiRequest(
    `/admin/documents/requests/${encodeURIComponent(id)}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }
  );
}

export async function downloadAdminDocument(id) {
  if (!id) {
    throw new Error("A valid document ID is required.");
  }

  const token = localStorage.getItem("yourTaxToken");

  const headers = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;

  try {
    response = await fetch(
      `${API_BASE_URL}/admin/documents/${encodeURIComponent(id)}/download`,
      { headers }
    );
  } catch {
    throw new Error("Unable to connect to the server.");
  }

  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    throw new Error(
      result.message || "Unable to download this document."
    );
  }

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);

  try {
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = "";
    document.body.appendChild(link);
    link.click();
    link.remove();
  } finally {
    // Give the browser time to start the download before revoking the URL.
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
  }
}


export async function getAdminFees({
  page = 1,
  limit = 100,
  clientId = "",
  status = "",
  search = "",
} = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (clientId !== "") params.set("clientId", String(clientId));
  if (status) params.set("status", status.toLowerCase());
  if (search.trim()) params.set("search", search.trim());

  return apiRequest(`/admin/fees?${params.toString()}`);
}

export async function createAdminFee({
  clientId,
  title,
  description = "",
  amount,
  currency = "PKR",
  dueDate = "",
  internalNotes = "",
}) {
  if (!clientId || !title?.trim()) {
    throw new Error("Client and fee title are required.");
  }

  if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
    throw new Error("Enter an amount greater than zero.");
  }

  return apiRequest("/admin/fees", {
    method: "POST",
    body: JSON.stringify({
      clientId,
      title: title.trim(),
      description: description.trim(),
      amount: Number(amount),
      currency,
      dueDate: dueDate || null,
      internalNotes: internalNotes.trim(),
    }),
  });
}

export async function updateAdminFeeStatus(
  id,
  status,
  paymentReference = ""
) {
  if (!id) throw new Error("A valid fee ID is required.");

  if (!["paid", "cancelled"].includes(status)) {
    throw new Error("Invalid fee status.");
  }

  return apiRequest(
    `/admin/fees/${encodeURIComponent(id)}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({
        status,
        paymentReference:
          status === "paid" ? paymentReference.trim() : "",
      }),
    }
  );
}


export async function getAdminEnquiries({
  page = 1,
  limit = 100,
  search = "",
  status = "",
} = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (search.trim()) params.set("search", search.trim());
  if (status) params.set("status", status);

  return apiRequest(`/admin/enquiries?${params.toString()}`);
}

export async function getAdminEnquiry(id) {
  if (!id) throw new Error("A valid enquiry ID is required.");

  return apiRequest(`/admin/enquiries/${encodeURIComponent(id)}`);
}

export async function updateAdminEnquiry(id, updates) {
  if (!id) throw new Error("A valid enquiry ID is required.");

  return apiRequest(`/admin/enquiries/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
}


export async function getAdminSettings() {
  return apiRequest("/admin/settings");
}

export async function saveAdminSettings(key, value) {
  const allowedKeys = [
    "business_profile",
    "notification_preferences",
    "display_preferences",
  ];

  if (!allowedKeys.includes(key)) {
    throw new Error("Invalid settings group.");
  }

  return apiRequest(
    `/admin/settings/${encodeURIComponent(key)}`,
    {
      method: "PUT",
      body: JSON.stringify({ value }),
    }
  );
}


const WEBSITE_PAGE_KEYS = ["about", "services", "contact"];

export async function getAdminWebsitePages() {
  return apiRequest("/admin/website/pages");
}

export async function getAdminWebsitePage(pageKey) {
  if (!WEBSITE_PAGE_KEYS.includes(pageKey)) {
    throw new Error("Unsupported website page.");
  }

  return apiRequest(
    `/admin/website/pages/${encodeURIComponent(pageKey)}`
  );
}

export async function saveAdminWebsitePage({
  pageKey,
  title,
  description = "",
  content = {},
  isPublished = false,
}) {
  if (!WEBSITE_PAGE_KEYS.includes(pageKey)) {
    throw new Error("Select a supported website page.");
  }

  if (!title?.trim() || title.trim().length > 150) {
    throw new Error(
      "Page title is required and must be 150 characters or fewer."
    );
  }

  if (
    typeof description !== "string" ||
    description.length > 2000
  ) {
    throw new Error(
      "Description must be 2000 characters or fewer."
    );
  }

  if (typeof isPublished !== "boolean") {
    throw new Error("Publication status must be true or false.");
  }

  if (
    content === null ||
    !["string", "object"].includes(typeof content)
  ) {
    throw new Error("Page content must be a string or an object.");
  }

  let contentText;

  try {
    contentText =
      typeof content === "string"
        ? content
        : JSON.stringify(content);
  } catch {
    throw new Error("Page content could not be processed.");
  }

  if (contentText.length > 500000) {
    throw new Error("Page content is too large.");
  }

  return apiRequest("/admin/website/pages", {
    method: "POST",
    body: JSON.stringify({
      pageKey,
      title: title.trim(),
      description: description.trim(),
      content,
      isPublished,
    }),
  });
}


export async function getAdminDashboardSummary() {
  return apiRequest("/admin/dashboard-summary");
}
