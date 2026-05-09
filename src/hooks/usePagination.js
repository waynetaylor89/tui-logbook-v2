// src/hooks/usePagination.js

export default function usePagination(
  data,
  currentPage,
  recordsPerPage
) {
  const totalPages = Math.max(
    1,
    Math.ceil(data.length / recordsPerPage)
  );

  const paginatedData = data.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  return {
    totalPages,
    paginatedData,
  };
}const { totalPages, paginatedData } =
  usePagination(
    typeFilteredHistory,
    currentPage,
    recordsPerPage
  );