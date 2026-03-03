import { useEffect } from "react";

const LOCK_COUNT_KEY = "scrollLockCount";
const PREVIOUS_OVERFLOW_KEY = "previousOverflow";

const useBodyScrollLock = (isLocked) => {
  useEffect(() => {
    if (!isLocked) return undefined;

    const { body } = document;
    const currentLockCount = Number(body.dataset[LOCK_COUNT_KEY] || 0);

    if (currentLockCount === 0) {
      body.dataset[PREVIOUS_OVERFLOW_KEY] = body.style.overflow || "";
      body.style.overflow = "hidden";
    }

    body.dataset[LOCK_COUNT_KEY] = String(currentLockCount + 1);

    return () => {
      const latestCount = Number(body.dataset[LOCK_COUNT_KEY] || 1);
      const nextCount = latestCount - 1;

      if (nextCount <= 0) {
        body.style.overflow = body.dataset[PREVIOUS_OVERFLOW_KEY] || "";
        delete body.dataset[LOCK_COUNT_KEY];
        delete body.dataset[PREVIOUS_OVERFLOW_KEY];
      } else {
        body.dataset[LOCK_COUNT_KEY] = String(nextCount);
      }
    };
  }, [isLocked]);
};

export default useBodyScrollLock;
