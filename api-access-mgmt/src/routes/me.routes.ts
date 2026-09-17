import type { NextFunction, Request, Response } from "express";
import { Router } from "express";
import { checkJwt } from "../middleware/checkJwt";
import { ApiError } from "../utils/ApiError";

const router = Router();

function getAuth(req: Request): NonNullable<Request["auth"]> {
	if (!req.auth) {
		throw new ApiError(401, "Authentication context is missing");
	}

	return req.auth;
}

function asyncHandler(
	handler: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
	return (req: Request, res: Response, next: NextFunction): void => {
		handler(req, res, next).catch(next);
	};
}

router.get(
	"/",
	checkJwt,
	asyncHandler(async (req, res) => {
		const auth = getAuth(req);
		res.json({
			sub: auth.sub,
			claims: auth.claims
		});
	})
);

export default router;