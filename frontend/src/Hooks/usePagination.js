import { useState, useCallback } from 'react';

const usePagination = (defaultPageSize = 10) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalRecords, setTotalRecords] = useState(0);
    const [pageSize, setPageSize] = useState(defaultPageSize);

    const handlePageChange = useCallback((page) => {
        setCurrentPage(page);
    }, []);

    const handlePageSizeChange = useCallback((current, size) => {
        setPageSize(size);
        setCurrentPage(1);
    }, []);

    const resetPagination = useCallback(() => {
        setCurrentPage(1);
        setTotalPages(0);
        setTotalRecords(0);
    }, []);

    return {
        currentPage,
        totalPages,
        totalRecords,
        pageSize,
        setTotalPages,
        setTotalRecords,
        handlePageChange,
        handlePageSizeChange,
        resetPagination
    };
};

export default usePagination;