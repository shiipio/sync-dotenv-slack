import { WebClient } from "@slack/web-api";
import { Token, Channel, IFile } from "./models";
import Axios from "axios";
import tempWrite from "temp-write";
import { readFileSync } from "fs";
import dotenv from "dotenv";
import { getFilenameFromPath } from "./utils";

dotenv.config();
const { ENVBOT_SLACK_BOT_TOKEN: botToken } = process.env;

class SlackBot {
  web: WebClient;
  botToken: string;

  constructor(token: Token) {
    this.web = new WebClient(token.botToken);
    this.botToken = token.botToken;
  }

  async channels(): Promise<Channel[]> {
    const { channels } = await this.web.conversations.list({
      exclude_archived: true,
      types: "private_channel",
    });
    return channels as Channel[];
  }

  async channel(channelName: string): Promise<Channel> {
    const channels = await this.channels();
    return channels.filter((channel) => channel.name === channelName)[0];
  }

  async latestFile(channel: Channel, title: string): Promise<IFile | null> {
    const { user_id: SLACK_BOT_ID } = await this.web.auth.test();
    const { files } = await this.web.files.list({
      channel: channel.id,
      user: `${SLACK_BOT_ID}`,
    });

    const matchingFiles: IFile[] = (files as IFile[])
      .filter((f) => f.title === title)
      .sort((a, b) => b.timestamp - a.timestamp);

    return matchingFiles[0] || null;
  }

  async fileContents(file: IFile) {
    const { data } = await Axios.get(file.url_private, {
      headers: {
        Authorization: `Bearer ${this.botToken}`,
      },
    });
    return data;
  }

  async upload(env: string, channel: Channel, title: string) {
    return tempWrite(env).then((filePath) => {
      const file = readFileSync(filePath);
      const filename = getFilenameFromPath(filePath);
      return this.web.files.upload({
        filename,
        title,
        file,
        channels: channel.name,
      });
    });
  }
}

export default new SlackBot({ botToken });
