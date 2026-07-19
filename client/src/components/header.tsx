import {
  CalendarIcon,
  ChartColumn,
  ChartColumnIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  CircleUserIcon,
  ClockCheck,
  ClockIcon,
  CrownIcon,
  EllipsisVerticalIcon,
  FlameIcon,
  LogOut,
  SquarePenIcon,
  UserCircleIcon,
} from "lucide-react";
import { Button, buttonVariants } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import Settings from "./settings";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Link, useNavigate } from "react-router";
import { useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import type { SessionsResponse } from "@/schemas/sessions";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
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
import api from "@/lib/api";
import { handleError } from "@/lib/handleError";
import { toast } from "sonner";
import { usePlanDialog } from "@/context/PlamDialogContext";
import { useAuth } from "@/context/AuthContext";
import { Input } from "./ui/input";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Field, FieldError, FieldLabel } from "./ui/field";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "./ui/card";
import { Skeleton } from "./ui/skeleton";

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
];

const username = z.object({
  name: z
    .string({ error: "Name is required." })
    .min(3, "Name should be at least 3 char long.")
    .max(30, "Name max length reached"),
});

type UserNameInput = z.infer<typeof username>;

const useremail = z.object({
  email: z.email({ error: "Email is required" }),
});

type UserEmailInput = z.infer<typeof useremail>;

const otpSchema = z.object({
  otp: z
    .string({ error: "OTP is required" })
    .length(6, { error: "OTP must be exactly 6 characters" }),
});

type OTPInput = z.infer<typeof otpSchema>;

