import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
	PORT: z.coerce.number().int().positive().default(4000),
	NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
	DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
	CORS_ORIGIN: z.string().url().default("http://localhost:5173"),
	THUNDERID_ISSUER: z.string().url("THUNDERID_ISSUER must be a valid URL"),
	THUNDERID_JWKS_URI: z.string().url("THUNDERID_JWKS_URI must be a valid URL"),
	THUNDERID_AUDIENCE: z.string().min(1, "THUNDERID_AUDIENCE is required")
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
	const message = parsedEnv.error.issues
		.map((issue) => `${issue.path.join(".")}: ${issue.message}`)
		.join("; ");
	throw new Error(`Invalid environment variables: ${message}`);
}

export const env = parsedEnv.data;
