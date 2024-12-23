export interface IContextAwareLogger {
  debug(context: any, message: string): void;
  log(context: any, message: string): void;
  error(context: any, message: string, error: Error): void;
  warn(context: any, message: string): void;
}
