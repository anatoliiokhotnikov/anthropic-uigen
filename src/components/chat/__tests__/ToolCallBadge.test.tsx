import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolCallBadge } from "../ToolCallBadge";
import type { ToolInvocation } from "ai";

afterEach(() => {
  cleanup();
});

// str_replace_editor — create
test("shows 'Creating' label while in progress for create command", () => {
  const tool: ToolInvocation = {
    state: "call",
    toolCallId: "1",
    toolName: "str_replace_editor",
    args: { command: "create", path: "/components/Card.jsx" },
  };
  render(<ToolCallBadge toolInvocation={tool} />);
  expect(screen.getByText("Creating Card.jsx")).toBeDefined();
});

test("shows 'Created' label when done for create command", () => {
  const tool: ToolInvocation = {
    state: "result",
    toolCallId: "1",
    toolName: "str_replace_editor",
    args: { command: "create", path: "/components/Card.jsx" },
    result: "File created: /components/Card.jsx",
  };
  render(<ToolCallBadge toolInvocation={tool} />);
  expect(screen.getByText("Created Card.jsx")).toBeDefined();
});

// str_replace_editor — str_replace
test("shows 'Editing' label while in progress for str_replace command", () => {
  const tool: ToolInvocation = {
    state: "call",
    toolCallId: "2",
    toolName: "str_replace_editor",
    args: { command: "str_replace", path: "/App.jsx" },
  };
  render(<ToolCallBadge toolInvocation={tool} />);
  expect(screen.getByText("Editing App.jsx")).toBeDefined();
});

test("shows 'Edited' label when done for str_replace command", () => {
  const tool: ToolInvocation = {
    state: "result",
    toolCallId: "2",
    toolName: "str_replace_editor",
    args: { command: "str_replace", path: "/App.jsx" },
    result: "Replaced 1 occurrence(s)",
  };
  render(<ToolCallBadge toolInvocation={tool} />);
  expect(screen.getByText("Edited App.jsx")).toBeDefined();
});

// str_replace_editor — insert
test("shows 'Editing' label while in progress for insert command", () => {
  const tool: ToolInvocation = {
    state: "call",
    toolCallId: "3",
    toolName: "str_replace_editor",
    args: { command: "insert", path: "/App.jsx" },
  };
  render(<ToolCallBadge toolInvocation={tool} />);
  expect(screen.getByText("Editing App.jsx")).toBeDefined();
});

test("shows 'Edited' label when done for insert command", () => {
  const tool: ToolInvocation = {
    state: "result",
    toolCallId: "3",
    toolName: "str_replace_editor",
    args: { command: "insert", path: "/App.jsx" },
    result: "Inserted text at line 5",
  };
  render(<ToolCallBadge toolInvocation={tool} />);
  expect(screen.getByText("Edited App.jsx")).toBeDefined();
});

// str_replace_editor — view
test("shows 'Reading' label while in progress for view command", () => {
  const tool: ToolInvocation = {
    state: "call",
    toolCallId: "4",
    toolName: "str_replace_editor",
    args: { command: "view", path: "/App.jsx" },
  };
  render(<ToolCallBadge toolInvocation={tool} />);
  expect(screen.getByText("Reading App.jsx")).toBeDefined();
});

test("shows 'Read' label when done for view command", () => {
  const tool: ToolInvocation = {
    state: "result",
    toolCallId: "4",
    toolName: "str_replace_editor",
    args: { command: "view", path: "/App.jsx" },
    result: "file contents...",
  };
  render(<ToolCallBadge toolInvocation={tool} />);
  expect(screen.getByText("Read App.jsx")).toBeDefined();
});

// str_replace_editor — undo_edit
test("shows 'Undoing edit' while in progress for undo_edit command", () => {
  const tool: ToolInvocation = {
    state: "call",
    toolCallId: "5",
    toolName: "str_replace_editor",
    args: { command: "undo_edit", path: "/App.jsx" },
  };
  render(<ToolCallBadge toolInvocation={tool} />);
  expect(screen.getByText("Undoing edit")).toBeDefined();
});

