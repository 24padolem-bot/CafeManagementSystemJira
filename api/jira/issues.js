export default async function handler(req, res) {
  // 1. Allow CORS for cross-origin calls
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 2. Fetch environment variables
  const { JIRA_DOMAIN, JIRA_EMAIL, JIRA_API_TOKEN, JIRA_PROJECT_KEY } = process.env;

  if (!JIRA_DOMAIN || !JIRA_EMAIL || !JIRA_API_TOKEN || !JIRA_PROJECT_KEY) {
    return res.status(500).json({ 
      error: 'Missing Jira configuration environment variables on Vercel.' 
    });
  }

  // Basic Auth header setup using Email + API Token
  const authHeader = Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString('base64');
  const headers = {
    'Authorization': `Basic ${authHeader}`,
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  };

  try {
    // 3. GET Request: Fetch issues from the project
    if (req.method === 'GET') {
      const jql = encodeURIComponent(`project = "${JIRA_PROJECT_KEY}" ORDER BY created DESC`);
      const response = await fetch(`https://${JIRA_DOMAIN}/rest/api/3/search?jql=${jql}`, {
        headers
      });

      const data = await response.json();

      if (!response.ok) {
        return res.status(response.status).json({ error: data.errorMessages || 'Failed to fetch issues' });
      }

      return res.status(200).json(data);
    }

    // 4. POST Request: Create a new Jira issue
    if (req.method === 'POST') {
      const { summary, description, issueType = 'Task' } = req.body;

      if (!summary) {
        return res.status(400).json({ error: 'Summary is required' });
      }

      const bodyData = {
        fields: {
          project: { key: JIRA_PROJECT_KEY },
          summary: summary,
          description: {
            type: 'doc',
            version: 1,
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: description || '' }]
              }
            ]
          },
          issuetype: { name: issueType }
        }
      };

      const response = await fetch(`https://${JIRA_DOMAIN}/rest/api/3/issue`, {
        method: 'POST',
        headers,
        body: JSON.stringify(bodyData)
      });

      const data = await response.json();

      if (!response.ok) {
        return res.status(response.status).json({ error: data.errorMessages || 'Failed to create issue' });
      }

      return res.status(200).json(data);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
