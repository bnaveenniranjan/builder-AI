import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ChatPanel from "../components/ChatPanel";

// ─── Mocks ───────────────────────────────────────────────────────────────────

// Mock lucide-react icons so no SVG-related errors in jsdom
vi.mock("lucide-react", () => ({
  UserIcon: (props) => <span data-testid="user-icon" {...props} />,
  BotMessageSquareIcon: (props) => <span data-testid="bot-msg-icon" {...props} />,
  BotIcon: (props) => <span data-testid="bot-icon" {...props} />,
  ArrowRightIcon: (props) => <span {...props} />,
  Loader2Icon: (props) => <span {...props} />,
  MicIcon: (props) => <span {...props} />,
  CloudUploadIcon: (props) => <span {...props} />,
}));

// scrollIntoView is not implemented in jsdom
window.HTMLElement.prototype.scrollIntoView = vi.fn();

// ─── Helpers ──────────────────────────────────────────────────────────────────

const userMsg   = { role: "user",      content: "Hello AI" };
const assistantMsg = { role: "assistant", content: "Hi there!\nHow can I help?" };

function renderPanel(props = {}) {
  const defaults = { messages: [], onSend: vi.fn(), loading: false };
  return render(<ChatPanel {...defaults} {...props} />);
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("ChatPanel", () => {

  // 1. Empty state
  it("shows placeholder text when messages array is empty", () => {
    renderPanel({ messages: [] });
    expect(screen.getByText("Ask AI to modify your website")).toBeInTheDocument();
  });

  // 2. Hides placeholder when there are messages
  it("hides placeholder when messages exist", () => {
    renderPanel({ messages: [userMsg] });
    expect(screen.queryByText("Ask AI to modify your website")).not.toBeInTheDocument();
  });

  // 3. Renders a user message
  it("renders user message content", () => {
    renderPanel({ messages: [userMsg] });
    expect(screen.getByText("Hello AI")).toBeInTheDocument();
  });

  // 4. Shows 'You' label for user messages
  it("shows 'YOU' label for user role", () => {
    renderPanel({ messages: [userMsg] });
    expect(screen.getByText("You")).toBeInTheDocument();
  });

  // 5. Renders an assistant message
  it("renders assistant message content", () => {
    renderPanel({ messages: [assistantMsg] });
    expect(screen.getByText("Hi there!")).toBeInTheDocument();
  });

  // 6. Shows 'AI' label for assistant messages
  it("shows 'AI' label for assistant role", () => {
    renderPanel({ messages: [assistantMsg] });
    expect(screen.getByText("AI")).toBeInTheDocument();
  });

  // 7. UserIcon rendered for user message
  it("renders UserIcon for user messages", () => {
    renderPanel({ messages: [userMsg] });
    expect(screen.getByTestId("user-icon")).toBeInTheDocument();
  });

  // 8. BotMessageSquareIcon rendered for assistant message
  it("renders BotMessageSquareIcon for assistant messages", () => {
    renderPanel({ messages: [assistantMsg] });
    expect(screen.getByTestId("bot-msg-icon")).toBeInTheDocument();
  });

  // 9. Multi-line content split on \n
  it("splits multi-line message content on newlines", () => {
    renderPanel({ messages: [assistantMsg] });
    expect(screen.getByText("Hi there!")).toBeInTheDocument();
    expect(screen.getByText("How can I help?")).toBeInTheDocument();
  });

  // 10. Loading indicator shown when loading=true
  it("shows loading indicator when loading prop is true", () => {
    renderPanel({ messages: [], loading: true });
    expect(screen.getByText("Thinking...")).toBeInTheDocument();
  });

  // 11. Loading indicator hidden when loading=false
  it("does not show loading indicator when loading prop is false", () => {
    renderPanel({ messages: [], loading: false });
    expect(screen.queryByText("Thinking...")).not.toBeInTheDocument();
  });

  // 12. BotIcon shown in loading bubble
  it("renders BotIcon inside the loading bubble", () => {
    renderPanel({ messages: [], loading: true });
    expect(screen.getByTestId("bot-icon")).toBeInTheDocument();
  });

  // 13. Multiple messages rendered
  it("renders multiple messages", () => {
    renderPanel({ messages: [userMsg, assistantMsg] });
    expect(screen.getByText("Hello AI")).toBeInTheDocument();
    expect(screen.getByText("Hi there!")).toBeInTheDocument();
  });

  // 14. PromptInput is present in the DOM
  it("renders the PromptInput textarea", () => {
    renderPanel({ messages: [] });
    expect(screen.getByPlaceholderText(/Ask AI to modify/)).toBeInTheDocument();
  });

  // 15. Submitting PromptInput calls onSend with the typed value
  it("calls onSend with the user input when form is submitted", async () => {
    const onSend = vi.fn();
    renderPanel({ messages: [], onSend });
    const textarea = screen.getByPlaceholderText(/Ask AI to modify/);
    fireEvent.change(textarea, { target: { value: "Make it blue" } });
    // PromptInput (default variant) renders a div with a submit button
    const buttons = screen.getAllByRole("button");
    const submitBtn = buttons[buttons.length - 1]; // last button is the send arrow
    fireEvent.click(submitBtn);
    expect(onSend).toHaveBeenCalledWith("Make it blue");
  });

  // 16. scrollIntoView called on mount
  it("calls scrollIntoView on initial render", () => {
    renderPanel({ messages: [] });
    expect(window.HTMLElement.prototype.scrollIntoView).toHaveBeenCalled();
  });

  // 17. Loading bubble has dot-loader
  it("dot-loader spans are rendered inside loading bubble", () => {
    const { container } = renderPanel({ messages: [], loading: true });
    const dotLoader = container.querySelector(".dot-loader");
    expect(dotLoader).toBeInTheDocument();
    expect(dotLoader.querySelectorAll("span").length).toBe(3);
  });

  // 18. Loading bubble shows 'AI' label
  it("loading bubble shows AI label", () => {
    renderPanel({ messages: [], loading: true });
    // There should be at least one 'AI' label (the loading bubble)
    const aiLabels = screen.getAllByText("AI");
    expect(aiLabels.length).toBeGreaterThanOrEqual(1);
  });

  // 19. No icons rendered when messages is empty and not loading
  it("renders no role icons when messages=[] and loading=false", () => {
    renderPanel({ messages: [], loading: false });
    expect(screen.queryByTestId("user-icon")).not.toBeInTheDocument();
    expect(screen.queryByTestId("bot-msg-icon")).not.toBeInTheDocument();
    expect(screen.queryByTestId("bot-icon")).not.toBeInTheDocument();
  });

  // 20. Messages + loading rendered together
  it("renders messages and loading bubble simultaneously", () => {
    renderPanel({ messages: [userMsg], loading: true });
    expect(screen.getByText("Hello AI")).toBeInTheDocument();
    expect(screen.getByText("Thinking...")).toBeInTheDocument();
  });
});


