import {
  ChartColumn,
  Clock,
  ClockCheck,
  Settings as SettingsIcon,
} from "lucide-react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Switch } from "./ui/switch";
import { Separator } from "./ui/separator";
import * as z from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TABS } from "@/consts/consts";
import { Field, FieldError, FieldGroup, FieldLabel } from "./ui/field";

const settingsSchema = z.object({
  pomodoro_time: z.coerce.number(),
  short_break_time: z.coerce.number(),
  long_break_time: z.coerce.number(),
  auto_start_breaks: z.boolean(),
  auto_start_pomodoro: z.boolean(),
  long_break_interval: z.number(),
  auto_check_tasks: z.boolean(),
  check_to_bottomL: z.boolean(),
  alarm_sound_volumn: z.number().min(0).max(100),
  alarm_sound_repeat: z.number(),
  focus_sound_volumn: z.number().min(0).max(0),
  pomodoro_theme: z.string(),
  short_break_theme: z.string(),
  long_break_theme: z.string(),
  hour_format: z.enum(["24hr", "12hr"]),
  dark_mode_when_running: z.boolean(),
  notification_reminder_type: z.enum(["Every", "Last"]),
  notification_reminder_time: z.number().min(0),
});

type Settings = z.infer<typeof settingsSchema>;

const SettingSection = ({ icon, title, children }) => {
  const Icon = icon;
  return (
    <section className="flex flex-col px-4 gap-6">
      <h3 className="flex items-center  gap-2">
        <Icon size={16} />
        {title}
      </h3>

      {children}

      <Separator />
    </section>
  );
};

const Header = () => {
  const form = useForm<Settings>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      pomodoro_time: TABS.Pomodoro.timer,
      short_break_time: TABS.Short_Break.timer,
      long_break_time: TABS.Long_Break.timer,
      auto_start_breaks: false,
      auto_start_pomodoro: false,
      long_break_interval: 4,
    },
    mode: "all",
  });

  function onSubmit(data: Settings) {
    // Do something with the form values.
    console.log(data);
  }

  return (
    <div className="flex items-center justify-between">
      <h2 className="flex items-center gap-x-2">
        <span>
          <ClockCheck />
        </span>
        Pomodoro
      </h2>

      <div className="flex items-center gap-4">
        <Button>
          <ChartColumn />
          Reprot
        </Button>

        <Sheet>
          <SheetTrigger asChild>
            <Button>
              <SettingsIcon />
              Settings
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Settings</SheetTitle>
              <SheetDescription>
                Make changes to your profile here. Click save when you&apos;re
                done.
              </SheetDescription>
            </SheetHeader>
            {/* <div className="grid flex-1 auto-rows-min gap-6 px-4">
              <div className="grid gap-3">
                <Label htmlFor="sheet-demo-name">Name</Label>
                <Input id="sheet-demo-name" defaultValue="Pedro Duarte" />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="sheet-demo-username">Username</Label>
                <Input id="sheet-demo-username" defaultValue="@peduarte" />
              </div>
            </div> */}

            <form id="settings-form" onSubmit={form.handleSubmit(onSubmit)}>
              <SettingSection title="Timer" icon={Clock}>
                <div className="flex flex-col gap-6">
                  <h4>Timer (minutes)</h4>
                  <FieldGroup className="grid grid-cols-3 gap-2 items-center justify-center">
                    <Controller
                      name="pomodoro_time"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-inavlid={fieldState.invalid}>
                          <FieldLabel htmlFor="pomodoro-time">
                            Pomodoro
                          </FieldLabel>
                          <Input
                            {...field}
                            id="pomodoro-time"
                            aria-invalid={fieldState.invalid}
                            type="number"
                          />
                          {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </Field>
                      )}
                    />
                    <Controller
                      name="short_break_time"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-inavlid={fieldState.invalid}>
                          <FieldLabel htmlFor="short_break_time">
                            Short Break
                          </FieldLabel>
                          <Input
                            {...field}
                            id="short_break_time"
                            aria-invalid={fieldState.invalid}
                            type="number"
                          />
                          {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </Field>
                      )}
                    />
                    <Controller
                      name="long_break_time"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor="long_break_time">
                            Long Break
                          </FieldLabel>
                          <Input
                            {...field}
                            aria-invalid={fieldState.invalid}
                            id="long_break_time"
                            type="number"
                          />
                          {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </Field>
                      )}
                    />
                  </FieldGroup>

                  {/* <div className="flex justify-between items-center gap-6">
                    <Label htmlFor="auto-start-breaks" className="flex-1">
                      Auto Start Breaks
                    </Label>
                    <Switch id="auto-start-breaks" />
                  </div>
                  <div className="flex justify-between items-center gap-6">
                    <Label htmlFor="auto-start-pomodoro" className="flex-1">
                      Auto Start Pomodoro
                    </Label>
                    <Switch id="auto-start-pomodoro" />
                  </div>
                  <div className="flex justify-between items-center gap-6">
                    <Label
                      htmlFor="long-break-interval"
                      className="text-nowrap flex-1"
                    >
                      Long Break Interval
                    </Label>
                    <Input type="number" min={1} id="long-break-interval" />
                  </div> */}
                </div>
              </SettingSection>
              <Button type="submit">Save changes</Button>
              <SheetClose asChild>
                <Button variant="outline">Close</Button>
              </SheetClose>
            </form>
            {/* <SheetFooter>
              <Button type="submit">Save changes</Button>
              <SheetClose asChild>
                <Button variant="outline">Close</Button>
              </SheetClose>
            </SheetFooter> */}
          </SheetContent>
        </Sheet>

        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
};

export default Header;
