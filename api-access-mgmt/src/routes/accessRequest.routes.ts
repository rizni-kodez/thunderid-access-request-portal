import type { NextFunction, Request, Response } from "express";
import { Router } from "express";
import {
  accessRequestIdParamSchema,
  accessRequestQuerySchema,
  createAccessRequestSchema,
  updateAccessRequestSchema
} from "../models/accessRequest.model";
import {
  createAccessRequest,
  deleteAccessRequest,
  listAccessRequests,
  updateAccessRequest
} from "../services/accessRequest.service";
import { validateRequest } from "../middleware/validateRequest";
import { checkJwt } from "../middleware/checkJwt";
import { ApiError } from "../utils/ApiError";

const router = Router();

router.use(checkJwt);

function getAuthenticatedSubject(req: Request): string {
  if (!req.auth?.sub) {
    throw new ApiError(401, "Authentication context is missing");
  }

  return req.auth.sub;
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
  validateRequest(accessRequestQuerySchema, "query"),
  asyncHandler(async (req, res) => {
    const requests = await listAccessRequests(req.query, getAuthenticatedSubject(req));
    res.json(requests);
  })
);

router.post(
  "/",
  validateRequest(createAccessRequestSchema, "body"),
  asyncHandler(async (req, res) => {
    const createdRequest = await createAccessRequest(req.body, getAuthenticatedSubject(req));
    res.status(201).json(createdRequest);
  })
);

router.patch(
  "/:id",
  validateRequest(accessRequestIdParamSchema, "params"),
  validateRequest(updateAccessRequestSchema, "body"),
  asyncHandler(async (req, res) => {
    const updatedRequest = await updateAccessRequest(
      req.params.id,
      req.body,
      getAuthenticatedSubject(req)
    );
    res.json(updatedRequest);
  })
);

router.delete(
  "/:id",
  validateRequest(accessRequestIdParamSchema, "params"),
  asyncHandler(async (req, res) => {
    await deleteAccessRequest(req.params.id, getAuthenticatedSubject(req));
    res.json({ message: "Access request deleted successfully" });
  })
);

router.all("*", (_req, res) => {
  res.status(405).json({ message: "Method not allowed on /api/access-requests" });
});

export default router;
