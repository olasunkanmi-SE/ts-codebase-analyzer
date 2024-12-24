import { ApplicationLogger } from "../logger";

export const getLogger = (): ApplicationLogger => {
  return new ApplicationLogger();
};

/**
 * Logs an error message with the provided context using the ApplicationLogger.
 * @param {any} error - The error object to log.
 * @param {string} methodName - The name of the method that encountered the error.
 * @param {any} props - Additional properties to include in the log context.
 */
export const logError = (error: any, methodName: string, props: any): void => {
  const logger = getLogger();
  const context = {
    method: methodName,
    props: JSON.stringify(props),
    errorStack: error instanceof Error ? error.stack : undefined,
  };
  logger.error(context, error.message, error);
};
