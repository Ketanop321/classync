import React, { useEffect, useState } from 'react';
import { fetchTableRows, insertRow } from '../services/supabaseMvpApi';

const NoticePage = () => {
  const [notices, setNotices] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const loadNotices = async () => {
    setLoading(true);
    setError('');

    try {
      const rows = await fetchTableRows('notices', {
        orderBy: 'published_at',
        orderConfig: { ascending: false },
      });
      setNotices(rows || []);
    } catch (err) {
      setError(err.message || 'Failed to load notices.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotices();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      await insertRow('notices', {
        title,
        content,
        published_at: new Date().toISOString().slice(0, 10),
      });
      setTitle('');
      setContent('');
      await loadNotices();
    } catch (err) {
      setError(err.message || 'Could not create notice.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6">Announcements</h1>
      {error && <p className="text-red-600 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="mb-6 bg-white border rounded-lg shadow p-4 space-y-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Notice title"
          required
          className="w-full border rounded p-2"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Notice content"
          required
          className="w-full border rounded p-2"
          rows={4}
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Publish Notice
        </button>
      </form>

      {loading ? (
        <p className="text-gray-600">Loading notices...</p>
      ) : notices.length === 0 ? (
        <p className="text-gray-600">No notices published yet.</p>
      ) : (
        <div className="space-y-4">
          {notices.map((notice) => (
            <div key={notice.id} className="p-4 border border-gray-300 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
              <h2 className="text-xl font-semibold">{notice.title}</h2>
              <p className="text-gray-500 text-sm">{notice.published_at}</p>
              <p className="mt-2 text-gray-700">{notice.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NoticePage;
