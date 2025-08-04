import { ProjectDetector } from "@fractal-explore/cli/detector/project-detector";

interface StartOptions {
  port: string;
  dir: string;
  cache: boolean;
}

export async function startFractalExplore(options: StartOptions) {
  console.log("🔍 Fractal Explore v1.0.0\n");

  console.log("📁 Detecting project structure...");
  const detector = new ProjectDetector();
  const projectInfo = await detector.detect();

  console.log(`   ✅ React project detected (${projectInfo.buildTool})`);
  console.log(`   ✅ TypeScript: ${projectInfo.typescript ? "Yes" : "No"}`);
  console.log(
    `   ✅ Component directories: ${projectInfo.componentDirs.join(", ")}`
  );

  console.log("\n🚧 Component scanning coming next...");
  console.log("🚧 Web interface coming next...");
  console.log("🚧 Dev server coming next...");
}
