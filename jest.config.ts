import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/client/src/$1",
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    "@shared/(.*)$": "<rootDir>/shared/$1",
  },
  testMatch: [
    "<rootDir>/client/src/**/*.test.{ts,tsx}",
    "<rootDir>/server/**/*.test.{ts,tsx}",
  ],
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.json",
      },
    ],
  },
  globals: {
    "ts-jest": {
      isolatedModules: true,
    },
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  testEnvironmentOptions: {
    customExportConditions: [""],
  },
  // Adding these options to make tests run faster
  maxWorkers: 1,
  testTimeout: 10000,
  verbose: true,
  forceExit: true,
  detectOpenHandles: true,
  // Setup specific configs for different test environments
  projects: [
    {
      displayName: "client",
      testEnvironment: "jsdom",
      testMatch: ["<rootDir>/client/src/**/*.test.{ts,tsx}"],
    },
    {
      displayName: "server",
      testEnvironment: "node",
      testMatch: ["<rootDir>/server/**/*.test.{ts,tsx}"],
    },
  ],
};

export default config;
