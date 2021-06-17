import { readFileSync } from "fs";
import { Env } from "./models";
import { Ora } from "ora";

export const getEnv = (path: string = ".env") => readFileSync(path);

export const keys = (obj: {}): string[] => Object.keys(obj);
export const values = (obj: {}): string[] => Object.values(obj);

export const stringToEnv = (envString: string) => {
  let env = {};
  envString.replace(/(\w+)=(.+)/g, ($0, $1, $2) => {
    env[$1] = $2;
  });

  return env;
};

export const envToString = (env: Env) =>
  keys(env)
    .map((key) => `${key}=${env[key] || ""}`)
    .join("\r\n")
    .replace(/(__\w+_\d+__=)/g, "");

export const getFinalEnvObj = (env: Env, patterns: string[]): Env => {
  const envObj = { ...env };
  const blacklist = [];
  const whitelist = [];

  if (!patterns || !patterns.length) {
    keys(envObj).forEach((key) => {
      envObj[key] = "";
    });
    return envObj;
  }

  patterns
    .map((pattern) => pattern.trim())
    .forEach((pattern) => {
      if (pattern.startsWith("!")) blacklist.push(pattern.slice(1));
      else whitelist.push(pattern);
    });

  const envToIncludeWithValues = keys(envObj).filter((key: string) => {
    return !whitelist.length || whitelist.includes("*")
      ? !blacklist.includes(key)
      : !blacklist.includes(key) && whitelist.includes(key);
  });

  keys(envObj).forEach((key) => {
    if (!envToIncludeWithValues.includes(key)) envObj[key] = "";
  });

  return envObj;
};

export const valuesSyncCheck = (
  localEnv: Env,
  slackEnv: Env,
  patterns: string[]
): boolean => {
  const finalLocalEnv = getFinalEnvObj(localEnv, patterns);
  return keys(finalLocalEnv)
    .map((key) => finalLocalEnv[key] === slackEnv[key])
    .every((sync) => sync === true);
};

export const getEnvContents = (env: Env, patterns: string[]) => {
  return envToString(getFinalEnvObj(env, patterns));
};

export const exit = (code: number, spinner: Ora, msg?: string) => {
  if (code > 0 && msg) spinner.fail(msg);
  spinner.stop();
  process.exit(code);
};

export const getFilenameFromPath = (path: string) => {
  return path.replace(/^.*[\\\/]/, "");
};
