import {
  ChartColumn,
  CircleUserIcon,
  ClockCheck,
  CrownIcon,
  KeyboardIcon,
  LogOut,
  MoreHorizontalIcon,
  Trash2Icon,
  UserCircleIcon,
} from "lucide-react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import Settings from "./settings";
import type { User } from "@/consts/consts";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Link } from "react-router";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import type { SessionsResponse } from "@/schemas/sessions";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { useSessions } from "@/hooks/useSessions";

const columnHelper = createColumnHelper<SessionsResponse>();

export const columns = [
  columnHelper.accessor("startTime", {
    header: "Date",
    cell: ({ getValue, row }) => {
      const startTime = new Date(getValue());
      const endTime = new Date(row.original.endTime);

      return (
        <div className="grid gap-1">
          <span className="font-medium">
            {startTime.toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </span>

          <div className="grid grid-cols-2 text-sm text-muted-foreground">
            <span>
              {startTime.toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}
            </span>

            <span className="text-right">
              {endTime.toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}
            </span>
          </div>
        </div>
      );
    },
  }),

  columnHelper.accessor((row) => row.task?.project?.name ?? "-", {
    id: "project",
    header: "Project",
  }),

  columnHelper.accessor((row) => row.task?.name ?? "-", {
    id: "task",
    header: "Task",
  }),

  columnHelper.accessor("minutes", {
    header: "Minutes",
    cell: ({ getValue }) => (
      <span className="font-medium">{getValue()} min</span>
    ),
  }),

  columnHelper.display({
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <Button variant="ghost" size="icon">
        <MoreHorizontalIcon className="size-4" />
      </Button>
    ),
  }),
];

export function DataTable({ columns }) {
  const [pagination, setPagination] = useState({
    pageIndex: 0, //initial page index
    pageSize: 10, //default page size
  });

  const { isPending, isError, error, data, isFetching, isPlaceholderData } =
    useSessions(pagination);

  const serverPageCount = Math.ceil(
    data?.totalCount ?? 0 / pagination.pageSize,
  );

  const table = useReactTable({
    data: data?.data.sessions ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    onPaginationChange: setPagination,
    state: {
      pagination,
    },
    pageCount: serverPageCount,
  });

  return (
    <div className="rounded-md border">
      <div>Hours Focused: {data?.hoursFocused}</div>
      <div>Days Accessed: {data?.daysAccessed}</div>
      <div>Streak Days: {data?.streakDays}</div>
      {isPending ? (
        <div>Loading...</div>
      ) : isError ? (
        <div>Error: {error.message}</div>
      ) : (
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}

      <div className="flex items-center justify-center  gap-2">
        <Button
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          {"<"}
        </Button>
        <span>{pagination.pageIndex + 1}</span>
        <Button
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          {">"}
        </Button>
      </div>
    </div>
  );
}

const Header = () => {
  const token: string | null = localStorage.getItem("token");
  const user: User = JSON.parse(localStorage.getItem("user") as string);
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center justify-between">
      <h2 className="flex items-center gap-x-2">
        <span>
          <ClockCheck />
        </span>
        Pomodoro
      </h2>

      <div className="flex items-center gap-4">
        <Button onClick={() => setOpen(true)}>
          <ChartColumn />
          Reprot
        </Button>

        <Settings />

        {token ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar>
                  <AvatarImage src={user?.avatarUrl} />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-36">
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <UserCircleIcon />
                  Account
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <CrownIcon />
                  Premium
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <LogOut />
                  Logout
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <KeyboardIcon />
                  Shortcuts
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive">
                  <Trash2Icon />
                  Delete Account
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button asChild>
            <Link to="/signup">
              <CircleUserIcon />
              Sign In
            </Link>
          </Button>
        )}
      </div>

      <Dialog open={open} onOpenChange={(open) => setOpen(open)}>
        <DialogContent className="overflow-scroll max-h-11/12 ">
          <DialogHeader>
            <DialogTitle>Pomodoro Report</DialogTitle>
          </DialogHeader>

          <DataTable columns={columns} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Header;
