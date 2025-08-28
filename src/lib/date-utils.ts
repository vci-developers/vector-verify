export function formatDate(timestamp: number) {
  const date = new Date(timestamp);

  // Create an object with all possible date formats/components
  return {
    // Combined formats
    monthYear: date.toLocaleString("default", {
      month: "long",
      year: "numeric",
    }),
    shortMonthYear: date.toLocaleString("default", {
      month: "short",
      year: "numeric",
    }),
    fullDate: date.toLocaleDateString(),
    fullDateTime: date.toLocaleString(),

    // Individual components
    month: date.toLocaleString("default", { month: "long" }),
    shortMonth: date.toLocaleString("default", { month: "short" }),
    numericMonth: date.getMonth() + 1,
    year: date.getFullYear(),
    day: date.getDate(),
    weekday: date.toLocaleString("default", { weekday: "long" }),
    shortWeekday: date.toLocaleString("default", { weekday: "short" }),

    // Time components
    time: date.toLocaleTimeString(),
    hours: date.getHours(),
    minutes: date.getMinutes(),
    seconds: date.getSeconds(),

    // Original date object for further manipulation
    dateObject: date,
  };
}
