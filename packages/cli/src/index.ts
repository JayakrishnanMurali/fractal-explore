#!/usr/bin/env node

import { startFractalExplore } from "@fractal-explore/cli/commands/start";
import { Command } from "commander";

const program = new Command();

program
  .name("fractal-explore")
  .description("Zero-config component explorer for React applications")
  .version("1.0.0")
  .option("-p, --port <port>", "Port Number", "3434")
  .option("-d, --dir <directory>", "Component directory", "src/components")
  .option("--no-cache", "Disable caching")
  .action(async (options) => {
    try {
      await startFractalExplore(options);
    } catch (error) {
      console.error(
        "❌ Error:",
        error instanceof Error ? error.message : "Unknown error"
      );
      process.exit(1);
    }
  });

program.parse();
