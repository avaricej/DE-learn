import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';

const assets = new Map([
  ['/', ['index.html', 'text/html']],
  ['/app.js', ['app.js', 'text/javascript']],
  ['/style.css', ['style.css', 'text/css']],
  ['/cards.json', ['cards.json', 'application/json']],
]);
const host = '127.0.0.1';
const port = Number(process.env.DE_LEARN_PORT ?? 8765);

createServer(async (request, response) => {
  const asset = assets.get(request.url.split('?')[0]);
  if (!asset) {
    response.writeHead(404).end();
    return;
  }
  const [file, type] = asset;
  try {
    const content = await readFile(new URL(file, import.meta.url));
    response.writeHead(200, {
      'Content-Type': type + '; charset=utf-8',
      'Cache-Control': 'no-store',
    }).end(content);
  } catch {
    response.writeHead(500).end();
  }
}).listen(port, host, () => {
  console.log('Справочник: http://' + host + ':' + port);
});
