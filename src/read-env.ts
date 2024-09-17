import dotenv from "dotenv";

export function readEnvVar(envVarName: string) {
	const envObj: Record<string, string> = {};
	dotenv.config({ path: "env.f4", processEnv: envObj });
	return envObj[envVarName] ?? process.env[envVarName] ?? "";
}
