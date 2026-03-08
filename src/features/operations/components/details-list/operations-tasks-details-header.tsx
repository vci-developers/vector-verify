"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { format } from "date-fns";
import { X } from "lucide-react";
import type { DateRange } from "react-day-picker";

export type ViewValue = "village" | "house" | "";

interface OperationsTasksDetailsHeaderProps {
  activeView: ViewValue;
  onViewChange: (view: ViewValue) => void;
  district: string;
  totalItems: number;
  dateRange: DateRange | undefined;
  onDateRangeChange: (dateRange: DateRange | undefined) => void;
  onClearDateRange: () => void;
}

export default function OperationsTasksDetailsHeader({
  activeView,
  onViewChange,
  district,
  totalItems,
  dateRange,
  onDateRangeChange,
  onClearDateRange,
}: OperationsTasksDetailsHeaderProps) {
  const hasDateFilter = dateRange?.from || dateRange?.to;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold capitalize">{district}</h1>
        <div className="flex items-center gap-2">
          <p className="text-muted-foreground/70 text-sm">
            {totalItems} {activeView === "village" ? "villages" : "houses"}
          </p>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={hasDateFilter ? "default" : "outline"}
                className="gap-2"
              >
                {!dateRange?.from && !dateRange?.to
                  ? "Filter by date"
                  : `${dateRange.from ? format(dateRange.from, "dd MMMM yyyy") : "..."} - ${dateRange.to ? format(dateRange.to, "dd MMMM yyyy") : "..."}`}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="range"
                numberOfMonths={2}
                selected={dateRange}
                onSelect={onDateRangeChange}
                disabled={{ after: new Date() }}
                autoFocus
              />
            </PopoverContent>
          </Popover>
          {hasDateFilter && (
            <Button
              variant="outline"
              onClick={onClearDateRange}
              size="icon"
              className="text-muted-foreground hover:text-foreground h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          <Button variant="outline" size="lg" asChild>
            <Link href="/operations">Exit</Link>
          </Button>
        </div>
      </div>

      <Separator />

      <div className="flex items-center gap-2">
        <Select
          value={activeView || undefined}
          onValueChange={(value) => onViewChange(value as ViewValue)}
        >
          <SelectTrigger className="w-1/4">
            <SelectValue placeholder="Select view" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Location</SelectLabel>
              <SelectItem value="village">Village</SelectItem>
              <SelectItem value="house">House</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
