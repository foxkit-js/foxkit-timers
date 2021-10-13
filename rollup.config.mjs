import { readFileSync } from "fs";
import { join } from "path";
import { makeRollupConfig } from "@foxkit/internal";

const pkg = JSON.parse(
  readFileSync(join(process.cwd(), "package.json"), "utf8")
);
const config = makeRollupConfig(pkg);

export default config;
