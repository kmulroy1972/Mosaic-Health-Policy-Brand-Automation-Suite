import fs from 'fs';
import http from 'http';
import https from 'https';
import path from 'path';

const port = Number(process.env.PORT ?? 3000);
const useHttps = process.env.HTTPS !== 'false';
const publicDir = path.resolve(__dirname, '../public');
const indexHtmlPath = path.join(publicDir, 'index.html');

const cspHeader = [
  "default-src 'self' https://cdn.mosaichealthpolicy.com https://api.mosaichealthpolicy.com https://*.officeapps.live.com https://*.microsoftonline.com https://appsforoffice.microsoft.com",
  "script-src 'self' 'unsafe-inline' https://cdn.mosaichealthpolicy.com https://*.officeapps.live.com https://appsforoffice.microsoft.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https://*.sharepoint.com",
  "connect-src 'self' https://cdn.mosaichealthpolicy.com https://api.mosaichealthpolicy.com https://*.officeapps.live.com https://appsforoffice.microsoft.com https://login.microsoftonline.com https://graph.microsoft.com https://*.azurewebsites.net https://*.azurefd.net",
  "font-src 'self' data:",
  "frame-ancestors 'self' https://*.officeapps.live.com"
].join('; ');

const requestHandler = (req: http.IncomingMessage, res: http.ServerResponse) => {
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

    let contentType = 'text/plain; charset=utf-8';
    if (filePath.endsWith('.html')) {
      contentType = 'text/html; charset=utf-8';
    } else if (filePath.endsWith('.css')) {
      contentType = 'text/css; charset=utf-8';
    } else if (filePath.endsWith('.js')) {
      contentType = 'application/javascript; charset=utf-8';
    } else if (filePath.endsWith('.json')) {
      contentType = 'application/json; charset=utf-8';
    } else if (filePath.endsWith('.png')) {
      contentType = 'image/png';
    } else if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
      contentType = 'image/jpeg';
    } else if (filePath.endsWith('.svg')) {
      contentType = 'image/svg+xml';
    }

    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Security-Policy': cspHeader,
      'Cache-Control': 'no-store',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(data);
  });
};

let server: http.Server | https.Server;

if (useHttps) {
  const certPath = path.join(process.env.HOME || '', '.office-addin-dev-certs');
  const certOptions = {
    key: fs.readFileSync(path.join(certPath, 'localhost.key')),
    cert: fs.readFileSync(path.join(certPath, 'localhost.crt'))
  };
  server = https.createServer(certOptions, requestHandler);
} else {
  server = http.createServer(requestHandler);
}

if (require.main === module) {
  server.listen(port, () => {
    const protocol = useHttps ? 'https' : 'http';
    console.log(`Dev host listening on ${protocol}://localhost:${port}`);
  });
}

export default server;
