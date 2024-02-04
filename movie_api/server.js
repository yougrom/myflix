// file imports the http module and listens for requests on port 8080.
// const http = require('http');

// http.createServer((request, response) => {
//   response.writeHead(200, {'Content-Type': 'text/plain'});
//   response.end('Hello Node!\n');
// }).listen(8080);

// console.log('My first Node test server is running on Port 8080.');


// ****************************************************************

// variable declarations
// const http = require('http'),
//   fs = require('fs'),
//   url = require('url');

// // server creation
// // http.createServer((request, response) => {
// //   let addr = request.url,
// //     q = new URL(addr, 'http://localhost:8080'),
// //     filePath = '';

// //   if (q.pathname.includes('documentation')) {
// //     filePath = (__dirname + '/documentation.html');
// //   } else {
// //     filePath = 'index.html';
// //   }

// //   fs.readFile(filePath, (err, data) => {
// //     if (err) {
// //       throw err;
// //     }

// //     response.writeHead(200, { 'Content-Type': 'text/html' });
// //     response.write(data);
// //     response.end();

// //   });
  
// // }).listen(8080);
// // console.log('My test server is running on Port 8080.');










// a log of recent requests
const http = require('http'),
  fs = require('fs'),
  url = require('url');

http.createServer((request, response) => {
  let addr = request.url,
    q = new URL(addr, 'http://' + request.headers.host),
    filePath = '';

  fs.appendFile('log.txt', 'URL: ' + addr + '\nTimestamp: ' + new Date() + '\n\n', (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log('Added to log.');
    }
  });

  if (q.pathname.includes('documentation')) {
    filePath = (__dirname + '/documentation.html');
  } else {
    filePath = 'index.html';
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      throw err;
    }

    response.writeHead(200, { 'Content-Type': 'text/html' });
    response.write(data);
    response.end();

  });

}).listen(8082);
console.log('My test server is running on Port 8082.');
