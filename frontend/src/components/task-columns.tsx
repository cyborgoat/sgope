"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ArrowUpDown, Edit, MoreHorizontal, Trash2 } from "lucide-react"
import { Task } from "@/lib/api/tasks"

export function getTaskColumns(
  params: { onEdit: (task: Task) => void; onDelete: (task: Task) => void; onDetail: (task: Task) => void; }
): ColumnDef<Task>[] {
  const { onEdit, onDelete, onDetail } = params;
  return [
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => {
        const task = row.original;
        return (
          <span className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>{task.title}</span>
        );
      },
    },
    {
      accessorKey: "priority",
      header: "Priority",
      cell: ({ row }) => {
        const priority = row.getValue("priority") as string;
        const priorityColors = {
          high: "bg-red-100 text-red-800 border-red-300",
          medium: "bg-yellow-100 text-yellow-800 border-yellow-300",
          low: "bg-green-100 text-green-800 border-green-300",
        };
        return (
          <Badge className={priorityColors[priority as keyof typeof priorityColors] || "bg-gray-100 text-gray-800"}>{priority}</Badge>
        );
      },
    },
    {
      accessorKey: "due_date",
      header: "Due Date",
      cell: ({ row }) => {
        const dueDate = row.getValue("due_date") as string;
        if (!dueDate) return <span className="text-muted-foreground">—</span>;
        const date = new Date(dueDate);
        const now = new Date();
        const isOverdue = date < now && date.toDateString() !== now.toDateString();
        const isToday = date.toDateString() === now.toDateString();
        return (
          <span className={`text-sm ${isOverdue ? 'text-red-600 font-medium' : isToday ? 'text-orange-600 font-medium' : ''}`}>{date.toLocaleDateString()}</span>
        );
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const task = row.original;
        return (
          <div className="flex gap-1">
            <Button size="icon" variant="ghost" onClick={() => onDetail(task)} title="Details">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={() => onEdit(task)} title="Edit">
              <Edit className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={() => onDelete(task)} title="Delete">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];
}
