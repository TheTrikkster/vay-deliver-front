interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const renderPageNumbers = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);

    if (currentPage < 5) {
      return [...Array.from({ length: 5 }, (_, i) => i + 1), '...', totalPages];
    }

    if (currentPage > totalPages - 4) {
      return [1, '...', ...Array.from({ length: 5 }, (_, i) => totalPages - 4 + i)];
    }

    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  };

  return (
    <div className="mt-6 flex justify-center">
      <div className="flex space-x-1 md:space-x-2">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-2 py-1 md:px-3 text-sm md:text-base bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50"
        >
          Предыдущий
        </button>
        {renderPageNumbers().map(page => (
          <button
            key={page}
            onClick={() => onPageChange(Number(page))}
            className={`px-3 py-1 rounded-md ${
              currentPage === page ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            {page}
          </button>
        ))}
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50"
        >
          Следующий
        </button>
      </div>
    </div>
  );
};

export default Pagination;
