import { useCallback, useMemo, useRef, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@pompeii/api";
import { clientErrorMessage } from "@pompeii/errors/client";
import type { Id } from "@pompeii/api";

import {
  optimisticallyCreateComment,
  optimisticallyRemoveComment,
  optimisticallyUpdateComment,
} from "@/lib/comments/optimistic-comments";
import type { CommentItem, CommentSubject } from "@/types/comments";

type PendingOperation =
  | { kind: "createRoot" }
  | { kind: "createReply"; rootId: Id<"comments"> }
  | { kind: "update"; commentId: Id<"comments"> }
  | { kind: "remove"; commentId: Id<"comments"> };

const ROOT_ERROR_SCOPE = "root";
const replyErrorScope = (rootId: Id<"comments">) => `reply:${rootId}`;
const commentErrorScope = (commentId: Id<"comments">) => `comment:${commentId}`;

export function useCommentActions({
  weddingId,
  subject,
}: {
  weddingId: Id<"weddings">;
  subject: CommentSubject;
}) {
  const [pendingOperations, setPendingOperations] = useState<
    Record<string, PendingOperation>
  >({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const createMetadata = useRef(new Map<string, { replyTo?: CommentItem }>());
  const removeMetadata = useRef(new Map<string, CommentItem>());
  const beginOperation = useCallback(
    (id: string, operation: PendingOperation) => {
      setPendingOperations((current) => ({
        ...current,
        [id]: operation,
      }));
    },
    [],
  );
  const finishOperation = useCallback((id: string) => {
    setPendingOperations((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
  }, []);
  const clearErrorScope = useCallback((scope: string) => {
    setErrors((current) => {
      if (!(scope in current)) return current;
      const next = { ...current };
      delete next[scope];
      return next;
    });
  }, []);
  const setErrorScope = useCallback((scope: string, message: string) => {
    setErrors((current) => ({ ...current, [scope]: message }));
  }, []);
  const createMutation = useMutation(
    api.comments.create.handler.create,
  ).withOptimisticUpdate((localStore, args) => {
    const replyTo = createMetadata.current.get(args.clientRequestId)?.replyTo;
    optimisticallyCreateComment(localStore, {
      weddingId,
      subject,
      body: args.body,
      clientRequestId: args.clientRequestId,
      ...(replyTo === undefined ? {} : { replyTo }),
    });
  });
  const updateMutation = useMutation(
    api.comments.update.handler.update,
  ).withOptimisticUpdate((localStore, args) => {
    optimisticallyUpdateComment(localStore, {
      weddingId,
      subject,
      commentId: args.commentId,
      body: args.body,
    });
  });
  const removeMutation = useMutation(
    api.comments.remove.handler.remove,
  ).withOptimisticUpdate((localStore, args) => {
    const comment = removeMetadata.current.get(String(args.commentId));
    if (comment === undefined) return;
    optimisticallyRemoveComment(localStore, {
      weddingId,
      subject,
      comment,
    });
  });

  const create = useCallback(
    async (
      body: string,
      replyTo?: CommentItem,
      requestId = crypto.randomUUID(),
    ) => {
      const clientRequestId = requestId;
      const rootId =
        replyTo === undefined
          ? null
          : replyTo.kind === "root"
            ? replyTo._id
            : replyTo.rootId;
      const errorScope =
        rootId === null ? ROOT_ERROR_SCOPE : replyErrorScope(rootId);
      createMetadata.current.set(
        clientRequestId,
        replyTo === undefined ? {} : { replyTo },
      );
      beginOperation(
        clientRequestId,
        replyTo === undefined
          ? { kind: "createRoot" }
          : {
              kind: "createReply",
              rootId: replyTo.kind === "root" ? replyTo._id : replyTo.rootId,
            },
      );
      clearErrorScope(errorScope);
      try {
        return await createMutation({
          weddingId,
          subject,
          body,
          clientRequestId,
          ...(replyTo === undefined ? {} : { replyToId: replyTo._id }),
        });
      } catch (caught) {
        setErrorScope(errorScope, clientErrorMessage(caught));
        throw caught;
      } finally {
        createMetadata.current.delete(clientRequestId);
        finishOperation(clientRequestId);
      }
    },
    [
      beginOperation,
      clearErrorScope,
      createMutation,
      finishOperation,
      setErrorScope,
      subject,
      weddingId,
    ],
  );

  const update = useCallback(
    async (commentId: Id<"comments">, body: string) => {
      const operationId = String(commentId);
      const errorScope = commentErrorScope(commentId);
      beginOperation(operationId, { kind: "update", commentId });
      clearErrorScope(errorScope);
      try {
        return await updateMutation({
          weddingId,
          commentId,
          body,
        });
      } catch (caught) {
        setErrorScope(errorScope, clientErrorMessage(caught));
        throw caught;
      } finally {
        finishOperation(operationId);
      }
    },
    [
      beginOperation,
      clearErrorScope,
      finishOperation,
      setErrorScope,
      updateMutation,
      weddingId,
    ],
  );

  const remove = useCallback(
    async (comment: CommentItem) => {
      const commentId = String(comment._id);
      const errorScope = commentErrorScope(comment._id);
      removeMetadata.current.set(commentId, comment);
      beginOperation(commentId, {
        kind: "remove",
        commentId: comment._id,
      });
      clearErrorScope(errorScope);
      try {
        return await removeMutation({
          weddingId,
          commentId: comment._id,
        });
      } catch (caught) {
        setErrorScope(errorScope, clientErrorMessage(caught));
        throw caught;
      } finally {
        removeMetadata.current.delete(commentId);
        finishOperation(commentId);
      }
    },
    [
      beginOperation,
      clearErrorScope,
      finishOperation,
      removeMutation,
      setErrorScope,
      weddingId,
    ],
  );
  const clearError = useCallback(() => setErrors({}), []);
  const pendingIds = useMemo(
    () => new Set(Object.keys(pendingOperations)),
    [pendingOperations],
  );
  const rootCreatePending = Object.values(pendingOperations).some(
    (operation) => operation.kind === "createRoot",
  );
  const isReplyCreatePending = useCallback(
    (rootId: Id<"comments">) =>
      Object.values(pendingOperations).some(
        (operation) =>
          operation.kind === "createReply" && operation.rootId === rootId,
      ),
    [pendingOperations],
  );
  const errorForReply = useCallback(
    (rootId: Id<"comments">) => errors[replyErrorScope(rootId)] ?? null,
    [errors],
  );
  const errorForComment = useCallback(
    (commentId: Id<"comments">) => errors[commentErrorScope(commentId)] ?? null,
    [errors],
  );

  return {
    create,
    update,
    remove,
    pendingIds,
    rootCreatePending,
    isReplyCreatePending,
    rootError: errors[ROOT_ERROR_SCOPE] ?? null,
    errorForReply,
    errorForComment,
    clearError,
  };
}
