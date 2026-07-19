import { Input } from "@/components/ui/input";
import {
  Bell,
  Check,
  Clock,
  Info,
  Palette,
  Settings as SettingsIcon,
  Volume2,
} from "lucide-react";
import { Button } from "./ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Switch } from "./ui/switch";
import { Separator } from "./ui/separator";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ALARM_SOUND_KEYS,
  FOCUS_SOUND_KEYS,
  settingsSchema,
  Sounds,
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
import { useState } from "react";
import { Slider } from "./ui/slider";
import { useSettings } from "@/context/SettingsContext";

const SettingsComp = () => {
  const { settings, updateSettings } = useSettings();

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

  const { changeSoundAndVolume: chnageAlarm, setAudio: setAlarm } = useSound(
    Sounds.alarm[alarm].sound,
  );
  setAlarm(Sounds.alarm[alarm].sound, 0, false, false);

  const { changeSoundAndVolume: changeFocus, setAudio: setFocus } = useSound(
    Sounds.focus[focus].sound,
  );
  setFocus(Sounds.focus[focus].sound, 0, false, false);

  const [prevAlarmSound, setPrevAlarmSound] = useState<string>(alarm);
  const [prevAlarmSoundVolume, setPrevAlarmSoundVolume] = useState<number>(0);
  const [prevFocusSound, setPrevFocusSound] = useState<string>(focus);
  const [prevFocusSoundVolume, setPrevFocusSoundVolume] = useState<number>(0);

  function onSubmit(data: Settings) {
    updateSettings(data);
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="sm">
          <SettingsIcon />
          <span className="hidden sm:inline">Settings</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        className="overflow-y-auto"
        style={{
          scrollbarWidth: "none",
        }}
      >
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
          <SheetDescription>
            Chaning settings will refresh the page.
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
                    name="pomodoro_duration"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="pomodoro_duration">
                          Pomodoro
                        </FieldLabel>
                        <Input
                          {...field}
                          id="pomodoro_duration"
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
                    name="short_break_duration"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="short_break_duration">
                          Short Break
                        </FieldLabel>
                        <Input
                          {...field}
                          id="short_break_duration"
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
                    name="long_break_duration"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="long_break_duration">
                          Long Break
                        </FieldLabel>
                        <Input
                          {...field}
                          aria-invalid={fieldState.invalid}
                          id="long_break_duration"
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
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
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
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
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
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
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
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
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
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
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
                      <FieldLabel htmlFor="alarm_sound">Alarm Sound</FieldLabel>
                      <Select
                        name={field.name}
                        value={field.value}
                        onValueChange={(e) => {
                          field.onChange(e);
                          chnageAlarm(
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
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
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
                          chnageAlarm(prevAlarmSound, e[0], false, true);
                          setPrevAlarmSoundVolume(e[0]);
                        }}
                        step={1}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
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
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
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
                      <FieldLabel htmlFor="focus_sound">Focus Sound</FieldLabel>
                      <Select
                        name={field.name}
                        value={field.value}
                        onValueChange={(e) => {
                          field.onChange(e);
                          changeFocus(
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
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
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
                          changeFocus(prevFocusSound, e[0], false, true);
                          setPrevFocusSoundVolume(e[0]);
                        }}
                        max={100}
                        min={0}
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
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
                {/* <Controller
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
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
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
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
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
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                /> */}

                <Controller
                  name="hour_format"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field
                      data-invalid={fieldState.invalid}
                      orientation="horizontal"
                    >
                      <FieldLabel htmlFor="hour_format">Hour Format</FieldLabel>
                      <Select
                        name={field.name}
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger aria-invalid={fieldState.invalid}>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent position="item-aligned">
                          <SelectItem value="h24">24hr</SelectItem>
                          <SelectItem value="h12">12hr</SelectItem>
                        </SelectContent>
                      </Select>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                {/* <Controller
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
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                /> */}
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
                            <SelectTrigger aria-invalid={fieldState.invalid}>
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent position="item-aligned">
                              <SelectItem value="every">Every</SelectItem>
                              <SelectItem value="last">Last</SelectItem>
                            </SelectContent>
                          </Select>
                          {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                          )}
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
                          {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </Field>
                      )}
                    />

                    <p>min</p>
                  </FieldGroup>
                </div>
              </FieldSet>
            </FieldSet>

            <Field
              orientation="horizontal"
              className="mt-6 mb-4 flex justify-end items-center"
            >
              <Button type="submit">Save changes</Button>
              <SheetClose asChild>
                <Button variant="outline">Close</Button>
              </SheetClose>
            </Field>
          </FieldGroup>
        </form>
      </SheetContent>
    </Sheet>
  );
};

const PopOverComp = ({ text }: { text: string }) => (
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

export default SettingsComp;
