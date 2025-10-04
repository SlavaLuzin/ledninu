// new function: serves current deld content from local function storage or falls back to bundled deld.txt
const fs = require('fs');
const path = require('path');

exports.handler = async function() {
  try {
    // const dataPath = path.join(__dirname, 'data', 'deld.txt');
    // if (fs.existsSync(dataPath)) {
    //   const txt = fs.readFileSync(dataPath, 'utf8');
    //   return { statusCode: 200, headers: { 'Content-Type':'text/plain; charset=utf-8' }, body: txt };
    // }
    // fallback to bundled static file next to repo root (attempt)
    const fallback = path.join(__dirname, '..', '..', 'deld.txt');
    if (fs.existsSync(fallback)) {
      const txt = fs.readFileSync(fallback, 'utf8');
      return { statusCode: 200, headers: { 'Content-Type':'text/plain; charset=utf-8' }, body: txt };
    }
    return { statusCode: 404, body: 'deld.txt not found' };
  } catch (e) {
    return { statusCode: 500, body: e.message };
  }
};