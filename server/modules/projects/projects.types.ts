export interface CreateProjectDTO {
  name: string;
  description?: string;
  clientId: string;
  managerId?: string; // If Admin creates, can specify PM, else defaults to current user
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
