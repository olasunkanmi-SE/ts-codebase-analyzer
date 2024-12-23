import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { ApplicationLogger } from "../logger";

type ValueType = string | number | boolean;

export class EnvManager {
  private envFilePath: string;
  private envVariables: { [key: string]: string } = {};
  private logger: ApplicationLogger;

  constructor(envPath: string) {
    this.envFilePath = path.resolve(process.cwd(), envPath);
    this.logger = new ApplicationLogger();
    this.initializeEnv();
  }

  /**
   * Initializes the environment variables by creating a new env file if it doesn't exist
   * and loading the variables from the file.
   * @throws {Error} If an error occurs while initializing the env file
   */
  private initializeEnv(): void {
    try {
      if (!fs.existsSync(this.envFilePath)) {
        this.logger.warn(
          { method: "initializeEnv" },
          `Env file not found at ${this.envFilePath}. Creating a new one.`,
        );
        fs.writeFile(this.envFilePath, "# Environment Variables\n", (err) => {
          if (err) {
            throw err;
          }
        });
      }
      dotenv.config({ path: this.envFilePath });
      this.loadEnvVariables();
    } catch (error: any) {
      const context = { method: "initializeEnv" };
      const message = "Error occurred while initializing the env file";
      this.logger.error(context, message, error);
      throw error;
    }
  }

  /**
   * Loads environment variables from a file.
   * Reads the file contents, splits them into key-value pairs, and stores them in the envVariables object.
   * @throws {Error} If there's an error reading the file, it will be logged and re-thrown.
   */
  private loadEnvVariables(): void {
    try {
      const envContent = fs.readFileSync(this.envFilePath, "utf8");
      const lines = envContent.split("\n");
      for (const line of lines) {
        const [key, value] = line.split("=");
        if (key && value) {
          this.envVariables[key.trim()] = value.trim();
        }
      }
    } catch (error: any) {
      const context = { method: "loadEnvVariables" };
      const message = "Error occurred while reading the env file";
      this.logger.error(context, message, error);
      throw error;
    }
  }

  /**
   * Retrieves an environment variable value by its key.
   * Falls back to a default value if the variable is not set.
   * @param key - The key of the environment variable to retrieve
   * @param defaultValue - The default value to return if the variable is not set (optional)
   * @returns The parsed value of the environment variable, or the default value if it's not set
   */
  get<T extends ValueType>(key: string, defaultValue?: T): T | undefined {
    const value = process.env[key] ?? this.envVariables[key];
    if (value === undefined) {
      return defaultValue;
    }
    return this.parseValue(value, defaultValue);
  }

  /**
   * Sets an environment variable with the given key and value.
   * This method updates both the process.env object and the internal envVariables map.
   * It also updates the environment file to persist the changes.
   * @param key - The key of the environment variable to set
   * @param value - The value of the environment variable to set
   * */
  set(key: string, value: string | number | boolean): void {
    const stringValue = String(value);
    process.env[key] = stringValue;
    this.envVariables[key] = stringValue;
    this.updateEnvFile();
  }

  /**
   * Removes an environment variable from the system and updates the env file.
   * This method is used to delete sensitive configuration variables after use.
   * @param key - The key of the environment variable to remove
   */
  remove(key: string): void {
    delete process.env[key];
    delete this.envVariables[key];
    this.updateEnvFile();
  }

  private updateEnvFile(): void {
    try {
      let envContent = "";
      for (const [k, v] of Object.entries(this.envVariables)) {
        envContent += `${k}=${v}\n`;
      }
      fs.writeFile(this.envFilePath, envContent.trim() + "\n", (err) => {
        if (err) {
          throw err;
        }
      });
    } catch (error: any) {
      const context = { method: "updateEnvFile" };
      const message = "Error occurred while updating the env file";
      this.logger.error(context, message, error);
      throw error;
    }
  }

  /**
   * Updates the environment file with the current environment variables.
   * This method iterates over the envVariables object, constructs the env file content,
   * and writes it to the file. If any error occurs during the process, it logs the error
   * and re-throws it.
   * */
  private parseValue<T extends string | number | boolean>(
    value: string,
    defaultValue?: T,
  ): T {
    if (typeof defaultValue === "boolean") {
      return (value.toLowerCase() === "true") as T;
    } else if (typeof defaultValue === "number") {
      return Number(value) as T;
    }
    return value as T;
  }
}
