export interface CreateProjectDTO {
  name: string;
  description?: string;
  clientId: string;
  managerId?: string;
}

export interface UpdateProjectDTO {
  name?: string;
  description?: string;
  clientId?: string;
  managerId?: string;
}

export interface ProjectFilterQuery {
  search?: string;
  clientId?: string;
}
