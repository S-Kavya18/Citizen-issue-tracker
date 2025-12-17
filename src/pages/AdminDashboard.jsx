import React, { useEffect, useState } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function formatDate(s) {
  if (!s) return '-';
  try { return new Date(s).toLocaleString(); } catch { return s; }
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [feedback, setFeedback] = useState([]);
  const [citizens, setCitizens] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [resolvedIssues, setResolvedIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    const p1 = fetch(`${API_URL}/admin/verification-dashboard`, { credentials: 'include' })
      .then(r => r.json())
      .then(setStats)
      .catch(e => console.error('verification-dashboard', e));

    const p2 = fetch(`${API_URL}/admin/feedbacks`, { credentials: 'include' })
      .then(r => r.json())
      .then(d => setFeedback(d.rows || d || []))
      .catch(e => console.error('feedbacks', e));

    const p3 = fetch(`${API_URL}/admin/citizens`, { credentials: 'include' })
      .then(r => r.json())
      .then(d => setCitizens(d.rows || d || []))
      .catch(e => console.error('citizens', e));

    const p4 = fetch(`${API_URL}/admin/volunteers`, { credentials: 'include' })
      .then(r => r.json())
      .then(d => setVolunteers(d.rows || d || []))
      .catch(e => console.error('volunteers', e));

    const p5 = fetch(`${API_URL}/admin/issues`, { credentials: 'include' })
      .then(r => r.json())
      .then(d => {
        const rows = d.rows || d || [];
        const resolved = rows.filter(i => i.status === 'resolved' || i.resolved === 1 || i.resolved === true);
        setResolvedIssues(resolved);
      })
      .catch(e => console.error('issues', e));

    Promise.all([p1, p2, p3, p4, p5]).finally(() => setLoading(false));
  }, []);

  async function fetchUser(id) {
    try {
      const res = await fetch(`${API_URL}/admin/users/${id}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch user');
      const data = await res.json();
      setSelectedUser(data);
    } catch (e) {
      alert('Unable to fetch user details');
      console.error(e);
    }
  }

  async function verifyVolunteer(id) {
    if (!confirm('Mark this volunteer as verified?')) return;
    try {
      const res = await fetch(`${API_URL}/admin/users/${id}/verify`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verified: true })
      });
      if (!res.ok) throw new Error('Verify failed');
      // update local state
      setVolunteers(vs => vs.map(v => v.id === id ? { ...v, verified: 1 } : v));
      alert('Volunteer verified');
    } catch (e) {
      alert('Failed to verify volunteer');
      console.error(e);
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <h2>Admin Dashboard</h2>

      <section style={{ marginBottom: 24 }}>
        <h3>Verification Stats</h3>
        <pre style={{ background: '#f3f4f6', padding: 12 }}>{JSON.stringify(stats, null, 2)}</pre>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h3>Citizens ({citizens.length})</h3>
        {loading ? <p>Loading...</p> : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: 8 }}>ID</th>
                  <th style={{ textAlign: 'left', padding: 8 }}>Name</th>
                  <th style={{ textAlign: 'left', padding: 8 }}>Email</th>
                    <th style={{ textAlign: 'left', padding: 8 }}>Phone</th>
                  <th style={{ textAlign: 'left', padding: 8 }}>District</th>
                  <th style={{ textAlign: 'left', padding: 8 }}>Created</th>
                    <th style={{ textAlign: 'left', padding: 8 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {citizens.map(u => (
                  <tr key={u.id}>
                    <td style={{ padding: 8 }}>{u.id}</td>
                    <td style={{ padding: 8 }}>{u.name || u.displayName || '-'}</td>
                    <td style={{ padding: 8 }}>{u.email}</td>
                      <td style={{ padding: 8 }}>{u.phone || '-'}</td>
                    <td style={{ padding: 8 }}>{u.district || '-'}</td>
                    <td style={{ padding: 8 }}>{formatDate(u.created_at || u.created)}</td>
                      <td style={{ padding: 8 }}>
                        <button onClick={() => fetchUser(u.id)} style={{ marginRight: 8 }}>View</button>
                      </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section style={{ marginBottom: 24 }}>
        <h3>Volunteers ({volunteers.length})</h3>
        {loading ? <p>Loading...</p> : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: 8 }}>ID</th>
                  <th style={{ textAlign: 'left', padding: 8 }}>Name</th>
                  <th style={{ textAlign: 'left', padding: 8 }}>Email</th>
                  <th style={{ textAlign: 'left', padding: 8 }}>Phone</th>
                  <th style={{ textAlign: 'left', padding: 8 }}>District</th>
                  <th style={{ textAlign: 'left', padding: 8 }}>Verified</th>
                  <th style={{ textAlign: 'left', padding: 8 }}>Created</th>
                  <th style={{ textAlign: 'left', padding: 8 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {volunteers.map(u => (
                  <tr key={u.id}>
                    <td style={{ padding: 8 }}>{u.id}</td>
                    <td style={{ padding: 8 }}>{u.name || u.displayName || '-'}</td>
                    <td style={{ padding: 8 }}>{u.email}</td>
                    <td style={{ padding: 8 }}>{u.phone || '-'}</td>
                    <td style={{ padding: 8 }}>{u.district || '-'}</td>
                    <td style={{ padding: 8 }}>{u.verified ? 'Yes' : 'No'}</td>
                    <td style={{ padding: 8 }}>{formatDate(u.created_at || u.created)}</td>
                    <td style={{ padding: 8 }}>
                      <button onClick={() => fetchUser(u.id)} style={{ marginRight: 8 }}>View</button>
                      {!u.verified && (
                        <button onClick={() => verifyVolunteer(u.id)}>Verify</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h3>Resolved Issues ({resolvedIssues.length})</h3>
        {loading ? <p>Loading...</p> : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: 8 }}>ID</th>
                  <th style={{ textAlign: 'left', padding: 8 }}>Title</th>
                  <th style={{ textAlign: 'left', padding: 8 }}>Status</th>
                  <th style={{ textAlign: 'left', padding: 8 }}>Resolved By</th>
                  <th style={{ textAlign: 'left', padding: 8 }}>Resolved At</th>
                  <th style={{ textAlign: 'left', padding: 8 }}>District</th>
                </tr>
              </thead>
              <tbody>
                {resolvedIssues.map(i => (
                  <tr key={i.id}>
                    <td style={{ padding: 8 }}>{i.id}</td>
                    <td style={{ padding: 8 }}>{i.title || i.summary || i.description?.slice?.(0, 60) || '-'}</td>
                    <td style={{ padding: 8 }}>{i.status || (i.resolved ? 'resolved' : 'open')}</td>
                    <td style={{ padding: 8 }}>{i.resolved_by || i.resolver || '-'}</td>
                    <td style={{ padding: 8 }}>{formatDate(i.resolved_at || i.updated_at || i.closed_at)}</td>
                    <td style={{ padding: 8 }}>{i.district || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
