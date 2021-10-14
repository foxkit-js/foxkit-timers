import nanoid from "nanoid";
import { testTime } from "./helpers/testTime.js";

export function createInterval(fn, time, options) {
  // options
  const autoStart = options?.autoStart ?? false;
  const strictMode = options?.strictMode ?? true;
  let length = time;

  // strict sanity check time
  if (!testTime(length, true)) {
    if (strictMode) throw new Error("Invalid time");
    return false;
  }

  // reference stores
  const idStore = new Set();
  const refIdMap = new Map();

  function clearFromRef(ref) {
    const id = refIdMap(ref);
    idStore.delete(id);
    refIdMap.delete(ref);
  }

  let callback = () => {
    fn();
  };

  function isRunning() {
    return idStore.size > 0;
  }

  const _interval = {
    start: () => {
      if (strictMode && isRunning()) return false;

      // create interval
      const ref = nanoid();
      const id = setInterval(() => callback(), length);

      // store ref and id
      idStore.add(id);
      refIdMap.set(ref, id);

      return ref;
    },

    stop: () => {
      if (!isRunning()) return;

      for (const ref of refIdMap.keys()) {
        clearInterval(refIdMap.get(ref));
        clearFromRef(ref);
      }
    },

    stopByRef: ref => {
      const id = refIdMap.get(ref);
      if (!id) return;
      clearInterval(id);
      clearFromRef(ref);
    },

    setCallback: fn => {
      if (strictMode && isRunning()) return false;

      callback = ref => {
        fn();
        clearFromRef(ref);
      };
    },

    setTime: time => {
      if (strictMode && isRunning()) return false;
      if (!testTime(time, true)) return false;
      length = time;
      return true;
    },

    get running() {
      if (strictMode) {
        return isRunning();
      }
      return idStore.size();
    }
  };

  if (autoStart) _interval.start();

  return _interval;
}
