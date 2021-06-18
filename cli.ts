#!/usr/bin/env node
import pkgConf from "pkg-conf";

import { alertChannel, checkEnvFiles } from "./lib";
import { Config } from "./lib/models";

const defaultConfig: Config = {
  name: "",
  files: [],
  channel: null,
};

(async () => {
  const config: Config = (await pkgConf("envbot")) as any;
  const name = Object.values((await pkgConf("name")) as any).join("");

  const args = process.argv.slice(2);

  if (args[0] === "--check") {
    checkEnvFiles({ ...defaultConfig, ...config, name });
  } else {
    alertChannel({ ...defaultConfig, ...config, name });
  }
})();
