export const MEMORY_CACHE_OPTIONS = {
  serviceName: "SharedKernel",
  accountName: "UserSession",
  sessionTTL: 24 * 60 * 60 * 1000,
};

export enum RequestHeader {
  AUTHORIZATION = "authorization",
  CONTENT_TYPE = "Content-Type",
  ACCEPT = "accept",
  CONNECTION = "connection",
}

export enum HTTP_VERBS {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
}
