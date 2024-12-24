import { IRequestOptions } from "./../../dist/interfaces/generic.interface.d";
import * as https from "https";
import { ClientRequest } from "http";
import { IHttpClient } from "./http-service.interface";
import { ApplicationLogger } from "../logger/logger-service";
import { HTTP_VERBS, RequestHeader } from "../core/constants";
/**
 * A custom HTTP client implementation that provides a set of methods for sending HTTP requests.
 * This client supports GET, POST, PUT, and DELETE requests, and allows for optional request options and payload.
 * It also handles JSON parsing and error logging.
 */

export class HttpClient implements IHttpClient {
  logger: ApplicationLogger;
  constructor() {
    this.logger = new ApplicationLogger();
  }

  /*
    Retrieves a resource asynchronously using the GET method. 
    @param options - Optional request options 
    @returns A Promise that resolves to the response data 
  **/
  async get<T>(payload: any, options?: https.RequestOptions): Promise<T> {
    return this.sendRequest<T>("GET", options, payload);
  }

  /* Sends a request with a payload using the POST method.
   * @param payload - The request payload
   * @param options - Optional request options
   * @returns A Promise that resolves to the response data
   **/
  async post<TRequest, TResponse>(
    payload: TRequest,
    options?: https.RequestOptions
  ): Promise<TResponse> {
    return this.sendRequest<TResponse>("POST", options, payload);
  }

  /*
   Updates a resource asynchronously using the PUT method. 
   @param payload - The request payload * @param options - Optional request options 
   @returns A Promise that resolves to the response data 
  **/
  async put<TRequest, TResponse>(
    payload: TRequest,
    options?: https.RequestOptions
  ): Promise<TResponse> {
    return this.sendRequest<TResponse>("PUT", options, payload);
  }

  /*
  Deletes a resource asynchronously using the DELETE method. 
  @param options - Optional request options 
  @returns A Promise that resolves to the response data 
  **/
  async delete<TResponse>(options?: https.RequestOptions): Promise<TResponse> {
    return this.sendRequest<TResponse>("DELETE", options);
  }

  /*
  Sends a request with a method, options, and optional payload. 
  @param method - The request method (GET, POST, PUT, DELETE, etc.) 
  @param options - Optional request options 
  @param payload - The request payload (optional) 
  @returns A Promise that resolves to the response data 
  */
  private async sendRequest<T>(
    method: string,
    options?: any,
    payload?: any,
    jwtToken?: string
  ): Promise<T> {
    const defaultHeader = this.generateRequestHeader(jwtToken);
    options.header = { ...options.header, ...defaultHeader };
    return new Promise<T>((resolve, reject) => {
      const requestOptions: https.RequestOptions = {
        method,
        ...options,
      };
      const req: ClientRequest = https.request(requestOptions, (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          try {
            if (res.statusCode && res.statusCode < 500) {
              try {
                // TODO need to look into response type especially for getSchemas
                console.log(data);
                if (Array.isArray(data)) {
                  console.log({ array: data });
                  data = JSON.stringify(data);
                }
                if (typeof data !== "string") {
                  console.log({ string: data });
                  data = JSON.stringify(data);
                }
                const parsedData = JSON.parse(data);
                resolve(parsedData);
              } catch (error: any) {
                console.log(error);
                reject(
                  new Error(`Failed to parse response data: ${error.message}`)
                );
                throw error;
              }
            } else {
              reject(
                new Error(`Request failed with status code ${res.statusCode}`)
              );
            }
          } catch (error: any) {
            this.logger.error(
              "An error occurred during the API request.",
              JSON.stringify(error),
              error
            );
            throw error;
          }
        });
      });
      req.on("error", (error) => {
        this.logger.error(
          "An error occurred during the API request.",
          JSON.stringify(error),
          error
        );
        reject(error);
        throw error;
      });
      req.write(payload);
      req.end();
    });
  }

  /**
   * Returns an object with the required headers for API requests.
   * The authorization header uses a JWT token stored in local storage, which has a lifespan of 4 days (4 * 24 * 60 * 60).
   * @returns An object with the "Authorization" and "Content-Type" headers
   */
  private generateRequestHeader(jwtToken?: string): Record<string, string> {
    return {
      [RequestHeader.AUTHORIZATION]: `Bearer ${jwtToken}`,
      [RequestHeader.CONTENT_TYPE]: "application/json",
      [RequestHeader.CONNECTION]: "keep-alive",
      [RequestHeader.ACCEPT]: "*/*",
    };
  }

  private generateRequestOptions(
    method: string,
    path: string,
    baseUrl: string,
    jwtToken?: string
  ): IRequestOptions {
    const headers = this.generateRequestHeader(jwtToken);
    const options: IRequestOptions = {
      hostname: baseUrl,
      path,
      method: method.toUpperCase(),
      headers,
    };
    return options;
  }

  /**
   * Initiates a request to the server with the provided data and request type.
   * @param url - The URL of the request.
   * @param data - The data to be sent with the request.
   * @param requestType - The type of request (either "post" or "get").
   * @param requestToken - An optional request token for authentication.
   * @returns A promise that resolves to the response from the server.
   */
  async inititateRequest<T>(
    method: string,
    path: string,
    baseUrl: string,
    data: any,
    jwtToken?: string
  ): Promise<T | undefined> {
    try {
      const requestOptions: IRequestOptions = this.generateRequestOptions(
        method,
        path,
        baseUrl,
        jwtToken
      );
      let response: T | undefined;
      switch (method) {
        case HTTP_VERBS.GET:
          response = await this.get(
            Buffer.from(JSON.stringify({})),
            requestOptions
          );
        case HTTP_VERBS.POST:
          response = await this.post(
            Buffer.from(JSON.stringify(data)),
            requestOptions
          );
          break;
        default:
          break;
      }
      if (!response) {
        throw new Error("API call failed");
      }
      return response;
    } catch (error: any) {
      this.logger.error(
        "An error occurred during the API request.",
        JSON.stringify(error),
        error
      );
      throw error;
    }
  }
}
