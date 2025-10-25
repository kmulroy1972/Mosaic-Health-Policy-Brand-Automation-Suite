import fs from 'fs';
import http from 'http';
import path from 'path';

const port = Number(process.env.PORT ?? 3000);
const publicDir = path.resolve(__dirname, '../public');
const indexHtmlPath = path.join(publicDir, 'index.html');

const cspHeader = [
  "default-src 'self' https://*.officeapps.live.com https://*.microsoftonline.com",
  "script-src 'self' https://*.officeapps.live.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https://*.sharepoint.com",
  "connect-src 'self' https://*.officeapps.live.com https://login.microsoftonline.com https://graph.microsoft.com https://*.azurewebsites.net https://*.azurefd.net",
  "font-src 'self' data:",
  "frame-ancestors 'self' https://*.officeapps.live.com"
].join('; ');

const server = http.createServer((req, res) => {
  const { url = '/' } = req;
  const filePath = url === '/' ? indexHtmlPath : path.join(publicDir, url);

  if (!filePath.startsWith(publicDir)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.writeHead(404, { 'Content-Type': 'text/plain', 'Content-Security-Policy': cspHeader });
      res.end('Not found');
      return;
    }

    const contentType = filePath.endsWith('.html')
      ? 'text/html; charset=utf-8'
      : 'text/plain; charset=utf-8';
    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Security-Policy': cspHeader,
      'Cache-Control': 'no-store'
    });
    res.end(data);
  });
});

if (require.main === module) {
  server.listen(port, () => {
    console.log(`Dev host listening on http://localhost:${port}`);
  });
}

export default server;
