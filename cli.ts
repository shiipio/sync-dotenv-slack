#!/usr/bin/env node
import pkgConf from "pkg-conf";

import { alertChannel } from "./lib";
import { Config } from "./lib/models";

const defaultConfig: Config = {
  name: "",
  files: [],
  channel: null,
};

(async () => {
  const config: Config = (await pkgConf("envbot")) as any;
  const name = Object.values((await pkgConf("name")) as any).join("");
  alertChannel({ ...defaultConfig, ...config, name });
})();
