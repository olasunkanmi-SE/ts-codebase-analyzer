module.exports = {
  roots: ["<rootDir>/src"],
  testEnvironment: "node",
  testMatch: ["**/*.(spec|test).ts"],
  moduleDirectories: ["node_modules", "src"],
  transform: {
    "^.+\\.ts$": "ts-jest",
    "\\.[jt]sx?$": "babel-jest",
  },
  testPathIgnorePatterns: ["/dist/"],
};
