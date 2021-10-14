import { TIMEOUT_MAX } from "./constants.js";

export function testTime(time, strict) {
  if (strict && time > TIMEOUT_MAX) return false;
  if (time <= 0 || !Number.isInteger(time)) return false;
  return true;
}
