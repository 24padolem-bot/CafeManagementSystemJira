import React, { useEffect, useState } from 'react';

interface JiraIssue {
  id: string;
  key: string;
  fields: {
    summary: string;
    status: {
      name: string;
    };
  };
}

export const JiraSection: React.FC = () => {
  const [issues, setIssues] = useState<JiraIssue[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchJiraIssues() {
      try {
        const res = await fetch('/api/jira/issues');
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Failed to fetch issues');
        }

        setIssues(data.issues || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchJiraIssues();
  }, []);

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '16px' }}>
        Jira Project Issues
      </h2>

      {loading && <p>Loading tickets from Jira...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      {!loading && !error && issues.length === 0 && (
        <p>No issues found in your Jira project.</p>
      )}

      <div style={{ display: 'grid', gap: '12px' }}>
        {issues.map((issue) => (
          <div
            key={issue.id}
            style={{
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '16px',
              backgroundColor: '#ffffff',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}
          >
            <div style={{ fontWeight: '600', fontSize: '1.1rem' }}>
              <span style={{ color: '#2563eb', marginRight: '8px' }}>{issue.key}</span>
              {issue.fields.summary}
            </div>
            <div style={{ marginTop: '8px', fontSize: '0.875rem', color: '#4b5563' }}>
              Status: <span style={{ fontWeight: '500', color: '#059669' }}>{issue.fields.status.name}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
