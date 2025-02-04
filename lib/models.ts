export interface Channel {
  name: string;
  id: string;
  is_private: boolean;
}

export interface IFile {
  title: string;
  user: string;
  url_private: string;
  timestamp?: number;
}

export interface Config {
  channel: string;
  name: string;
  files?: EnvFile[];
}

export interface EnvFile {
  path: string;
  type: string;
  include?: string[];
}

export interface Env {
  [key: string]: string;
}

export interface Token {
  botToken: string;
}
