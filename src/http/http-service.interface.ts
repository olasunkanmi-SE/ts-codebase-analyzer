import * as https from "https";
export interface IHttpClient {
  get<T>(payload: T, options?: https.RequestOptions): Promise<T>;
  post<TRequest, TResponse>(
    payload: TRequest,
    options?: https.RequestOptions,
  ): Promise<TResponse>;
  put<TRequest, TResponse>(
    payload: TRequest,
    options?: https.RequestOptions,
  ): Promise<TResponse>;
  delete<TResponse>(options?: https.RequestOptions): Promise<TResponse>;
}
