const http = require('http');

function post(url, data) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const postData = JSON.stringify(data);
    const req = http.request({
      hostname: u.hostname,
      port: u.port,
      path: u.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({
        status: res.statusCode,
        headers: res.headers,
        body
      }));
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

function get(url, cookie) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = http.request({
      hostname: u.hostname,
      port: u.port,
      path: u.pathname,
      method: 'GET',
      headers: {
        'Cookie': cookie || ''
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({
        status: res.statusCode,
        headers: res.headers,
        body
      }));
    });
    req.on('error', reject);
    req.end();
  });
}

async function run() {
  try {
    console.log("Logging in...");
    const loginRes = await post('http://localhost:3000/api/auth/login', { email: 'dada@vireontech.in' });
    console.log("Login Status:", loginRes.status);
    console.log("Login Body:", loginRes.body);
    
    const setCookie = loginRes.headers['set-cookie'];
    console.log("Cookie received:", setCookie);
    
    if (!setCookie) {
      console.error("No cookie received from login!");
      return;
    }
    
    const cookie = setCookie[0].split(';')[0];
    console.log("Cleaned Cookie:", cookie);
    
    console.log("\nFetching /api/projects...");
    const projRes = await get('http://localhost:3000/api/projects', cookie);
    console.log("Projects Status:", projRes.status);
    console.log("Projects Body:", projRes.body);

    console.log("\nFetching /api/dashboard...");
    const dashRes = await get('http://localhost:3000/api/dashboard', cookie);
    console.log("Dashboard Status:", dashRes.status);
    console.log("Dashboard Body:", dashRes.body);
  } catch(err) {
    console.error("Fetch test threw error:", err);
  }
}

run();
