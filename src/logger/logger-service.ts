import { createLogger, transports, format, Logger } from "winston";
import { IContextAwareLogger } from "./logger-service.interface";

export class ApplicationLogger implements IContextAwareLogger {
  private logger: Logger;

  constructor() {
    this.logger = createLogger({
      transports: [new transports.Console()],
      format: format.combine(
        format.colorize({
          colors: { info: "blue", error: "red" },
          message: true,
        }),
        format.timestamp(),
        format.printf(({ timestamp, level, message }) => {
          return `[${timestamp}] ${level}: ${message}`;
        }),
      ),
      exitOnError: false,
      handleExceptions: true,
    });
  }

  debug(context: any, message: string): void {
    this.logger.debug(message, { context });
  }

  log(context: any, message: string): void {
    this.logger.info(message, { context });
  }

  error(context: any, message: string, error: Error): void {
    this.logger.error(message, {
      context,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
    });
  }

  warn(context: any, message: string): void {
    this.logger.warn(message, { context });
  }
}
