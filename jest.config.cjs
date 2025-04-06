module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/client/src/$1",
    "^@shared/(.*)$": "<rootDir>/shared/$1",
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
  },
  testMatch: [
    "<rootDir>/client/src/**/*.test.{ts,tsx}",
    "<rootDir>/server/**/*.test.{ts,tsx}",
  ],
  transform: {
    "^.+\\.(ts|tsx)$": ["babel-jest", { configFile: "./babel.config.cjs" }],
  },
  moduleDirectories: ["node_modules", "<rootDir>"],
  modulePaths: ["<rootDir>"],
  roots: ["<rootDir>"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  testEnvironmentOptions: {
    customExportConditions: [""],
  },
  maxWorkers: 1,
  testTimeout: 30000,
  verbose: true,
  forceExit: true,
  detectOpenHandles: true,
  // Setup specific configs for different test environments
  projects: [
    {
      displayName: "client",
      testEnvironment: "jsdom",
      testMatch: ["<rootDir>/client/src/**/*.test.{ts,tsx}"],
      setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
    },
    {
      displayName: "server",
      testEnvironment: "node",
      testMatch: ["<rootDir>/server/**/*.test.{ts,tsx}"],
    },
  ],
};
