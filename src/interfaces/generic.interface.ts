import { RequestHeader } from "../core/constants";

export type HeadersType = {
  [key in keyof RequestHeader]: string;
};

export interface IRequestOptions {
  hostname: string;
  path: string;
  method: string;
  headers?: any;
  jwtToken?: string;
}
