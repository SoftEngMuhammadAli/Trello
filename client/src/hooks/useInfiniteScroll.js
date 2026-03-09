import { useEffect, useRef } from 'react';

export function useInfiniteScroll(onIntersect, enabled = true) {
  const sentinelRef = useRef(null);

  useEffect(() => {
    if (!enabled || !sentinelRef.current) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        onIntersect();
      }
    });

    observer.observe(sentinelRef.current);

    return () => observer.disconnect();
  }, [onIntersect, enabled]);

  return sentinelRef;
}
