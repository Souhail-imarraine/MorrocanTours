export interface CategoryResponse {
  id: number;
  name: string;
  description: string;
  icon?: string;
}

export interface CategoryRequest {
  name: string;
  description: string;
}
