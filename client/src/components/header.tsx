import {
  ChartColumn,
  CheckCircleIcon,
  CircleUserIcon,
  ClockCheck,
  CrownIcon,
  KeyboardIcon,
  LogOut,
  MoreHorizontalIcon,
  RocketIcon,
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
import { useEffect, useState } from "react";
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
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { cx } from "class-variance-authority";

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
  const [openPremium, setOpenPremium] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{
    planId: string;
    billingType: "one_time" | "recurring";
  } | null>(null);

  const { data: plans } = useQuery({
    queryKey: ["plans"],
    queryFn: async () => {
      const response = await api.get("/plans");
      return response.data.data.plans;
    },
  });

  const loadScript = (src: string) => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };
  const onPayment = async (planId: string) => {
    // create order
    try {
      const options = {
        planId,
      };
      const res = await api.post("/payments/createOrder", options);
      const data = res.data;
      const paymentObject = new (window as any).Razorpay({
        key: import.meta.env.VITE_RAZORPAY_API_KEY,
        order_id: data.id,
        ...data,
        handler: function (response: any) {
          const options2 = {
            order_id: response.razorpay_order_id,
            payment_id: response.razorpay_payment_id,
            signature: response.razorpay_signature,
          };
          api
            .post("/payments/verifyPayment", options2)
            .then((res) => {
              console.log(res.data);
              if (res.status === 200) {
                alert("Payment Successful");
              } else {
                alert("Payment Failed");
              }
            })
            .catch((err) => {
              console.log(err);
            });
        },
      });
      paymentObject.open();
    } catch (error) {
      console.error(error);
    }
  };
  const onSubscription = async (planId: string) => {
    try {
      const { data } = await api.post("payments/createSubscription", {
        planId,
      });
      const options = {
        key: import.meta.env.VITE_RAZORPAY_API_KEY,
        subscription_id: data.subscriptionId,
        name: "Rahul Vishwakarma",
        description: "Monthly Test Plan",
        handler: function (response: any) {
          const options2 = {
            payment_id: response.razorpay_payment_id,
            subscription_id: response.razorpay_subscription_id,
            signature: response.razorpay_signature,
          };
          api.post("/payments/verifySubscription", options2).then((res) => {
            if (res.status === 200) {
              alert("Subscription Successful");
            } else {
              alert("Subscription Failed");
            }
          });
        },
        theme: {
          color: "#F37254",
        },
      };
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    loadScript("https://checkout.razorpay.com/v1/checkout.js");
  }, []);
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
                <DropdownMenuItem onClick={() => setOpenPremium(true)}>
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

      <Dialog open={openPremium} onOpenChange={(open) => setOpenPremium(open)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CrownIcon /> Premium
            </DialogTitle>
          </DialogHeader>

          <div>
            <h3>More abilities</h3>

            <div className="flex items-center gap-2">
              <CheckCircleIcon className="size-4" />
              Add Projects
            </div>
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="size-4" />
              Download Report
            </div>
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="size-4" />
              No ads
            </div>
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="size-4" />
              ... and all the future updates
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h3>Select Plan</h3>
            <div className="grid grid-cols-3 gap-6">
              {plans && plans.length > 0
                ? plans.map((plan) => (
                    <Button
                      key={plan.id}
                      className={cx(
                        "flex h-24 flex-col items-center justify-center gap-1",
                        selectedPlan?.planId === plan.id &&
                          "border-6 border-red-600",
                      )}
                      onClick={() =>
                        setSelectedPlan({
                          billingType: plan.billingType,
                          planId: plan.id,
                        })
                      }
                    >
                      <span className="text-xs uppercase">{plan.name}</span>
                      <span className="text-2xl">₹{plan.price}</span>
                      <span className="text-xs">/ {plan.interval}</span>
                    </Button>
                  ))
                : "No Plan Found."}
            </div>

            <Button
              className="w-full"
              onClick={() => {
                if (selectedPlan === null) {
                  alert("Kindly select a plan");
                  return;
                }

                if (selectedPlan.billingType === "one_time") {
                  onPayment(selectedPlan.planId);
                } else if (selectedPlan.billingType === "recurring") {
                  onSubscription(selectedPlan.planId);
                }
              }}
            >
              <RocketIcon />
              Purchase the plan
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Header;
