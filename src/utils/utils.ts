
import { ApplicationLogger } from "../logger";



/**
 * Logs an error message with the provided context using the ApplicationLogger.
 * @param {any} error - The error object to log.
 * @param {string} methodName - The name of the method that encountered the error.
 * @param {any} props - Additional properties to include in the log context.
 */
export const handleErrorLog = (
  error: any,
  methodName: string,
  props: any
): void => {
  const logger: ApplicationLogger = new ApplicationLogger();
  const context = {
    method: methodName,
    props: JSON.stringify(props),
  };
  const message = error.message;
  logger.error(context, message, error);
};
