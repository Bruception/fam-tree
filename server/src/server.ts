import { buildApp } from './app';

export function initServer() {
  const app = buildApp();

  const server = app.listen(8000, () => {
    console.log('Server up');
  });

  return server;
}

initServer();
