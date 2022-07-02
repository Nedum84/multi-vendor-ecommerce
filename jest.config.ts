import type { Config } from "@jest/types";

const config: Config.InitialOptions = {
  testTimeout: 20000,
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["src"],
  setupFilesAfterEnv: ["./src/ec-test-utils/global.test.signin.ts"],
  globalSetup: "./src/ec-test-utils/setup.ts",
  globalTeardown: "./src/ec-test-utils/teardown.ts",
};

export default config;
