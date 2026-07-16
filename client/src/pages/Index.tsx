// import { Button } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
// import { useEffect } from "react";
// import axios from "axios";
// import api from "@/lib/api";
import { cx } from "class-variance-authority";
import { TABS } from "@/consts/consts";
import formattedTimer from "@/lib/formattedTimer";
import useTimer from "@/hooks/useTimer";
import Header from "@/components/header";
import Tasks from "@/components/tasks/tasks";
import { useTasks } from "@/context/TaskContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CircleCheckIcon, FolderKanbanIcon } from "lucide-react";
import Projects from "@/components/projects/projects";
import PlanModal from "@/components/premium/PlanModal";

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
            <Projects />
          </TabsContent>
        </Tabs>
      </div>
      <PlanModal />
    </div>
  );
}

export default Index;
