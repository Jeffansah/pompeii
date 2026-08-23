import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { CommentComposer } from "./comment-composer";

let container: HTMLDivElement;
let root: Root;
const actEnvironment = globalThis as typeof globalThis & {
  IS_REACT_ACT_ENVIRONMENT?: boolean;
};

function setTextareaValue(textarea: HTMLTextAreaElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(
    HTMLTextAreaElement.prototype,
    "value",
  )?.set;
  if (setter === undefined) throw new Error("Textarea setter not found");
  setter.call(textarea, value);
  textarea.dispatchEvent(new Event("input", { bubbles: true }));
}

async function flushForm() {
  await new Promise((resolve) => window.setTimeout(resolve, 0));
}

beforeAll(() => {
  actEnvironment.IS_REACT_ACT_ENVIRONMENT = true;
});

afterAll(() => {
  delete actEnvironment.IS_REACT_ACT_ENVIRONMENT;
});

beforeEach(() => {
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
});

describe("CommentComposer", () => {
  it("submits with Command+Enter and resets only after success", async () => {
    const onSubmit = vi.fn(async () => undefined);
    await act(async () => {
      root.render(
        <CommentComposer
          autoFocus
          label="Add a comment"
          onSubmit={onSubmit}
          pending={false}
          refocusAfterSubmit
        />,
      );
    });
    const textarea = container.querySelector("textarea");
    if (textarea === null) throw new Error("Textarea not rendered");

    await act(async () => {
      setTextareaValue(textarea, "A useful update");
      textarea.dispatchEvent(
        new KeyboardEvent("keydown", {
          bubbles: true,
          key: "Enter",
          metaKey: true,
        }),
      );
      await flushForm();
    });

    expect(onSubmit).toHaveBeenCalledWith("A useful update");
    expect(textarea.value).toBe("");
    expect(document.activeElement).toBe(textarea);
  });

  it("retains the draft and focus after a failed submit", async () => {
    const onSubmit = vi.fn(async () => {
      throw new Error("Unable to post");
    });
    await act(async () => {
      root.render(
        <CommentComposer
          label="Add a comment"
          onSubmit={onSubmit}
          pending={false}
        />,
      );
    });
    const textarea = container.querySelector("textarea");
    if (textarea === null) throw new Error("Textarea not rendered");

    await act(async () => {
      setTextareaValue(textarea, "Keep this draft");
      textarea.dispatchEvent(
        new KeyboardEvent("keydown", {
          bubbles: true,
          ctrlKey: true,
          key: "Enter",
        }),
      );
      await flushForm();
    });

    expect(onSubmit).toHaveBeenCalledOnce();
    expect(textarea.value).toBe("Keep this draft");
    expect(document.activeElement).toBe(textarea);
  });

  it("keeps submit secondary while composing", async () => {
    await act(async () => {
      root.render(
        <CommentComposer
          label="Add a comment"
          onSubmit={async () => undefined}
          pending={false}
        />,
      );
    });
    const submit = container.querySelector('button[type="submit"]');
    if (submit === null) throw new Error("Submit not rendered");
    expect(submit.getAttribute("data-variant")).toBe("secondary");

    const textarea = container.querySelector("textarea");
    if (textarea === null) throw new Error("Textarea not rendered");
    await act(async () => {
      setTextareaValue(textarea, "Something to say");
      textarea.focus();
    });
    expect(submit.getAttribute("data-variant")).toBe("secondary");
  });

  it("cancels with Escape", async () => {
    const onCancel = vi.fn();
    await act(async () => {
      root.render(
        <CommentComposer
          label="Reply"
          onCancel={onCancel}
          onSubmit={async () => undefined}
          pending={false}
        />,
      );
    });
    const textarea = container.querySelector("textarea");
    if (textarea === null) throw new Error("Textarea not rendered");

    act(() => {
      textarea.dispatchEvent(
        new KeyboardEvent("keydown", { bubbles: true, key: "Escape" }),
      );
    });

    expect(onCancel).toHaveBeenCalledOnce();
  });
});
