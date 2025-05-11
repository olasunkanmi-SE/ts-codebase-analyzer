import { ClientRequest, IncomingMessage } from "http";
import * as https from "https";
import { HttpClient } from "./http-service";

jest.mock("https");
jest.mock("../logger");

describe("HttpClient", () => {
  let httpClient: HttpClient;
  let mockRequest: jest.Mock;
  let mockResponse: Partial<IncomingMessage>;

  beforeEach(() => {
    httpClient = new HttpClient();
    mockRequest = jest.fn();
    mockResponse = {
      on: jest.fn(),
      statusCode: 200,
    };

    (https.request as jest.Mock).mockImplementation((options, callback) => {
      callback(mockResponse as IncomingMessage);
      return {
        on: jest.fn(),
        write: jest.fn(),
        end: jest.fn(),
      } as unknown as ClientRequest;
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("get", () => {
    it("Should send a Get request and return passed data", async () => {
      const mockData = { key: "value" };
      mockResponse.on = jest.fn().mockImplementation((event, callback) => {
        if (event === "data") callback(JSON.stringify(mockData));
        if (event === "end") callback();
      });

      const result = await httpClient.get({}, { path: "/test" });

      expect(https.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: "GET",
          path: "/test",
        }),
        expect.any(Function),
      );
      expect(result).toEqual(mockData);
    });
  });

  describe("post", () => {
    it("should send a POST request with payload and return parsed data", async () => {
      const mockPayload = { data: "test" };
      const mockData = { created: true };
      mockResponse.on = jest.fn().mockImplementation((event, callback) => {
        if (event === "data") callback(JSON.stringify(mockData));
        if (event === "end") callback();
      });

      const result = await httpClient.post(mockPayload, { path: "/test" });

      expect(https.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: "POST",
          path: "/test",
        }),
        expect.any(Function),
      );
      expect(result).toEqual(mockData);
    });
  });

  describe("put", () => {
    it("should send a PUT request with payload and return parsed data", async () => {
      const mockPayload = { data: "test" };
      mockResponse.on = jest.fn().mockImplementation((event, callback) => {
        if (event === "data") callback(JSON.stringify(mockResponse));
        if (event === "end") callback();
      });

      const result = await httpClient.put(mockPayload, { path: "/test" });

      expect(https.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: "PUT",
          path: "/test",
        }),
        expect.any(Function),
      );
      expect(result).toEqual({ statusCode: 200 });
    });
  });

  describe("delete", () => {
    it("should send a DELETE request and return parsed data", async () => {
      mockResponse.on = jest.fn().mockImplementation((event, callback) => {
        if (event === "data") callback(JSON.stringify(mockResponse));
        if (event === "end") callback();
      });

      const result = await httpClient.delete({ path: "/test" });

      expect(https.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: "DELETE",
          path: "/test",
        }),
        expect.any(Function),
      );
      expect(result).toEqual({ statusCode: 200 });
    });
  });

  describe("error handling", () => {
    it("should reject the promise if status code is 500 or greater", async () => {
      mockResponse.statusCode = 500;
      mockResponse.on = jest.fn().mockImplementation((event, callBack) => {
        if (event === "end") callBack();
      });

      await expect(httpClient.get({}, { path: "/test" })).rejects.toThrow(
        "Request failed with status code 500",
      );
    });

    it("should reject the promise if JSON parsing fails", async () => {
      mockResponse.on = jest.fn().mockImplementation((event, callback) => {
        if (event === "data") callback("Invalid JSON");
        if (event === "end") callback();
      });

      await expect(httpClient.get({}, { path: "/test" })).rejects.toThrow(
        "Failed to parse response data",
      );
    });
  });

  // describe("generateHeader", () => {
  //   it("should return the correct default headers", () => {
  //     const headers = httpClient.generateHeader();
  //     expect(headers).toEqual({
  //       "Content-Type": "application/json",
  //       connection: "keep-alive",
  //       accept: "*/*",
  //     });
  //   });
  // });
});
