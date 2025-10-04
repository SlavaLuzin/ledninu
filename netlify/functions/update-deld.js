const fetch = require('node-fetch');

/*
Netlify Function: обновляет deld.txt в GitHub репозитории.
Требует настроить в Netlify:
- GITHUB_TOKEN (personal access token с правом repo)
- GITHUB_REPO в формате owner/repo
- GITHUB_BRANCH (опционально, default: main)

Запрос:
POST with JSON { content: "<file content as string>" }

Ответ — результат GitHub API (JSON).
*/

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  const env = process.env;
  const token = env.GITHUB_TOKEN;
  const repo = env.GITHUB_REPO;
  const branch = env.GITHUB_BRANCH || 'main';

  if (!token || !repo) {
    return { statusCode: 500, body: JSON.stringify({ message: 'Server not configured: set GITHUB_TOKEN and GITHUB_REPO in Netlify settings.' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ message: 'Invalid JSON' }) };
  }
  const content = body.content ?? '';
  const path = 'deld.txt';
  try {
    // get current file to obtain sha
    const getUrl = `https://api.github.com/repos/${repo}/contents/${encodeURIComponent(path)}?ref=${branch}`;
    const getRes = await fetch(getUrl, { headers: { Authorization: `token ${token}`, 'User-Agent': 'Netlify-Function' }});
    const getJson = await getRes.json();

    let sha = getJson.sha;

    const putUrl = `https://api.github.com/repos/${repo}/contents/${encodeURIComponent(path)}`;
    const payload = {
      message: `Update ${path} via Netlify admin`,
      content: Buffer.from(content, 'utf8').toString('base64'),
      branch
    };
    if (sha) payload.sha = sha;

    const putRes = await fetch(putUrl, {
      method: 'PUT',
      headers: { Authorization: `token ${token}`, 'User-Agent': 'Netlify-Function', 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const putJson = await putRes.json();
    if (!putRes.ok) {
      return { statusCode: putRes.status, body: JSON.stringify(putJson) };
    }
    return { statusCode: 200, body: JSON.stringify(putJson) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ message: err.message }) };
  }
};

