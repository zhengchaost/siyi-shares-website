import { useCallback, useRef } from "react";

export function useComposition() {
  const isComposing = useRef(false);

  const onCompositionStart = useCallback(() => {
    isComposing.current = true;
  }, []);

  const onCompositionEnd = useCallback(() => {
    isComposing.current = false;
  }, []);

  return { isComposing, onCompositionStart, onCompositionEnd };
}
