
import { useEffect, useState } from "react";
import { apiRequest } from "../services/api";

export default function usePublicWebsitePage(pageKey) {
  const [page, setPage] = useState(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadPage() {
      setStatus("loading");
      setError("");

      try {
        const result = await apiRequest(
          `/public/website/pages/${encodeURIComponent(pageKey)}`
        );

        if (cancelled) return;

        setPage(result.data);
        setStatus("success");
      } catch (err) {
        if (cancelled) return;

        setPage(null);
        setError(err.message || "Unable to load this page.");
        setStatus("error");
      }
    }

    loadPage();

    return () => {
      cancelled = true;
    };
  }, [pageKey]);

  return { page, status, error };
}
