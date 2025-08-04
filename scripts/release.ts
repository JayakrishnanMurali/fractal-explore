#!/usr/bin/env bun

import { $ } from "bun";
import { bundleForDistribution } from "./bundle";
import { existsSync } from "fs";

async function release() {
  console.log("🚀 Starting release process...");

  try {
    console.log("🧪 Running tests...");
    await runTests();

    console.log("🏗️  Building packages...");
    await bundleForDistribution();

    console.log("📝 Version update (manual step)");
    console.log("   Run: npm version patch|minor|major");

    console.log("🏷️  Git tagging (manual step)");
    console.log("   Git tag will be created automatically by npm version");

    console.log("📦 Ready to publish...");
    console.log("   Run: npm publish ./dist --access public");

    console.log("✅ Release preparation complete!");
    console.log("");
    console.log("📋 Next steps:");
    console.log("   1. npm version patch|minor|major");
    console.log("   2. npm publish ./dist --access public");
    console.log("   3. git push --tags");
  } catch (error) {
    console.error("❌ Release failed:", error);
    process.exit(1);
  }
}

async function runTests() {
  try {
    await $`bun test`;
  } catch (error) {
    console.error("❌ Tests failed");
    throw error;
  }
}

async function publishToNpm() {
  if (!existsSync("./dist")) {
    throw new Error("Distribution not found. Run build first.");
  }

  try {
    await $`npm publish ./dist --access public`;
    console.log("✅ Published to npm successfully!");
  } catch (error) {
    console.error("❌ Failed to publish to npm");
    throw error;
  }
}

// Run if called directly
if (import.meta.main) {
  release().catch(console.error);
}

export { release, publishToNpm };
