export interface ApiResponse<T = any> {
	error: boolean;
	code: string;
	title: string;
  mensaje: string;
	type: 'I' | 'E' | 'A';
  date: Date;
  data: T;
}
export interface APIErrorResponse {
  status:    number;
  timestamp: Date;
  message:   string;
  details:   null;
  path:      string;
}
