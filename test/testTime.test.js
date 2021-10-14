/* eslint-env mocha */
import { testTime } from "../src/helpers/testTime.js";
import { TIMEOUT_MAX } from "../src/helpers/constants.js";
import { strictEqual } from "assert";

describe("testTime helper", () => {
  it("rejects non-number argument", () => {
    strictEqual(testTime("foobar"), false, "rejects string");
    strictEqual(testTime({ foo: "bar" }), false, "rejects objects");
    strictEqual(testTime(false), false, "rejects boolean");
  });
  it("rejects invalid numbers (non-strict)", () => {
    strictEqual(testTime(0, false), false, "rejects 0");
    strictEqual(testTime(-5, false), false, "rejects negative number");
    strictEqual(testTime(1.337, false), false, "rejects floating point number");
  });
  it("rejects invalid numbers (strict)", () => {
    strictEqual(testTime(0, true), false, "rejects 0");
    strictEqual(testTime(-7, true), false, "rejects negative number");
    strictEqual(
      testTime(TIMEOUT_MAX + 1, true),
      false,
      "rejects number over TIMEOUT_MAX"
    );
    strictEqual(testTime(4.2, true), false, "rejects floating point number");
  });
  it("accepts valid number (non-strict)", () => {
    strictEqual(testTime(12, false), true, "accepts 12");
    strictEqual(
      testTime(TIMEOUT_MAX + 1, false),
      true,
      "accepts number over TIMEOUT_MAX"
    );
  });
  it("accepts valid number (strict)", () => {
    strictEqual(testTime(3, false), true, "accepts 3");
  });
});
