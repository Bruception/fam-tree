import { z } from 'zod';
import { RequestHandler } from 'express';

interface RequestSchema {
    body: z.ZodType;
    params: z.ZodType;
    headers: z.ZodType;
    query: z.ZodType;
};

export const validateRequest = (requestSchema: Partial<RequestSchema>): RequestHandler => {
    return (req, _res, next) => {
        Object.keys(requestSchema).forEach((key) => {
            const coercedKey = key as keyof RequestSchema;
            const status = requestSchema[coercedKey]?.safeParse(req[coercedKey]);

            if (!status?.success) {
                next(status?.error);
            };

            next();
        });
    };
};

type AsyncRequestHandler = (...params: Parameters<RequestHandler>) => Promise<any>;

export const asyncHandler = (handler: AsyncRequestHandler): RequestHandler => {
    return async (req, res, next) => {
        try {
            const data = await handler(req, res, next);

            if (!!data && !res.headersSent) {
                res.json(data);
            }

            next();
        } catch (err) {
            next(err);
        }
    };
};