test("shows 'Undid edit' when done for undo_edit command", () => {
  const tool: ToolInvocation = {
    state: "result",
    toolCallId: "5",
    toolName: "str_replace_editor",
    args: { command: "undo_edit", path: "/App.jsx" },
    result: "ok",
  };
  render(<ToolCallBadge toolInvocation={tool} />);
  expect(screen.getByText("Undid edit")).toBeDefined();
});

// file_manager — delete
test("shows 'Deleting' label while in progress for delete command", () => {
  const tool: ToolInvocation = {
    state: "call",
    toolCallId: "6",
    toolName: "file_manager",
    args: { command: "delete", path: "/components/OldCard.jsx" },
  };
  render(<ToolCallBadge toolInvocation={tool} />);
  expect(screen.getByText("Deleting OldCard.jsx")).toBeDefined();
});

test("shows 'Deleted' label when done for delete command", () => {
  const tool: ToolInvocation = {
    state: "result",
    toolCallId: "6",
    toolName: "file_manager",
    args: { command: "delete", path: "/components/OldCard.jsx" },
    result: { success: true, message: "Successfully deleted /components/OldCard.jsx" },
  };
  render(<ToolCallBadge toolInvocation={tool} />);
  expect(screen.getByText("Deleted OldCard.jsx")).toBeDefined();
});

// file_manager — rename
test("shows 'Renaming' label while in progress for rename command", () => {
  const tool: ToolInvocation = {
    state: "call",
    toolCallId: "7",
    toolName: "file_manager",
    args: { command: "rename", path: "/Card.jsx", new_path: "/components/Card.jsx" },
  };
  render(<ToolCallBadge toolInvocation={tool} />);
  expect(screen.getByText("Renaming Card.jsx")).toBeDefined();
});

test("shows 'Renamed' label when done for rename command", () => {
  const tool: ToolInvocation = {
    state: "result",
    toolCallId: "7",
    toolName: "file_manager",
    args: { command: "rename", path: "/Card.jsx", new_path: "/components/Card.jsx" },
    result: { success: true, message: "Successfully renamed" },
  };
  render(<ToolCallBadge toolInvocation={tool} />);
  expect(screen.getByText("Renamed Card.jsx")).toBeDefined();
});

// Basename extraction
test("shows only filename, not full path", () => {
  const tool: ToolInvocation = {
    state: "call",
    toolCallId: "8",
    toolName: "str_replace_editor",
    args: { command: "create", path: "/components/deep/nested/Button.tsx" },
  };
  render(<ToolCallBadge toolInvocation={tool} />);
  expect(screen.getByText("Creating Button.tsx")).toBeDefined();
});

// Fallback for unknown tool
test("falls back to toolName when tool is unknown", () => {
  const tool = {
    state: "call",
    toolCallId: "9",
    toolName: "unknown_tool",
    args: {},
  } as unknown as ToolInvocation;
  render(<ToolCallBadge toolInvocation={tool} />);
  expect(screen.getByText("unknown_tool")).toBeDefined();
});

// partial-call treated as in-progress
test("treats partial-call state as in-progress", () => {
  const tool: ToolInvocation = {
    state: "partial-call",
    toolCallId: "10",
    toolName: "str_replace_editor",
    args: { command: "create", path: "/App.jsx" },
  };
  render(<ToolCallBadge toolInvocation={tool} />);
  expect(screen.getByText("Creating App.jsx")).toBeDefined();
});

// Visual states
test("renders a spinner when in-progress", () => {
  const tool: ToolInvocation = {
    state: "call",
    toolCallId: "11",
    toolName: "str_replace_editor",
    args: { command: "create", path: "/App.jsx" },
  };
  const { container } = render(<ToolCallBadge toolInvocation={tool} />);
  expect(container.querySelector("svg")).toBeDefined();
  expect(container.querySelector(".bg-emerald-500")).toBeNull();
});

test("renders a green dot when done", () => {
  const tool: ToolInvocation = {
    state: "result",
    toolCallId: "11",
    toolName: "str_replace_editor",
    args: { command: "create", path: "/App.jsx" },
    result: "ok",
  };
  const { container } = render(<ToolCallBadge toolInvocation={tool} />);
  expect(container.querySelector(".bg-emerald-500")).toBeDefined();
  expect(container.querySelector("svg")).toBeNull();
});
