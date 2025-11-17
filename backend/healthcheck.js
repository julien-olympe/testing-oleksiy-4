require('http')
  .createServer((req, res) => {
    res.writeHead(200);
    res.end('OK');
  })
  .listen(3000);
