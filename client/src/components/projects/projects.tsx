import {
  CheckIcon,
  CircleCheckIcon,
  CirclePlusIcon,
  EditIcon,
  EllipsisVerticalIcon,
  FolderCodeIcon,
  PlusCircleIcon,
  Trash2Icon,
} from "lucide-react";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { type ProjectsResponses } from "@/schemas/projects";
import { COLOR_KEYS, colors } from "@/consts/consts";

import {
  type CreateProjectInput,
  createProjectSchema,
} from "@/schemas/projects";
import { useState } from "react";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { toast } from "sonner";

import {
  useCreateProject,
  useDeleteProject,
  useProjects,
  useUpdateProject,
} from "@/hooks/useProjects";
import { Button } from "../ui/button";
import { useAuth } from "@/context/AuthContext";
import { usePlanDialog } from "@/context/PlamDialogContext";

const ItemComp = ({
  project,
  onEditProject,
  onDeleteProject,
}: {
  project: ProjectsResponses;
  onEditProject: (projectId: string) => void;
  onDeleteProject: (taskId: string) => void;
}) => {
  const { name, color } = project;
  return (
    <Item variant="outline">
      <ItemMedia>
        <span
          className="size-6 rounded-full"
          style={{
            background: colors[color],
          }}
        ></span>
      </ItemMedia>
      <ItemContent>
        <ItemTitle>{name}</ItemTitle>
      </ItemContent>
      <ItemActions>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="py-1 px-2 h-fit"
              onClick={(e: React.MouseEvent<HTMLElement>) =>
                e.stopPropagation()
              }
            >
              <EllipsisVerticalIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="flex gap-1 min-w-fit ">
            <DropdownMenuItem asChild className="cursor-pointer">
              <Button
                variant="outline"
                onClick={(e: React.MouseEvent<HTMLElement>) => {
                  e.stopPropagation();
                  onEditProject(project.id);
                }}
              >
                <EditIcon />
              </Button>
            </DropdownMenuItem>
            <DropdownMenuItem
              asChild
              className="cursor-pointer"
              variant="destructive"
            >
              <Button
                variant="destructive"
                onClick={(e: React.MouseEvent<HTMLElement>) => {
                  e.stopPropagation();
                  onDeleteProject(project.id);
                }}
              >
                <Trash2Icon />
              </Button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </ItemActions>
    </Item>
  );
};

function Projects() {
  const [open, setOpen] = useState(false);
  const [editProjectId, setEditProjectId] = useState<string | null>(null);
  const { isPremium } = useAuth();
  const { setOpenPlanDialog } = usePlanDialog();

  const form = useForm<CreateProjectInput>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: "",
      color: "brickRed",
    },
    mode: "onBlur",
  });

  const { data: projects = [] } = useProjects();
  const create = useCreateProject();
  const update = useUpdateProject();
  const delProject = useDeleteProject();

  const onSubmit = (data: CreateProjectInput) => {
    console.log(data);
    create.mutate(data);
    setOpen(false);
    form.reset();
  };

  const handleCreateProject = () => {
    if (!isPremium) {
      alert("This feature is limited to premium users only.");
      setOpenPlanDialog(true);
      return;
    }
    setOpen(true);
  };

  const handleEditProject = (projectId: string) => {
    const project = projects.find((project) => project.id === projectId);

    if (!project) {
      toast.error("No Project found.");
      return;
    }

    setEditProjectId(projectId);
    setOpen(true);
    form.setValues({ name: project.name, color: project.color });
  };

  const onEdit = (formState: CreateProjectInput) => {
    if (editProjectId === null) {
      toast.error("No project found.");
      return;
    }

    update.mutate({
      id: editProjectId,
      project: formState,
    });
    toast.success("Successfully updated project");
    setOpen(false);
    form.reset();
  };

  return (
    <Card>
      <CardHeader className="flex justify-between items-center">
        <CardTitle>Projects</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {projects && projects.length > 0 ? (
          <ItemGroup>
            {projects.map((project: ProjectsResponses) => (
              <ItemComp
                key={project.id}
                project={project}
                onEditProject={handleEditProject}
                onDeleteProject={delProject.mutate}
              />
            ))}
          </ItemGroup>
        ) : (
          <Empty className="border border-dashed">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <FolderCodeIcon />
              </EmptyMedia>
              <EmptyTitle>No Project Yet</EmptyTitle>
              <EmptyDescription>
                You haven&apos;t created any projects yet. Get started by
                creating your first project.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent className="flex-row justify-center gap-2">
              <Button onClick={handleCreateProject}>
                <PlusCircleIcon />
                Create Project
              </Button>
            </EmptyContent>
          </Empty>
        )}

        <Dialog
          open={open}
          onOpenChange={(open) => {
            setOpen(open);
            if (!open) {
              form.reset();
            }
          }}
        >
          {projects.length > 0 && (
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="border-dashed h-12"
                onClick={() => setOpen(true)}
              >
                <CirclePlusIcon />
                Create Project
              </Button>
            </DialogTrigger>
          )}
          <DialogContent>
            <form
              onSubmit={form.handleSubmit(editProjectId ? onEdit : onSubmit)}
            >
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <CircleCheckIcon /> Add Project
                </DialogTitle>
                <DialogDescription>
                  Projects make organizing task more fun.
                </DialogDescription>
              </DialogHeader>
              <div className="-mx-4 mt-2 no-scrollbar max-h-[70vh] overflow-y-auto px-4 pb-4">
                <FieldGroup>
                  <Controller
                    name="name"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="name">Project Name</FieldLabel>
                        <Input
                          {...field}
                          type="text"
                          placeholder="Project x..."
                          aria-invalid={fieldState.invalid}
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />

                  <Controller
                    name="color"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel>Project Color</FieldLabel>

                        <div className="grid grid-cols-8 gap-2">
                          {COLOR_KEYS.map((color) => (
                            <Tooltip key={color}>
                              <TooltipTrigger asChild>
                                <Button
                                  key={color}
                                  value={color}
                                  style={{
                                    background: colors[color],
                                  }}
                                  className="rounded"
                                  type="button"
                                  onClick={() => field.onChange(color)}
                                >
                                  {field.value === color && (
                                    <CheckIcon className="text-white" />
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="uppercase">{color}</p>
                              </TooltipContent>
                            </Tooltip>
                          ))}
                        </div>
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </FieldGroup>
              </div>

              <DialogFooter className="flex-col">
                <Button type="submit">
                  {editProjectId ? "Update" : "Submit"}
                </Button>
                <DialogClose asChild>
                  <Button variant="outline" type="button">
                    Cancel
                  </Button>
                </DialogClose>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

export default Projects;
