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
import { ALARM_SOUND_KEYS, FOCUS_SOUND_KEYS, TABS } from "@/consts/consts";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "./ui/field";

const settingsSchema = z.object({
  pomodoro_time: z.coerce.number<number>(),
  short_break_time: z.coerce.number<number>(),
  long_break_time: z.coerce.number<number>(),
  auto_start_breaks: z.boolean(),
  auto_start_pomodoros: z.boolean(),
  long_break_interval: z.coerce.number<number>(),
  // auto_check_tasks: z.boolean(),
  // check_to_bottom: z.boolean(),
  // alarm_sound: z.enum(ALARM_SOUND_KEYS),
  // alarm_sound_volumn: z.number().min(0).max(100),
  // alarm_sound_repeat: z.number(),
  // focus_sound: z.enum(FOCUS_SOUND_KEYS),
  // focus_sound_volumn: z.number().min(0).max(100),
  // pomodoro_theme: z.string(),
  // short_break_theme: z.string(),
  // long_break_theme: z.string(),
  // hour_format: z.enum(["24hr", "12hr"]),
  // dark_mode_when_running: z.boolean(),
  // notification_reminder_type: z.enum(["Every", "Last"]),
  // notification_reminder_time: z.number().min(0),
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
      auto_start_pomodoros: false,
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

            <form id="settings-form" onSubmit={form.handleSubmit(onSubmit)}>
              <FieldGroup className="px-4">
                <FieldSet>
                  <FieldLegend className="flex items-center gap-2 mb-2">
                    <Clock size={20} />
                    Timer
                  </FieldLegend>
                  <div className="space-y-6">
                    <h4 className="mb-1">Timer (minutes)</h4>
                    <FieldGroup className="grid grid-cols-3">
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

                    <FieldGroup>
                      <Controller
                        name="auto_start_breaks"
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field
                            orientation="horizontal"
                            data-invalid={fieldState.invalid}
                          >
                            <FieldLabel htmlFor="auto_start_breaks">
                              Auto Start Breaks
                            </FieldLabel>
                            <Switch
                              id="auto_start_breaks"
                              name={field.name}
                              aria-invalid={fieldState.invalid}
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </Field>
                        )}
                      />

                      <Controller
                        name="auto_start_pomodoros"
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field
                            orientation="horizontal"
                            data-invalid={fieldState.invalid}
                          >
                            <FieldLabel htmlFor="auto_start_pomodoros">
                              Auto Start Pomodoros
                            </FieldLabel>
                            <Switch
                              id="auto_start_pomodoros"
                              name={field.name}
                              aria-invalid={fieldState.invalid}
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </Field>
                        )}
                      />

                      <Controller
                        name="long_break_interval"
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field
                            data-involid={fieldState.invalid}
                            orientation="horizontal"
                          >
                            <FieldLabel htmlFor="long_break_interval">
                              Long Break Interval
                            </FieldLabel>
                            <Input
                              {...field}
                              id="long_break_interval"
                              aria-invalid={fieldState.invalid}
                              className="w-12"
                              type="number"
                            />
                          </Field>
                        )}
                      />
                    </FieldGroup>
                  </div>
                </FieldSet>

                <Separator />

                <Field orientation="horizontal">
                  <Button type="submit">Save changes</Button>
                  <SheetClose asChild>
                    <Button variant="outline">Close</Button>
                  </SheetClose>
                </Field>
              </FieldGroup>
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
