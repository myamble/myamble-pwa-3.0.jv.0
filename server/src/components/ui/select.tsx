import * as React from "react";
import { ChevronDown } from "lucide-react";

const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => {
  return (
    <div className="relative">
      <select
        className={`block w-full appearance-none rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm ${className}`}
        ref={ref}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
    </div>
  );
});
Select.displayName = "Select";

const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => (
  <button
    ref={ref}
    className={`flex items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 ${className}`}
    {...props}
  >
    {children}
    <ChevronDown className="ml-2 h-4 w-4" />
  </button>
));
SelectTrigger.displayName = "SelectTrigger";

const SelectContent = ({ children }: { children: React.ReactNode }) => (
  <div className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
    {children}
  </div>
);

const SelectItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={`relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900 hover:bg-indigo-600 hover:text-white ${className}`}
    {...props}
  >
    {children}
  </div>
));
SelectItem.displayName = "SelectItem";

const SelectValue = ({ children }: { children: React.ReactNode }) => (
  <span className="block truncate">{children}</span>
);

export { Select, SelectTrigger, SelectContent, SelectItem, SelectValue };
