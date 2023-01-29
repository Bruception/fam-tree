import express from 'express';
import { buildRoutes } from './routes';

export function buildApp() {
  const app = express();

  app.use(express.json());

  buildRoutes(app);

  return app;
}
