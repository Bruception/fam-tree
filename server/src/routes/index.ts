import { Express, Router } from 'express';
import { router as treesRouter } from './trees';

const ROUTE_MAP: Record<string, Router> = {
  trees: treesRouter,
};

export function buildRoutes(app: Express) {
  for (const [route, router] of Object.entries(ROUTE_MAP)) {
    const routePath = `/${route}`;
    app.use(routePath, router);
  }
}
