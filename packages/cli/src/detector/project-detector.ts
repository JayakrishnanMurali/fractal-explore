import { access } from "fs/promises";
import { readFile } from "fs/promises";
import { join } from "path";

export interface ProjectInfo {
  framework: "react";
  buildTool: "vite" | "webpack" | "next" | "cra" | "unknown";
  typescript: boolean;
  componentDirs: string[];
  rootPath: string;
}

export class ProjectDetector {
  async detect(cwd = process.cwd()): Promise<ProjectInfo> {
    const packageJsonPath = join(cwd, "package.json");

    try {
      const packageJson = JSON.parse(await readFile(packageJsonPath, "utf-8"));
      const deps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      };

      if (!deps.react) {
        throw new Error(
          "React is not a dependency of this project. Please run this command in a valid React project directory."
        );
      }

      const buildTool = this.detectBuildTool(deps, cwd);

      const typescript = Boolean(deps.typescript || deps["@types/react"]);

      const componentDirs = await this.findComponentDirs(cwd);

      return {
        framework: "react",
        buildTool,
        typescript,
        componentDirs,
        rootPath: cwd,
      };
    } catch (error) {
      if (error instanceof Error && error.message.includes("ENOENT")) {
        throw new Error(
          "No package.json found! Please run this command in a valid React project directory."
        );
      }
      throw error;
    }
  }

  private detectBuildTool(
    deps: Record<string, string>,
    cwd: string
  ): ProjectInfo["buildTool"] {
    if (deps.vite) return "vite";
    if (deps.webpack) return "webpack";
    if (deps.next) return "next";
    if (deps["react-scripts"]) return "cra";
    return "unknown";
  }

  private async findComponentDirs(cwd: string): Promise<string[]> {
    const commonDirs = [
      "src/components",
      "src/ui",
      "src/lib",
      "components",
      "ui",
      "lib",
      "src/pages/components",
      "app/components",
    ];

    const existingDirs = [];

    for (const dir of commonDirs) {
      try {
        await access(join(cwd, dir));
        existingDirs.push(dir);
      } catch {
        // Directory doesn't exist, skip
      }
    }

    return existingDirs.length > 0 ? existingDirs : ["src/components"];
  }
}
