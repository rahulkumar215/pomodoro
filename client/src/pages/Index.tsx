// import { Button } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
// import { useEffect } from "react";
// import axios from "axios";
// import api from "@/lib/api";
import { cx } from "class-variance-authority";
import { COLOR_KEYS, colors, TABS } from "@/consts/consts";
import formattedTimer from "@/lib/formattedTimer";
import useTimer from "@/hooks/useTimer";
import Header from "@/components/header";
import Tasks from "@/components/tasks";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { useTasks } from "@/context/TaskContext";
import type { SessionsResponse } from "@/schemas/sessions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckIcon,
  CircleCheckIcon,
  CirclePlusIcon,
  EditIcon,
  EllipsisVerticalIcon,
  FolderCodeIcon,
  FolderKanbanIcon,
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
  type CreateProjectInput,
  createProjectSchema,
  projectsResponseSchema,
  type ProjectsResponses,
} from "@/schemas/projects";
import z from "zod";
import { useState } from "react";
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
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import {
  Item,
  ItemActions,
  ItemContent,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  useCreateProject,
  useDeleteProject,
  useProjects,
  useUpdateProject,
} from "@/hooks/useProjects";

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

function Index() {
  const {
    timer,
    started,
    activeTab,
    handleStartTimer,
    handleChangeTab,
    count,
  } = useTimer();
  const { activeTask } = useTasks();

  const [open, setOpen] = useState(false);
  const [editProjectId, setEditProjectId] = useState<string | null>(null);

  const form = useForm<CreateProjectInput>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: "",
      color: "brickRed",
    },
    mode: "onBlur",
  });

  const {
    isPending,
    isError,
    data: sessions,
    error,
  } = useQuery({
    queryKey: ["sessions"],
    queryFn: async (): Promise<SessionsResponse[]> => {
      const response = await api.get("/sessions");
      return response.data.sessions;
    },
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

  if (isPending) {
    return <span>Loading...</span>;
  }

  if (isError) {
    return <span>Error: {error.message}</span>;
  }

  return (
    <div className="p-2 flex flex-col gap-6">
      <Header />
      <div className="flex flex-col gap-6 items-center">
        <div className="flex gap-2 items-center justify-center">
          {Object.entries(TABS).map(([key, value]) => (
            <Button
              key={key}
              onClick={() => handleChangeTab(value)}
              variant="secondary"
              className={cx(
                activeTab.type === value.type &&
                  "bg-white text-secondary hover:bg-gray-100",
              )}
            >
              {value.type}
            </Button>
          ))}
        </div>
        <h1>{formattedTimer(timer)}</h1>
        <Button onClick={handleStartTimer}>{started ? "Stop" : "Start"}</Button>
        {activeTab.type === "Pomodoro" ? (
          <p>#{count.focus}</p>
        ) : (
          <p>#{count.break}</p>
        )}
        <p>{activeTask ? activeTask.name : activeTab.message}</p>

        <Tabs defaultValue="tasks">
          <TabsList>
            <TabsTrigger value="tasks">
              <CircleCheckIcon />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="projects">
              <FolderKanbanIcon />
              Projects
            </TabsTrigger>
          </TabsList>
          <TabsContent value="tasks">
            <Tasks />
          </TabsContent>
          <TabsContent value="projects">
            <Card className="w-md">
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
                        You haven&apos;t created any projects yet. Get started
                        by creating your first project.
                      </EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent className="flex-row justify-center gap-2">
                      <Button onClick={() => setOpen(true)}>
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
                      onSubmit={form.handleSubmit(
                        editProjectId ? onEdit : onSubmit,
                      )}
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
                                <FieldLabel htmlFor="name">
                                  Project Name
                                </FieldLabel>
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
          </TabsContent>
        </Tabs>

        {sessions.map((session) => (
          <div
            key={session.id}
            className="text-xs text-left p-2 border mb-2 border-white rounded-md"
          >
            <p>Session Type : {session.type}</p>
            <p>Start Time : {new Date(session.startTime).toLocaleString()}</p>
            <p>End Time : {new Date(session.endTime).toLocaleString()}</p>
            <p>Minutes : {session.minutes}</p>
          </div>
        ))}
      </div>
    </div>
  );
  // const loadScript = (src: string) => {
  //   return new Promise((resolve) => {
  //     const script = document.createElement("script");
  //     script.src = src;
  //     script.onload = () => {
  //       resolve(true);
  //     };
  //     script.onerror = () => {
  //       resolve(false);
  //     };
  //     document.body.appendChild(script);
  //   });
  // };
  // const onPayment = async (amount: number) => {
  //   // create order
  //   try {
  //     const options = {
  //       planId: 1,
  //       amount,
  //     };
  //     const res = await api.post("/payments/createOrder", options);
  //     const data = res.data;
  //     console.log(data);
  //     const paymentObject = new (window as any).Razorpay({
  //       key: import.meta.env.VITE_RAZORPAY_API_KEY,
  //       order_id: data.id,
  //       ...data,
  //       handler: function (response: any) {
  //         console.log(response);
  //         const options2 = {
  //           order_id: response.razorpay_order_id,
  //           payment_id: response.razorpay_payment_id,
  //           signature: response.razorpay_signature,
  //         };
  //         axios
  //           .post(
  //             "http://localhost:3000/api/v1/payments/verifyPayment",
  //             options2,
  //           )
  //           .then((res) => {
  //             console.log(res.data);
  //             if (res.status === 200) {
  //               alert("Payment Successful");
  //             } else {
  //               alert("Payment Failed");
  //             }
  //           })
  //           .catch((err) => {
  //             console.log(err);
  //           });
  //       },
  //     });
  //     paymentObject.open();
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };
  // const onSubscription = async (planId: string) => {
  //   try {
  //     const { data } = await api.post("payments/createSubscription", {
  //       planId,
  //     });
  //     const options = {
  //       key: import.meta.env.VITE_RAZORPAY_API_KEY,
  //       subscription_id: data.subscriptionId,
  //       name: "Rahul Vishwakarma",
  //       description: "Monthly Test Plan",
  //       handler: function (response: any) {
  //         const options2 = {
  //           payment_id: response.razorpay_payment_id,
  //           subscription_id: response.razorpay_subscription_id,
  //           signature: response.razorpay_signature,
  //         };
  //         api.post("/payments/verifySubscription", options2).then((res) => {
  //           if (res.status === 200) {
  //             alert("Subscription Successful");
  //           } else {
  //             alert("Subscription Failed");
  //           }
  //         });
  //       },
  //       theme: {
  //         color: "#F37254",
  //       },
  //     };
  //     const rzp = new (window as any).Razorpay(options);
  //     rzp.open();
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };
  // useEffect(() => {
  //   loadScript("https://checkout.razorpay.com/v1/checkout.js");
  // }, []);
  // return (
  //   <div className="flex items-center gap-6 flex-col">
  //     Razor Pay Integration
  //     <div className="flex gap-4 items-center">
  //       <Button onClick={() => onSubscription("plan_T7Fz3v0j92fNhO")}>
  //         ₹300 / month
  //       </Button>
  //       <Button onClick={() => onSubscription("plan_T7FtJLgweReVcY")}>
  //         ₹1800 / year
  //       </Button>
  //       <Button onClick={() => onPayment(5400)}>₹5400 / lifetime</Button>
  //     </div>
  //   </div>
  // );
}

export default Index;
