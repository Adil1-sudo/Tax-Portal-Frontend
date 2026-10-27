
import { apiRequest } from "./api";

// Dashboard summary
export async function getClientDashboardSummary() {
  return apiRequest("/client/dashboard-summary");
}

// Client profile
export async function getClientProfile() {
  return apiRequest("/client/profile");
}

export async function updateClientProfile({
  fullName,
  businessName = "",
  phone = "",
  address = "",
  country = "",
  taxReference = "",
}) {
  if (!fullName?.trim()) {
    throw new Error("Full name is required.");
  }

  return apiRequest("/client/profile", {
    method: "PATCH",
    body: JSON.stringify({
      fullName: fullName.trim(),
      businessName: businessName.trim(),
      phone: phone.trim(),
      address: address.trim(),
      country: country.trim(),
      taxReference: taxReference.trim(),
    }),
  });
}

// Documents
export async function getClientDocuments() {
  return apiRequest("/client/documents");
}

// Document requests
export async function getClientDocumentRequests() {
  return apiRequest("/client/document-requests");
}

export async function createClientDocumentRequest({
  title,
  message = "",
}) {
  if (!title?.trim()) {
    throw new Error("Request title is required.");
  }

  return apiRequest("/client/document-requests", {
    method: "POST",
    body: JSON.stringify({
      title: title.trim(),
      message: message.trim(),
    }),
  });
}

// Fees
export async function getClientFees() {
  return apiRequest("/client/fees");
}

export async function submitClientPaymentReference(
  feeId,
  paymentReference
) {
  if (!feeId) {
    throw new Error("A valid fee ID is required.");
  }

  if (!paymentReference?.trim()) {
    throw new Error("Payment reference is required.");
  }

  return apiRequest(
    `/client/fees/${encodeURIComponent(feeId)}/payment-reference`,
    {
      method: "PATCH",
      body: JSON.stringify({
        paymentReference: paymentReference.trim(),
      }),
    }
  );
}

// Reports
export async function getClientReportSummary() {
  return apiRequest("/client/reports/summary");
}

export async function uploadClientDocument({
  file,
  title,
  category,
  requestId = null,
}) {
  if (!(file instanceof File)) {
    throw new Error("Choose a file to upload.");
  }

  if (file.size > 10 * 1024 * 1024) {
    throw new Error("The maximum file size is 10 MB.");
  }

const formData = new FormData();

formData.append("document", file); // Must match upload.single("document")
formData.append("title", title.trim());
formData.append("category", category);

if (requestId !== null && requestId !== undefined && requestId !== "") {
  formData.append("requestId", String(requestId));
}

return apiRequest("/client/documents/upload", {
  method: "POST",
  body: formData,
});
}

export async function downloadClientDocument(documentId) {
  if (!documentId) {
    throw new Error("A valid document ID is required.");
  }

  // Use the existing API base URL and authenticated token.
  const token = localStorage.getItem("yourTaxToken");

  const response = await fetch(
    `${API_BASE_URL}/client/documents/${encodeURIComponent(documentId)}/download`,
    {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }
  );

  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    throw new Error(result.message || "Unable to download the document.");
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);

  try {
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `your-tax-document-${documentId}`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  } finally {
    URL.revokeObjectURL(url);
  }
}