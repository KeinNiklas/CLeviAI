"use client";

import * as React from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

// Context to share state between components
const SelectContext = React.createContext<{
    value: string;
    onChange: (value: string) => void;
    open: boolean;
    setOpen: (open: boolean) => void;
} | null>(null);

interface SelectProps {
    value: string;
    onValueChange: (value: string) => void;
    children: React.ReactNode;
}

export function Select({ value, onValueChange, children }: SelectProps) {
    const [open, setOpen] = React.useState(false);
    return (
        <SelectContext.Provider value={{ value, onChange: onValueChange, open, setOpen }}>
            <div className="relative inline-block w-full text-left">
                {children}
            </div>
        </SelectContext.Provider>
    );
}

export function SelectTrigger({ children, className }: { children: React.ReactNode; className?: string }) {
    const ctx = React.useContext(SelectContext);
    if (!ctx) throw new Error("SelectTrigger must be used within Select");

    return (
        <button
            type="button"
            className={cn(
                "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                className
            )}
            onClick={() => ctx.setOpen(!ctx.open)}
        >
            {children}
            <ChevronDown className="h-4 w-4 opacity-50" />
        </button>
    );
}

export function SelectValue({ placeholder }: { placeholder?: string }) {
    const ctx = React.useContext(SelectContext);
    if (!ctx) throw new Error("SelectValue must be used within Select");

    // We can't easily render the "label" of the selected item here without more complex context or traversing children.
    // For a simple implementation, we might just render the value, OR we rely on the parent logic.
    // However, typical Select implementations map value -> label.
    // To keep this simple and "shadcn-like" without Radix, we can just display the value or a custom label passed as children? 
    // No, standard `SelectValue` tries to find the text of the selected item.
    // Let's rely on a simplified approach: The user usually sees the `SelectValue` updated by the library.
    // For this lightweight version, let's just render the value if no child logic is simple.
    // BETTER: The user implementation often has static mapping, but let's just render the value for now, or assume the parent will handle it if needed.
    // WAIT: The code I wrote behaves like Radix.

    return <span className="block truncate">{placeholder || ctx.value || "Select..."}</span>;
}

export function SelectContent({ children, className }: { children: React.ReactNode; className?: string }) {
    const ctx = React.useContext(SelectContext);
    if (!ctx) throw new Error("SelectContent must be used within Select");

    if (!ctx.open) return null;

    return (
        <div className={cn(
            "absolute z-50 mt-2 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-80",
            className
        )}>
            <div className="p-1 max-h-[var(--radix-select-content-available-height)] w-full overflow-auto">
                {children}
            </div>
        </div>
    );
}

interface SelectItemProps {
    value: string;
    children: React.ReactNode;
    className?: string;
}

export function SelectItem({ value, children, className }: SelectItemProps) {
    const ctx = React.useContext(SelectContext);
    if (!ctx) throw new Error("SelectItem must be used within Select");

    const isSelected = ctx.value === value;

    return (
        <div
            className={cn(
                "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-accent hover:text-accent-foreground cursor-pointer",
                className
            )}
            onClick={() => {
                ctx.onChange(value);
                ctx.setOpen(false);
            }}
        >
            <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                {isSelected && <Check className="h-4 w-4" />}
            </span>
            <span className="truncate">{children}</span>
        </div>
    );
}
