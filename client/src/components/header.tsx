import {
  Bell,
  ChartColumn,
  Check,
  Clock,
  ClockCheck,
  Info,
  Palette,
  Settings as SettingsIcon,
  Volume2,
} from "lucide-react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  // SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Switch } from "./ui/switch";
import { Separator } from "./ui/separator";
import * as z from "zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ALARM_SOUND_KEYS,
  COLOR_KEYS,
  colors,
  FOCUS_SOUND_KEYS,
  settingsDefaultValues,
  settingsSchema,
  Sounds,
  TABS,
  type Settings,
} from "@/consts/consts";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "./ui/field";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useSound } from "@/hooks/useSound";
import { useContext, useState } from "react";
import { Slider } from "./ui/slider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { SettingsContext } from "@/context/SettingsContext";

const PopOverComp = ({ text }) => (
  <Popover>
    <PopoverTrigger asChild>
      <Button variant="ghost">
        <Info />
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-60">
      <p className="text-xs">{text}</p>
    </PopoverContent>
  </Popover>
);

const Header = () => {
  const { settings, updateSettings } = useContext(SettingsContext);

  const form = useForm<Settings>({
    resolver: zodResolver(settingsSchema),
    defaultValues: settings,
    mode: "all",
  });

  const [alarm, focus, alarmVolume, focusVolume] = useWatch({
    control: form.control,
    name: [
      "alarm_sound",
      "focus_sound",
      "alarm_sound_volume",
      "focus_sound_volume",
    ],
  });

  const { changeSoundAndVolume, setAudio } = useSound(
    Sounds.alarm[alarm].sound,
  );
  setAudio(Sounds.alarm[alarm].sound, 0, false, false);

  // console.log(audioRef);
  // const { changeSoundAndVolume, setAudio } = useSound(
  //   Sounds.focus[focus].sound,
  // );
  // setAudio(Sounds.focus[focus].sound, 0, false, false);

  const [prevAlarmSound, setPrevAlarmSound] = useState<string>(alarm);
  const [prevAlarmSoundVolume, setPrevAlarmSoundVolume] = useState<number>(0);
  const [prevFocusSound, setPrevFocusSound] = useState<string>(focus);
  const [prevFocusSoundVolume, setPrevFocusSoundVolume] = useState<number>(0);

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
          <SheetContent className=" overflow-y-scroll">
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

                <FieldSet>
                  <FieldLegend className="flex items-center gap-2 mb-2">
                    <Check size={20} />
                    Tasks
                  </FieldLegend>
                  <FieldGroup>
                    <Controller
                      name="auto_check_tasks"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field
                          data-invalid={fieldState.invalid}
                          orientation="horizontal"
                        >
                          <FieldLabel htmlFor="auto_check_tasks">
                            Auto Check Tasks
                            <PopOverComp
                              text={`If you enable "Auto Check Tasks", the active task will be automatically checked when the actual pomodoro count reaches the estimated count.`}
                            />
                          </FieldLabel>
                          <Switch
                            id="auto_check_tasks"
                            name={field.name}
                            aria-invalid={fieldState.invalid}
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </Field>
                      )}
                    />

                    <Controller
                      name="check_to_bottom"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field
                          data-invalid={fieldState.invalid}
                          orientation="horizontal"
                        >
                          <FieldLabel htmlFor="check_to_bottom">
                            Check To Bottom
                            <PopOverComp
                              text={`If you enable "Auto Switch Tasks", the checked task will be automatically moved to the bottom of the task list.`}
                            />
                          </FieldLabel>
                          <Switch
                            id="check_to_bottom"
                            name={field.name}
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            aria-invalid={fieldState.invalid}
                          />
                        </Field>
                      )}
                    />
                  </FieldGroup>
                </FieldSet>

                <Separator />

                <FieldSet>
                  <FieldLegend className="flex items-center gap-2 mb-2">
                    <Volume2 size={20} />
                    Sound
                  </FieldLegend>
                  <FieldGroup className="grid grid-cols-2 items-center">
                    <Controller
                      name="alarm_sound"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field
                          data-invalid={fieldState.invalid}
                          orientation="horizontal"
                          className="col-start-1 col-end-3"
                        >
                          <FieldLabel htmlFor="alarm_sound">
                            Alarm Sound
                          </FieldLabel>
                          <Select
                            name={field.name}
                            value={field.value}
                            onValueChange={(e) => {
                              field.onChange(e);
                              changeSoundAndVolume(
                                Sounds.alarm[e].sound,
                                prevAlarmSoundVolume,
                                true,
                                false,
                              );
                              setPrevAlarmSound(e);
                            }}
                          >
                            <SelectTrigger aria-invalid={fieldState.invalid}>
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent position="item-aligned">
                              <SelectGroup>
                                {ALARM_SOUND_KEYS.map((key) => (
                                  <SelectItem value={key} key={key}>
                                    {Sounds.alarm[key].key}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </Field>
                      )}
                    />

                    <Controller
                      name="alarm_sound_volume"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field
                          data-invalid={fieldState.invalid}
                          orientation="horizontal"
                          className="col-start-2 col-end-3"
                        >
                          <FieldLabel>{alarmVolume}</FieldLabel>
                          <Slider
                            max={100}
                            min={0}
                            value={[field.value]}
                            onValueChange={(e) => {
                              field.onChange(e[0]);
                              changeSoundAndVolume(
                                prevAlarmSound,
                                e[0],
                                false,
                                true,
                              );
                              setPrevAlarmSoundVolume(e[0]);
                            }}
                            step={1}
                          />
                        </Field>
                      )}
                    />

                    <Controller
                      name="alarm_sound_repeat"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field
                          data-invalid={fieldState.invalid}
                          orientation="horizontal"
                          className="col-start-2 col-end-3"
                        >
                          <FieldLabel htmlFor="alarm_sound_repeat">
                            repeat
                          </FieldLabel>
                          <Input
                            {...field}
                            id="alarm_sound_repeat"
                            aria-invalid={fieldState.invalid}
                            type="number"
                            className="w-12"
                          />
                        </Field>
                      )}
                    />

                    <Controller
                      name="focus_sound"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field
                          className="col-start-1 col-end-3"
                          orientation="horizontal"
                          data-invalid={fieldState.invalid}
                        >
                          <FieldLabel htmlFor="focus_sound">
                            Focus Sound
                          </FieldLabel>
                          <Select
                            name={field.name}
                            value={field.value}
                            onValueChange={(e) => {
                              field.onChange(e);
                              changeSoundAndVolume(
                                Sounds.focus[e].sound,
                                prevFocusSoundVolume,
                                true,
                                false,
                              );
                              setPrevFocusSound(e);
                            }}
                          >
                            <SelectTrigger aria-invalid={fieldState.invalid}>
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent position="item-aligned">
                              {FOCUS_SOUND_KEYS.map((key) => (
                                <SelectItem key={key} value={key}>
                                  {Sounds.focus[key].key}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </Field>
                      )}
                    />

                    <Controller
                      name="focus_sound_volume"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field
                          data-invalid={fieldState.invalid}
                          className="col-start-2 col-end-3"
                          orientation="horizontal"
                        >
                          <FieldLabel>{focusVolume}</FieldLabel>
                          <Slider
                            name="focust_sound_volume"
                            value={[field.value]}
                            onValueChange={(e) => {
                              field.onChange(e[0]);
                              changeSoundAndVolume(
                                prevFocusSound,
                                e[0],
                                false,
                                true,
                              );
                              setPrevFocusSoundVolume(e[0]);
                            }}
                            max={100}
                            min={0}
                            aria-invalid={fieldState.invalid}
                          />
                        </Field>
                      )}
                    />
                  </FieldGroup>
                </FieldSet>

                <Separator />

                <FieldSet>
                  <FieldLegend className="flex items-center gap-2 mb-2">
                    <Palette size={20} />
                    Theme
                  </FieldLegend>
                  <FieldGroup>
                    <Controller
                      name="pomodoro_theme"
                      control={form.control}
                      render={({ field, fieldState }) => {
                        return (
                          <Field
                            data-invalid={fieldState.invalid}
                            orientation="horizontal"
                          >
                            <FieldLabel>Pomodoro Theme</FieldLabel>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  style={{
                                    background: colors[field.value],
                                  }}
                                  className="w-24"
                                ></Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent className="overflow-x-visible ">
                                <DropdownMenuRadioGroup
                                  value={field.value}
                                  onValueChange={field.onChange}
                                  className="grid grid-cols-4 gap-2 w-48"
                                >
                                  {COLOR_KEYS.map((color) => (
                                    <DropdownMenuRadioItem
                                      key={color}
                                      value={color}
                                      style={{
                                        background: colors[color],
                                      }}
                                    >
                                      &nbsp;
                                    </DropdownMenuRadioItem>
                                  ))}
                                </DropdownMenuRadioGroup>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </Field>
                        );
                      }}
                    />

                    <Controller
                      name="short_break_theme"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field
                          data-invalid={fieldState.invalid}
                          orientation="horizontal"
                        >
                          <FieldLabel>Short Break Theme</FieldLabel>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                style={{
                                  background: colors[field.value],
                                }}
                                className="w-24"
                              ></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuRadioGroup
                                value={field.value}
                                onValueChange={field.onChange}
                                className="grid grid-cols-4 gap-2 w-48"
                              >
                                {COLOR_KEYS.map((color) => (
                                  <DropdownMenuRadioItem
                                    key={color}
                                    value={color}
                                    style={{
                                      background: colors[color],
                                    }}
                                  >
                                    &nbsp;
                                  </DropdownMenuRadioItem>
                                ))}
                              </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </Field>
                      )}
                    />

                    <Controller
                      name="long_break_theme"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field
                          data-invalid={fieldState.invalid}
                          orientation="horizontal"
                        >
                          <FieldLabel>Long Break Theme</FieldLabel>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                style={{
                                  background: colors[field.value],
                                }}
                                className="w-24"
                              ></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuRadioGroup
                                value={field.value}
                                onValueChange={field.onChange}
                                className="grid grid-cols-4 gap-2 w-48"
                              >
                                {COLOR_KEYS.map((color) => (
                                  <DropdownMenuRadioItem
                                    key={color}
                                    value={color}
                                    style={{
                                      background: colors[color],
                                    }}
                                  >
                                    &nbsp;
                                  </DropdownMenuRadioItem>
                                ))}
                              </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </Field>
                      )}
                    />

                    <Controller
                      name="hour_format"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field
                          data-invalid={fieldState.invalid}
                          orientation="horizontal"
                        >
                          <FieldLabel htmlFor="hour_format">
                            Hour Format
                          </FieldLabel>
                          <Select
                            name={field.name}
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger aria-invalid={fieldState.invalid}>
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent position="item-aligned">
                              <SelectItem value="24hr">24hr</SelectItem>
                              <SelectItem value="12hr">12hr</SelectItem>
                            </SelectContent>
                          </Select>
                        </Field>
                      )}
                    />

                    <Controller
                      name="dark_mode_when_running"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field
                          data-invalid={fieldState.invalid}
                          orientation="horizontal"
                        >
                          <FieldLabel>Dark Mode when running</FieldLabel>
                          <Switch
                            aria-invalid={fieldState.invalid}
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </Field>
                      )}
                    />
                  </FieldGroup>
                </FieldSet>

                <Separator />

                <FieldSet>
                  <FieldLegend className="flex items-center gap-2 mb-2">
                    <Bell size={20} />
                    Notification
                  </FieldLegend>

                  <FieldSet>
                    <div className="grid grid-cols-2 items-center">
                      <FieldLegend>Reminder</FieldLegend>
                      <FieldGroup className="flex flex-row gap-2">
                        <Controller
                          name="reminder_type"
                          control={form.control}
                          render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                              <Select
                                name={field.name}
                                value={field.value}
                                onValueChange={field.onChange}
                              >
                                <SelectTrigger
                                  aria-invalid={fieldState.invalid}
                                >
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent position="item-aligned">
                                  <SelectItem value="Every">Every</SelectItem>
                                  <SelectItem value="Last">Last</SelectItem>
                                </SelectContent>
                              </Select>
                            </Field>
                          )}
                        />

                        <Controller
                          name="reminder_time"
                          control={form.control}
                          render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                              <Input
                                {...field}
                                aria-invalid={fieldState.invalid}
                                type="number"
                              />
                            </Field>
                          )}
                        />

                        <p>min</p>
                      </FieldGroup>
                    </div>
                  </FieldSet>
                </FieldSet>

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
