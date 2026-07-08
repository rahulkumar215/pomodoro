import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemTitle,
} from "../ui/item";
import { cx } from "class-variance-authority";
import { type TasksResponse, type UpdateTaskInput } from "@/schemas/tasks";
import { useSortable } from "@dnd-kit/react/sortable";
import { Button } from "../ui/button";
import {
  CircleCheckBigIcon,
  EditIcon,
  EllipsisVerticalIcon,
  Trash2Icon,
} from "lucide-react";
import { colors } from "@/consts/consts";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

const TaskItemComp = ({
  task,
  index,
  onEditTask,
  onDeleteTask,
  onPatchTask,
  onClick,
}: {
  task: TasksResponse;
  index: number;
  onEditTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onPatchTask: (taskId: string, changes: Partial<UpdateTaskInput>) => void;
  onClick: (task: TasksResponse) => void;
}) => {
  const {
    id,
    name,
    estimatedPomodoros,
    completedPomodoros,
    isComplete,
    note,
    projectId,
  } = task;
  const { ref } = useSortable({ id, index });

  return (
    <Item ref={ref} variant="outline" onClick={() => onClick(task)}>
      <ItemActions>
        <Button
          onClick={(e: React.MouseEvent<HTMLElement>) => {
            e.stopPropagation();
            onPatchTask(task.id, {
              isComplete: !isComplete,
            });
          }}
          variant={isComplete ? "default" : "ghost"}
          className="rounded-full"
        >
          <CircleCheckBigIcon />
        </Button>
      </ItemActions>
      <ItemContent>
        <ItemTitle
          className={cx("flex-1 text-left", isComplete && "line-through")}
        >
          {name}
        </ItemTitle>
        {projectId && (
          <ItemDescription className="text-xs flex items-center gap-1 ">
            <span
              className="inline-block size-3 rounded-full"
              style={{
                background: colors[task.project?.color || 0],
              }}
            >
              &nbsp;
            </span>
            {task.project?.name}
          </ItemDescription>
        )}
      </ItemContent>
      <ItemActions>
        <span>
          {completedPomodoros}/{estimatedPomodoros}
        </span>
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
                  onEditTask(task.id);
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
                  onDeleteTask(task.id);
                }}
              >
                <Trash2Icon />
              </Button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </ItemActions>
      {note && (
        <ItemFooter className="text-left p-2  border rounded-md bg-yellow-300 text-black">
          {note}
        </ItemFooter>
      )}
    </Item>
  );
};

export default TaskItemComp;
