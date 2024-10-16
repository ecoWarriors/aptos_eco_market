// src/utils/fetchProjects.ts

import { Project } from "../app/types/project";

export const fetchProjects = async (): Promise<Project[]> => {
  const response = await fetch('/api/projects');

  if (!response.ok) {
    throw new Error('Failed to fetch projects');
  }

  const data = await response.json();
console.log("Data:", data.projects);
  return data.projects;
};