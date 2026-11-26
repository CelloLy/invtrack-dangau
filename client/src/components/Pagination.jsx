import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ currentPage, totalItems, itemsPerPage, onPageChange }) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (totalPages <= 1) return null;

  const handlePrev = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };

  const getPageNumbers = () => {
    let pages = [];
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);

    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) pages.push('...');
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) pages.push('...');
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="pagination-bar">
      <div>Menampilkan {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)} sampai {Math.min(currentPage * itemsPerPage, totalItems)} dari {totalItems} data</div>
      <div className="pagination-pages">
        <ChevronLeft 
          size={16} 
          color={currentPage === 1 ? "#cbd5e1" : "#64748b"} 
          style={{ cursor: currentPage === 1 ? 'default' : 'pointer' }} 
          onClick={handlePrev} 
        />
        {getPageNumbers().map((page, index) => (
          <div 
            key={index} 
            className={`page-num ${currentPage === page ? 'active' : ''}`}
            onClick={() => typeof page === 'number' && onPageChange(page)}
            style={{ cursor: typeof page === 'number' ? 'pointer' : 'default' }}
          >
            {page}
          </div>
        ))}
        <ChevronRight 
          size={16} 
          color={currentPage === totalPages ? "#cbd5e1" : "#64748b"} 
          style={{ cursor: currentPage === totalPages ? 'default' : 'pointer' }} 
          onClick={handleNext} 
        />
      </div>
    </div>
  );
};

export default Pagination;
