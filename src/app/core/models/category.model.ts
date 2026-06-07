export interface CategoryRequest {
  name: string;
  icon: string;
  color: string;
}

export interface CategoryResponse {
  id: string;
  name: string;
  icon: string;
  color: string;
  global: boolean;
}