import api from "@/lib/api";
import {
  projectsResponseSchema,
  type CreateProjectInput,
  type ProjectsResponses,
} from "@/schemas/projects";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import z from "zod";

export const useProjects = () => {
  return useQuery({
    queryKey: ["projects"],
    queryFn: async (): Promise<ProjectsResponses[]> => {
      const response = await api.get("/projects");
      return z.array(projectsResponseSchema).parse(response.data.data.projects);
    },
  });
};

export const useCreateProject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (
      project: CreateProjectInput,
    ): Promise<ProjectsResponses> => {
      const resposne = await api.post("/projects", project);
      return resposne.data.data.project;
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["projects"],
      });
    },
  });
};

export const useUpdateProject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      project,
    }: {
      id: string;
      project: CreateProjectInput;
    }): Promise<ProjectsResponses> => {
      const resposne = await api.patch(`/projects/${id}`, project);
      return resposne.data.data.project;
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["projects"],
      });
    },
  });
};

export const useDeleteProject = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (projectId: string) => {
      return await api.delete(`/projects/${projectId}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["projects"],
      });
    },
  });
};
