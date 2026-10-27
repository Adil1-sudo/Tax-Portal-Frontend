import { useMemo, useState } from "react";
import { Search, ChevronLeft, ChevronRight, Inbox } from "lucide-react";
import LoadingSpinner from "./LoadingSpinner";
import "./DataTable.css";

function DataTable({
  columns = [],
  data = [],
  getRowId,
  loading = false,
  emptyMessage = "No records found.",
  searchable = false,
  searchPlaceholder = "Search records...",
  pageSize = 5,
  actions,
  className = "",
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;

    const query = searchTerm.toLowerCase();

    return data.filter((row) =>
      columns.some((column) => {
        if (column.searchable === false) return false;

        const value = column.accessor
          ? row[column.accessor]
          : "";

        return String(value ?? "").toLowerCase().includes(query);
      })
    );
  }, [data, columns, searchTerm]);

  const safePageSize = Math.max(1, pageSize);
  const totalPages = Math.max(
    1,
    Math.ceil(filteredData.length / safePageSize)
  );

  const displayedPage = Math.min(currentPage, totalPages);

  const startIndex = (displayedPage - 1) * safePageSize;
  const pageData = filteredData.slice(
    startIndex,
    startIndex + safePageSize
  );

  function handleSearch(event) {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  }

  function goToPage(page) {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  }

  return (
    <section className={`data-table ${className}`.trim()}>
      {searchable && (
        <div className="data-table__toolbar">
          <label className="data-table__search">
            <Search size={18} aria-hidden="true" />

            <input
              type="search"
              value={searchTerm}
              onChange={handleSearch}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
            />
          </label>

          <span className="data-table__total">
            {filteredData.length}{" "}
            {filteredData.length === 1 ? "record" : "records"}
          </span>
        </div>
      )}

      <div className="data-table__scroll">
        <table className="data-table__table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={column.className || ""}
                >
                  {column.header}
                </th>
              ))}

              {actions && (
                <th scope="col" className="data-table__actions-heading">
                  Actions
                </th>
              )}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length + (actions ? 1 : 0)}
                  className="data-table__state"
                >
                  <LoadingSpinner
                    size="small"
                    label="Loading records..."
                  />
                </td>
              </tr>
            ) : pageData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (actions ? 1 : 0)}
                  className="data-table__state"
                >
                  <Inbox
                    size={30}
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />

                  <p>{emptyMessage}</p>
                </td>
              </tr>
            ) : (
              pageData.map((row, rowIndex) => (
                <tr
                  key={
                    getRowId
                      ? getRowId(row)
                      : row.id ?? startIndex + rowIndex
                  }
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={column.className || ""}
                      data-label={column.header}
                    >
                      {column.render
                        ? column.render(row)
                        : column.accessor
                          ? row[column.accessor] ?? "—"
                          : "—"}
                    </td>
                  ))}

                  {actions && (
                    <td
                      className="data-table__actions"
                      data-label="Actions"
                    >
                      {actions(row)}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!loading && filteredData.length > 0 && (
        <div className="data-table__pagination">
          <span className="data-table__pagination-info">
            Showing {startIndex + 1}–
            {Math.min(startIndex + safePageSize, filteredData.length)}{" "}
            of {filteredData.length}
          </span>

          <div className="data-table__pagination-controls">
            <button
              type="button"
              className="data-table__page-button"
              onClick={() => goToPage(displayedPage - 1)}
              disabled={displayedPage === 1}
              aria-label="Previous page"
            >
              <ChevronLeft size={18} aria-hidden="true" />
            </button>

            <span className="data-table__page-number">
              {displayedPage} / {totalPages}
            </span>

            <button
              type="button"
              className="data-table__page-button"
              onClick={() => goToPage(displayedPage + 1)}
              disabled={displayedPage === totalPages}
              aria-label="Next page"
            >
              <ChevronRight size={18} aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

export default DataTable;