export function DataTable({ columns }) {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const { isPending, isError, error, data } = useSessions(pagination);

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
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-3 gap-2">
        <Card className="py-2">
          <CardContent className="grid grid-cols-2 grid-rows-2 px-2">
            <ClockIcon />
            <span className="text-xl font-bold self-end text-right">
              {data?.hoursFocused}
            </span>
            <span className="col-span-2 self-end text-right">
              Hours Focused
            </span>
          </CardContent>
        </Card>
        <Card className="py-2">
          <CardContent className="grid grid-cols-2 grid-rows-2 px-2">
            <CalendarIcon />
            <span className="text-xl font-bold self-end text-right">
              {data?.daysAccessed}
            </span>
            <span className="col-span-2 self-end text-right">
              Days Accessed
            </span>
          </CardContent>
        </Card>
        <Card className="py-2">
          <CardContent className="grid grid-cols-2 grid-rows-2 px-2">
            <FlameIcon />
            <span className="text-xl font-bold self-end text-right">
              {data?.streakDays}
            </span>
            <span className="col-span-2 self-end text-right">Streak Days</span>
          </CardContent>
        </Card>
      </div>
      <div className="border rounded-lg">
        {isPending ? (
          <div className="flex w-full max-w-sm flex-col gap-2 p-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <div className="flex gap-4" key={index}>
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
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
      </div>

      <div className="flex items-center justify-center  gap-2">
        <Button
          onClick={() => table.firstPage()}
          disabled={!table.getCanPreviousPage()}
        >
          <ChevronsLeftIcon />
        </Button>
        <Button
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          <ChevronLeftIcon />
        </Button>
        <span>
          {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount().toLocaleString()}
        </span>
        <Button
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          <ChevronRightIcon />
        </Button>
        <Button
          onClick={() => table.lastPage()}
          disabled={!table.getCanNextPage()}
        >
          <ChevronsRightIcon />
        </Button>
      </div>
    </div>
  );
}

const Header = () => {
  const token: string | null = localStorage.getItem("token");
  const [open, setOpen] = useState(false);
  const [openAccount, setOpenAccount] = useState(false);
  const [openEmail, setOpenEmail] = useState(false);
  const [openVerifyEmail, setOpenVerifyEmail] = useState(false);
  const { user } = useAuth();
  const { setOpenPlanDialog } = usePlanDialog();
  const qc = useQueryClient();
  const navigate = useNavigate();

  const form = useForm({
    resolver: zodResolver(username),
    defaultValues: {
      name: "",
    },
    mode: "onChange",
  });

  const formEmail = useForm({
    resolver: zodResolver(useremail),
    defaultValues: {
      email: "",
    },
  });

  const formOTP = useForm({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  });

  const submitOTP = useMutation({
    mutationFn: async (data: OTPInput) => {
      const response = await api.post("/auth/user-otp-verify", data);

      return response.data;
    },
    onSuccess: (data) => {
      const token = data.token;
      localStorage.setItem("token", token);
      qc.invalidateQueries({
        queryKey: ["user"],
      });
      toast.success("Email has been successfully changed");
    },
    onError: () => {
      toast.error("OTP invalid or exipred.");
    },
  });

  const onSubmitOTP = (data: OTPInput) => {
    submitOTP.mutate(data);
    setOpenVerifyEmail(false);
    setOpenEmail(false);
    setOpenAccount(false);
  };

  const updateEmail = useMutation({
    mutationFn: async (data: UserEmailInput) => {
      const response = await api.post("/auth/user-email", data);
      return response.status;
    },
    onSuccess: () => {
      setOpenVerifyEmail(true);
    },
  });

  const onSubmitEmail = (data: UserEmailInput) => {
    updateEmail.mutate(data);
  };

  const update = useMutation({
    mutationFn: async (data: UserNameInput) => {
      const response = await api.patch("/auth/user", data);
      return response.status;
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["user"],
      });
      toast.success("User's name updated successfully.");
    },
  });

  const onSubmit = (data: UserNameInput) => {
    update.mutate(data);
  };

  const handleLogout = async () => {
    try {
      const response = await api.post(
        "/auth/logout",
        {},
        {
          withCredentials: true,
        },
      );

      toast.success(response.data.message);
    } catch (error) {
      handleError(error);
    } finally {
      localStorage.setItem("token", "");
      localStorage.setItem("user", "");

      navigate("/signin");
    }
  };

  return (
    <div className="flex items-center justify-between">
      <h2 className="flex items-center gap-x-2">
        <span>
          <ClockCheck />
        </span>
        Pomodoro
      </h2>

      <div className="flex items-center gap-2">
        <Button onClick={() => setOpen(true)} size="sm">
          <ChartColumn />
          <span className="hidden sm:inline">Reprot</span>
        </Button>

        <Settings />

        {token ? (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Avatar>
                <AvatarImage src={user?.avatarUrl} />
                <AvatarFallback>{user?.name[0] || "CN"}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={() => {
                    setOpenAccount(true);
                    form.setValue("name", user?.name || "");
                  }}
                >
                  <UserCircleIcon />
                  Account
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setOpenPlanDialog(true)}>
                  <CrownIcon />
                  Premium
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleLogout()}>
                  <LogOut />
                  Logout
                </DropdownMenuItem>
                {/* <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive">
                  <Trash2Icon />
                  Delete Account
                </DropdownMenuItem> */}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <>
            <Link to="/signin" className={buttonVariants({ size: "sm" })}>
              <CircleUserIcon />
              <span className="hidden sm:inline">Sign In</span>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm">
                  <EllipsisVerticalIcon />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-36">
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link to="/signin">
                      <LogOut />
                      Sign In
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setOpenPlanDialog(true)}>
                    <CrownIcon />
                    Premium
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}
      </div>

      <Dialog open={open} onOpenChange={(open) => setOpen(open)}>
        <DialogContent className="overflow-auto max-h-11/12 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ChartColumnIcon />
              Pomodoro Report
            </DialogTitle>
          </DialogHeader>

          <DataTable columns={columns} />
        </DialogContent>
      </Dialog>

      <Dialog
        open={openAccount}
        onOpenChange={(open) => {
          setOpenAccount(open);
          form.reset();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Account</DialogTitle>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid grid-cols-[max-content_2fr] gap-2 items-center mb-2">
              <Avatar size="lg" className="sm:size-16!">
                <AvatarImage src={user?.avatarUrl} />
                <AvatarFallback className="sm:text-2xl">
                  {user?.name[0] || "CN"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-2">
                <Controller
                  name="name"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <Input
                        {...field}
                        type="text"
                        aria-disabled={fieldState.invalid}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <div className="flex gap-1 items-center">
                  <p>{user?.email}</p>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setOpenEmail(true)}
                  >
                    <SquarePenIcon />
                  </Button>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="submit">Save</Button>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Close
                </Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={openEmail}
        onOpenChange={(open) => {
          setOpenEmail(open);
          formEmail.reset();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Email</DialogTitle>
          </DialogHeader>

          <form onSubmit={formEmail.handleSubmit(onSubmitEmail)}>
            <div className="mb-2">
              <Controller
                name="email"
                control={formEmail.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="email">
                      Please input the new email address
                    </FieldLabel>
                    <Input
                      {...field}
                      type="email"
                      placeholder="example@email.com"
                      aria-invalid={fieldState.invalid}
                      id="email"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="submit">Save</Button>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Close
                </Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={openVerifyEmail}
        onOpenChange={(open) => {
          setOpenVerifyEmail(open);
          formOTP.reset();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Email</DialogTitle>
          </DialogHeader>

          <form onSubmit={formOTP.handleSubmit(onSubmitOTP)}>
            <div className="mb-2">
              <Controller
                name="otp"
                control={formOTP.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="otp">
                      We have sent the 6 digit code to your new email. Please
                      paste the code here.
                    </FieldLabel>
                    <Input
                      {...field}
                      type="otp"
                      placeholder="6 digit code"
                      aria-invalid={fieldState.invalid}
                      id="otp"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="submit">Save</Button>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Close
                </Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Header;
