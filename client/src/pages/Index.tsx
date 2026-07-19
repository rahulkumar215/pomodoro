import { Button } from "@/components/ui/button";
import { cx } from "class-variance-authority";
import { TABS } from "@/consts/consts";
import formattedTimer from "@/lib/formattedTimer";
import useTimer from "@/hooks/useTimer";
import Header from "@/components/header";
import Tasks from "@/components/tasks/tasks";
import { useTasks } from "@/context/TaskContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  CircleCheckIcon,
  FolderKanbanIcon,
} from "lucide-react";
import Projects from "@/components/projects/projects";
import PlanModal from "@/components/premium/PlanModal";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const countSchema = z.object({
  count: z.coerce.number<number>(),
  type: z.enum(["focus", "break"]),
});

export type CountInput = z.infer<typeof countSchema>;

function Index() {
  const {
    timer,
    started,
    activeTab,
    handleStartTimer,
    handleChangeTab,
    sessionCount,
    handleUpdateCount,
  } = useTimer();
  const { activeTask } = useTasks();
  const [open, setOpen] = useState(false);

  const form = useForm<CountInput>({
    resolver: zodResolver(countSchema),
    defaultValues: {
      count: 1,
      type: "focus",
    },
  });

  const onSubmit = (data: CountInput) => {
    const { count, type } = data;
    handleUpdateCount({ count, type });
    setOpen(false);
  };

  return (
    <div className="p-2 flex flex-col gap-12">
      <Header />
      <div className="flex flex-col items-center justify-center">
        <div className="flex flex-col items-center justify-center gap-6 bg-muted xl:w-8/12 p-6">
          <div className="flex gap-2 items-center justify-center">
            {Object.entries(TABS).map(([key, value]) => (
              <Button
                key={key}
                onClick={() => handleChangeTab(value)}
                variant={
                  activeTab.type === value.type ? "default" : "secondary"
                }
                size="sm"
              >
                {value.type}
              </Button>
            ))}
          </div>
          <h1 className="text-8xl! leading-9">{formattedTimer(timer)}</h1>
          <Button onClick={handleStartTimer} className="px-12 py-5 text-xl">
            {started ? "Stop" : "Start"}
          </Button>
          <div>
            {activeTab.type === "Pomodoro" ? (
              <Button
                variant="ghost"
                onClick={() => {
                  setOpen(true);
                  form.setValues({
                    count: sessionCount.focus,
                    type: "focus",
                  });
                }}
              >
                #{sessionCount.focus}
              </Button>
            ) : (
              <Button
                variant="ghost"
                onClick={() => {
                  setOpen(true);
                  form.setValues({
                    count: sessionCount.break,
                    type: "break",
                  });
                }}
              >
                #{sessionCount.break}
              </Button>
            )}
            <p>{activeTask ? activeTask.name : activeTab.message}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center">
        <Tabs defaultValue="tasks" className="xl:w-8/12">
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
            <Projects />
          </TabsContent>
        </Tabs>
      </div>

      <Dialog
        open={open}
        onOpenChange={(open) => {
          setOpen(open);
          form.reset();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Pomodoro Count</DialogTitle>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Controller
              name="count"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field className="w-48 mb-3">
                  <div className="flex items-center justify-start gap-2">
                    <Input
                      {...field}
                      type="number"
                      aria-invalid={fieldState.invalid}
                      id="count"
                      min={1}
                      className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <Button
                      variant="outline"
                      type="button"
                      onClick={() => field.onChange(Number(field.value) + 1)}
                    >
                      <ChevronUpIcon />
                    </Button>
                    <Button
                      variant="outline"
                      type="button"
                      onClick={() => field.onChange(Number(field.value) - 1)}
                      disabled={Number(field.value) <= 1}
                    >
                      <ChevronDownIcon />
                    </Button>
                  </div>
                </Field>
              )}
            />

            <DialogFooter className="flex-col sm:justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => form.setValue("count", 1)}
              >
                Clear
              </Button>

              <Button type="submit">Submit</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <PlanModal />
    </div>
  );
}

export default Index;
