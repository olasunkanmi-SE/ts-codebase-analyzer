export interface IRequestHandler<TRequest, TResponse> {
  handle(request?: TRequest): Promise<TResponse>;
}
