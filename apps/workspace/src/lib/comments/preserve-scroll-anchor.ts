import { prefersReducedMotion } from "@/lib/shared/motion";

export type CommentScrollAnchor = {
  id: string;
  top: number;
};

function commentElement(
  container: ParentNode,
  commentId: string,
) {
  return Array.from(
    container.querySelectorAll<HTMLElement>("[data-comment-id]"),
  ).find((element) => element.dataset.commentId === commentId);
}

export function captureFirstCommentAnchor(
  container: HTMLElement | null,
): CommentScrollAnchor | null {
  const element =
    container?.querySelector<HTMLElement>("[data-comment-id]") ?? null;
  if (element === null) return null;
  return {
    id: element.dataset.commentId ?? "",
    top: element.getBoundingClientRect().top,
  };
}

export function restoreCommentAnchor(
  container: HTMLElement | null,
  anchor: CommentScrollAnchor | null,
) {
  if (container === null || anchor === null) return;
  const element = commentElement(container, anchor.id);
  if (element === undefined) return;
  window.scrollBy({
    top: element.getBoundingClientRect().top - anchor.top,
    behavior: "auto",
  });
}

export { prefersReducedMotion };

export function scrollCommentIntoView(commentId: string) {
  const element = commentElement(document, commentId);
  if (element === undefined) return false;
  element.scrollIntoView({
    block: "nearest",
    behavior: prefersReducedMotion() ? "auto" : "smooth",
  });
  return true;
}
