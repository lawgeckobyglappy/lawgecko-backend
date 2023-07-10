import pino from "pino";
import config from "../config/env";

const levels = {
  emerg: 80,
  alert: 70,
  crit: 60,
  error: 50,
  warn: 40,
  notice: 30,
  info: 20,
  debug: 10,
};

export const logger = pino({
  ...(isDev()
    ? {
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
            ignore: "pid,hostname,time",
            customColors: "debug:gray",
          },
        },
      }
    : {}),

  level: process.env.PINO_LOG_LEVEL || "info",
  customLevels: levels,
  useOnlyCustomLevels: true,
});

function isDev() {
  return config.environment == "development";
}
