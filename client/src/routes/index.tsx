import { Button } from "@/components/ui/button";
import { createFileRoute } from "@tanstack/react-router";
import { cx } from "class-variance-authority";
import { TABS } from "@/consts/consts";
import formattedTimer from "@/lib/formattedTimer";
import useTimer from "@/hooks/useTimer";
import Header from "@/components/header";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const {
    timer,
    started,
    activeTab,
    handleStartTimer,
    handleChangeTab,
    count,
  } = useTimer();

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
        {activeTab.type === "Pomodoro" ? (
          <p>#{count.focus}</p>
        ) : (
          <p>#{count.break}</p>
        )}
        <p>{activeTab.message}</p>
        <Button onClick={handleStartTimer}>{started ? "Stop" : "Start"}</Button>
      </div>
    </div>
  );
}
