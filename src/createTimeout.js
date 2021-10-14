import nanoid from "nanoid";
import { testTime } from "./helpers/testTime.js";
import { TIMEOUT_MAX } from "./helpers/constants.js";

export function createTimeout(fn, time, options) {
  // options
  const autoStart = options?.autoStart ?? false;
  const strictMode = options?.strictMode ?? false;
  let length = time;

  // sanity check time
  if (!testTime(length)) {
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

  let callback = ref => {
    fn();
    clearFromRef(ref);
  };

  function isRunning() {
    return idStore.size > 0;
  }

  function setLongTimeout(cb, length, ref) {
    const start = Date.now();
    const stop = start + length;

    function run(ref) {
      const now = Date.now();
      const delta = stop - now;

      // finished
      if (delta <= 0) {
        cb();
        return;
      }

      const id = setTimeout(() => run(ref), Math.min(delta, TIMEOUT_MAX));
      idStore.add(id); // add new id
      idStore.delete(refIdMap.get(ref)); // remove old id
      refIdMap.set(ref, id); // save new id in ref map
    }

    run(ref);
  }

  const _timeout = {
    start: () => {
      if (strictMode && isRunning()) return false;

      // create timeout
      const ref = nanoid();
      if (length <= TIMEOUT_MAX) {
        const id = setTimeout(() => {
          callback(ref);
        }, length);

        // store ref and id
        idStore.add(id);
        refIdMap.set(ref, id);
      } else {
        setLongTimeout(() => {
          callback(ref);
        }, length);
      }

      return ref;
    },

    stop: () => {
      if (!isRunning()) return;

      for (const ref of refIdMap.keys()) {
        clearTimeout(refIdMap.get(ref));
        clearFromRef(ref);
      }
    },

    stopByRef: ref => {
      const id = refIdMap.get(ref);
      if (!id) return;
      clearTimeout(id);
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
      if (!testTime(time)) return false;
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

  if (autoStart) _timeout.start();

  return _timeout;
}
