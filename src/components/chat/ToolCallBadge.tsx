"use client";

import { ToolInvocation } from "ai";
import { Loader2 } from "lucide-react";

function basename(filePath: string): string {
  return filePath.split("/").filter(Boolean).at(-1) ?? filePath;
}

function getLabels(
  toolName: string,
  args: Record<string, unknown>
): { progress: string; done: string } {
  const command = typeof args.command === "string" ? args.command : undefined;
  const file = typeof args.path === "string" ? basename(args.path) : "";

  if (toolName === "str_replace_editor") {
    switch (command) {
      case "create":
        return { progress: `Creating ${file}`, done: `Created ${file}` };
      case "str_replace":
      case "insert":
        return { progress: `Editing ${file}`, done: `Edited ${file}` };
      case "view":
        return { progress: `Reading ${file}`, done: `Read ${file}` };
      case "undo_edit":
        return { progress: "Undoing edit", done: "Undid edit" };
    }
  }

  if (toolName === "file_manager") {
    switch (command) {
      case "delete":
        return { progress: `Deleting ${file}`, done: `Deleted ${file}` };
      case "rename":
        return { progress: `Renaming ${file}`, done: `Renamed ${file}` };
    }
  }

  return { progress: toolName, done: toolName };
}

interface ToolCallBadgeProps {
  toolInvocation: ToolInvocation;
}

export function ToolCallBadge({ toolInvocation }: ToolCallBadgeProps) {
  const isDone = toolInvocation.state === "result";
  const labels = getLabels(toolInvocation.toolName, toolInvocation.args ?? {});
  const label = isDone ? labels.done : labels.progress;

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200">
      {isDone ? (
        <>
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-neutral-700">{label}</span>
        </>
      ) : (
        <>
          <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
          <span className="text-neutral-700">{label}</span>
        </>
      )}
    </div>
  );
}
