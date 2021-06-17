import dotenv from "dotenv";
import ora from "ora";
import parseEnv from "parse-dotenv";
import tempWrite from "temp-write";
import bot from "./bot";
import { Config } from "./models";
import {
  getEnvContents,
  keys,
  exit,
  valuesSyncCheck,
  stringToEnv,
  getFilenameFromPath,
} from "./utils";
import { readFileSync } from "fs";

dotenv.config();

export const alertChannel = async (options: Config) => {
  const spinner = ora("one moment").start();
  try {
    const { channel: channelName, files, name } = options;

    if (!channelName) return exit(1, spinner, "channel name is required");

    spinner.text = `looking up ${channelName} channel`;
    const channel = await bot.channel(channelName);

    if (!channel) {
      return exit(
        1,
        spinner,
        `${channelName} channel not found. Perhaps you forgot to invite envbot to the private channel`
      );
    }

    spinner.text = `found ${channelName} channel`;

    for (const file of files) {
      const { include: patterns } = file;
      const title = `${name} ${getFilenameFromPath(file.path)}`;
      const localEnv = stringToEnv(readFileSync(file.path, "utf-8"));

      const latestFileFromBot = await bot.latestFile(channel, title);

      if (latestFileFromBot && latestFileFromBot.url_private) {
        spinner.text = "comparing envs";
        const fileContents = await bot.fileContents(latestFileFromBot);
        const slackEnv = parseEnv(tempWrite.sync(fileContents));
        const variables = keys(localEnv).every((key) =>
          slackEnv.hasOwnProperty(key)
        );
        const keysInSync =
          variables && keys(localEnv).length === keys(slackEnv).length;

        const valuesInSync = valuesSyncCheck(localEnv, slackEnv, patterns);
        const inSync = keysInSync && valuesInSync;

        if (!inSync) {
          spinner.text = "env not in sync";
          spinner.text = "synchronizing env with slack channel";
          await bot.upload(getEnvContents(localEnv, patterns), channel, title);
          spinner.succeed("sync successful 🎉");
        } else spinner.info("env in sync");
      } else {
        spinner.text = "synchronizing env with slack channel";
        await bot.upload(getEnvContents(localEnv, patterns), channel, title);
        spinner.succeed("sync successful 🎉");
      }
    }

    exit(0, spinner);
  } catch (error) {
    exit(1, spinner, "failed to sync env");
  }
};
