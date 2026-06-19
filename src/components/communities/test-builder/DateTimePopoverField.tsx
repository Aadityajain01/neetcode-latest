"use client";
import { Clock3, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  getCurrentDefaultTime,
  formatDateTimeLabel,
  formatTimeValue,
  getDateFromValue,
  toDateTimeLocalValue,
} from "./helpers";

export function DateTimePopoverField({
  label,
  value,
  onChange,
  minDate,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  minDate?: Date;
}) {
  const selectedDate = getDateFromValue(value);
  const currentDefault = getCurrentDefaultTime();
  const [defaultHours, defaultMinutes] = currentDefault.split(":");

  const handleDateSelect = (nextDate?: Date) => {
    if (!nextDate) return;

    const baseDate = selectedDate ?? new Date();
    const merged = new Date(nextDate);
    merged.setHours(baseDate.getHours(), baseDate.getMinutes(), 0, 0);
    onChange(toDateTimeLocalValue(merged));
  };

  const handleTimeChange = (nextTime: string) => {
    const baseDate = selectedDate ?? new Date();
    const [hours, minutes] = nextTime.split(":").map(Number);
    const merged = new Date(baseDate);
    merged.setHours(hours || 0, minutes || 0, 0, 0);
    onChange(toDateTimeLocalValue(merged));
  };

  return (
    <div className="space-y-1 min-w-0">
      <Label className="text-xs text-zinc-400 ml-1">{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="h-8 w-full justify-start rounded-md border-zinc-800 bg-zinc-950 px-3 text-left text-zinc-200 hover:bg-zinc-900 min-w-0"
          >
            <CalendarDays className="mr-2 h-4 w-4 text-primary shrink-0" />
            <span className={cn(!value && "text-zinc-400", "text-sm font-normal truncate")}>
              {formatDateTimeLabel(value, label)}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          sideOffset={8}
          className="w-[320px] rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-zinc-200 shadow-xl"
        >
          <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-2">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              disabled={minDate ? { before: minDate } : undefined}
              className="w-full"
              classNames={{
                months: "w-full",
                month: "w-full",
                table: "w-full border-collapse",
                head_row: "grid grid-cols-7",
                row: "grid grid-cols-7 mt-1",
                head_cell: "text-zinc-400 text-[11px] font-medium",
                day: "flex items-center justify-center",
                day_button:
                  "h-9 w-9 rounded-md text-zinc-200 hover:bg-zinc-900 hover:text-zinc-100 aria-selected:bg-brand-500 aria-selected:text-white",
                caption_label: "text-zinc-200",
                button_previous: "text-zinc-300 hover:text-zinc-100",
                button_next: "text-zinc-300 hover:text-zinc-100",
              }}
            />
          </div>

          <div className="mt-3 rounded-lg border border-zinc-800 bg-zinc-950 p-3">
            <Label className="mb-2 flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-zinc-400">
              <Clock3 className="h-3.5 w-3.5" />
              Time
            </Label>
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
              <Select
                value={selectedDate ? formatTimeValue(selectedDate).split(":")[0] : defaultHours}
                onValueChange={(hours) => {
                  const currentMins = selectedDate ? formatTimeValue(selectedDate).split(":")[1] : defaultMinutes;
                  handleTimeChange(`${hours}:${currentMins}`);
                }}
              >
                <SelectTrigger className="w-full bg-zinc-950 border-zinc-800 text-zinc-200">
                  <SelectValue placeholder="HH" />
                </SelectTrigger>
                <SelectContent className="max-h-56 bg-zinc-950 border-zinc-800 text-zinc-200">
                  {Array.from({ length: 24 }).map((_, i) => {
                    const h = i.toString().padStart(2, "0");
                    return <SelectItem className="focus:bg-zinc-900 focus:text-zinc-100" key={h} value={h}>{h}</SelectItem>;
                  })}
                </SelectContent>
              </Select>
              <span className="text-zinc-500 text-sm">:</span>
              <Select
                value={selectedDate ? formatTimeValue(selectedDate).split(":")[1] : defaultMinutes}
                onValueChange={(minutes) => {
                  const currentHours = selectedDate ? formatTimeValue(selectedDate).split(":")[0] : defaultHours;
                  handleTimeChange(`${currentHours}:${minutes}`);
                }}
              >
                <SelectTrigger className="w-full bg-zinc-950 border-zinc-800 text-zinc-200">
                  <SelectValue placeholder="MM" />
                </SelectTrigger>
                <SelectContent className="max-h-56 bg-zinc-950 border-zinc-800 text-zinc-200">
                  {["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"].map((m) => (
                    <SelectItem className="focus:bg-zinc-900 focus:text-zinc-100" key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}


