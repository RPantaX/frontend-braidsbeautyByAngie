export interface PaginationState {
  first: number;
  rows: number;
  page: number;
  pageCount: number;
}

export interface SortState {
  sortField: string;
  sortOrder: number;
}

export interface EmployeeSearchCriteria {
  global?: string;
  name?: string;
  lastName?: string;
  emailAddress?: string;
  employeeType?: string;
  state?: boolean;
}
