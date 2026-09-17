import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { env } from "../config/env";
import { ApiError } from "../utils/ApiError";

const joseModulePromise = import("jose");
const jwksPromise = joseModulePromise.then(({ createRemoteJWKSet }) =>
	createRemoteJWKSet(new URL(env.THUNDERID_JWKS_URI))
);
const subjectSchema = z.string().uuid("Invalid subject claim");

const tokenTypeOverride = process.env.THUNDERID_ACCESS_TOKEN_TYP?.trim();
const shouldValidateTyp = tokenTypeOverride !== "" && tokenTypeOverride !== "any";

const verifyOptions = {
	issuer: env.THUNDERID_ISSUER,
	audience: env.THUNDERID_AUDIENCE,
	...(shouldValidateTyp ? { typ: tokenTypeOverride ?? "at+jwt" } : {})
};

function unauthorized(message: string): ApiError {
	return new ApiError(401, message);
}

export async function checkJwt(req: Request, _res: Response, next: NextFunction): Promise<void> {
	const authorizationHeader = req.header("authorization");

	if (!authorizationHeader) {
		next(unauthorized("Missing Authorization header"));
		return;
	}

	const [scheme, token, ...rest] = authorizationHeader.trim().split(/\s+/);

	if (scheme?.toLowerCase() !== "bearer" || !token || rest.length > 0) {
		next(unauthorized("Invalid Authorization header format"));
		return;
	}

	try {
		const jose = await joseModulePromise;
		const jwks = await jwksPromise;
		const { payload } = await jose.jwtVerify(token, jwks, verifyOptions);
		const parsedSubject = subjectSchema.safeParse(payload.sub);

		if (!parsedSubject.success) {
			next(unauthorized("Invalid access token subject"));
			return;
		}

		req.auth = {
			sub: parsedSubject.data,
			claims: payload
		};

		next();
	} catch (error: unknown) {
		const jose = await joseModulePromise;

		if (error instanceof jose.errors.JOSEError) {
			next(unauthorized("Invalid or expired access token"));
			return;
		}

		next(unauthorized("Unable to verify access token"));
	}
}