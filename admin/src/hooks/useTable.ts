import { useState, useCallback } from 'react';
import type { TableParams } from '@/types';
import type { TablePaginationConfig, SorterResult, FilterValue } from 'antd/es/table/interface';

interface UseTableOptions {
  defaultPageSize?: number;
  defaultPage?: number;
}

export const useTable = (options: UseTableOptions = {}) => {
  const { defaultPageSize = 20, defaultPage = 1 } = options;

  const [params, setParams] = useState<TableParams>({
    page: defaultPage,
    pageSize: defaultPageSize,
    sortField: undefined,
    sortOrder: undefined,
    search: undefined,
    filters: {},
  });

  const handleTableChange = useCallback(
    (
      pagination: TablePaginationConfig,
      filters: Record<string, FilterValue | null>,
      sorter: SorterResult<unknown> | SorterResult<unknown>[]
    ) => {
      const activeSorter = Array.isArray(sorter) ? sorter[0] ?? {} : sorter;
      let nextSortOrder: TableParams['sortOrder'];

      if (activeSorter?.order === 'ascend') {
        nextSortOrder = 'asc';
      } else if (activeSorter?.order === 'descend') {
        nextSortOrder = 'desc';
      } else {
        nextSortOrder = undefined;
      }

      setParams((prev) => ({
        ...prev,
        page: pagination?.current ?? prev.page,
        pageSize: pagination?.pageSize ?? prev.pageSize,
        sortField: typeof activeSorter?.field === 'string' ? activeSorter.field : undefined,
        sortOrder: nextSortOrder,
        filters,
      }));
    },
    []
  );

  const handleSearch = useCallback((search: string) => {
    setParams((prev) => ({ ...prev, search, page: 1 }));
  }, []);

  const handleFilter = useCallback((filters: Record<string, unknown>) => {
    setParams((prev) => ({ ...prev, filters, page: 1 }));
  }, []);

  const resetParams = useCallback(() => {
    setParams({
      page: defaultPage,
      pageSize: defaultPageSize,
      sortField: undefined,
      sortOrder: undefined,
      search: undefined,
      filters: {},
    });
  }, [defaultPage, defaultPageSize]);

  return {
    params,
    handleTableChange,
    handleSearch,
    handleFilter,
    resetParams,
  };
};
