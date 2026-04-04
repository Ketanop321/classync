import React, { useEffect, useState } from 'react';
import { fetchTableRows, insertRow, updateRow, uploadShowCauseAttachment } from './services/supabaseMvpApi';

const ReplyPage = () => {
  const [reply, setReply] = useState('');
  const [file, setFile] = useState(null);
  const [newNoticeReason, setNewNoticeReason] = useState('');
  const [notices, setNotices] = useState([]);
  const [selectedNoticeId, setSelectedNoticeId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const loadNotices = async () => {
    setLoading(true);
    setError('');
    try {
      const rows = await fetchTableRows('show_cause_notices', {
        orderBy: 'created_at',
        orderConfig: { ascending: false },
      });
      setNotices(rows || []);
      if (rows && rows.length > 0) {
        setSelectedNoticeId(rows[0].id);
      }
    } catch (err) {
      setError(err.message || 'Failed to load show cause notices.');
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

    if (!selectedNoticeId) {
      setError('No show cause notice found.');
      return;
    }

    try {
      let attachmentPath = null;

      if (file) {
        attachmentPath = await uploadShowCauseAttachment(file);
      }

      await insertRow('show_cause_replies', {
        notice_id: selectedNoticeId,
        message: reply,
        attachment_path: attachmentPath,
      });

      await updateRow('show_cause_notices', selectedNoticeId, { status: 'replied' });

      alert('Reply submitted successfully!');
      setReply('');
      setFile(null);
      await loadNotices();
    } catch (err) {
      setError(err.message || 'Could not submit reply.');
    }
  };

  const createNotice = async (event) => {
    event.preventDefault();
    setError('');

    try {
      await insertRow('show_cause_notices', {
        reason: newNoticeReason,
        status: 'open',
      });
      setNewNoticeReason('');
      await loadNotices();
    } catch (err) {
      setError(err.message || 'Could not create show cause notice.');
    }
  };

  return (
    <div className="container mx-auto mt-6 sm:mt-10 p-4 sm:p-5 max-w-2xl border border-gray-300 rounded-md shadow-lg bg-white">
      <h2 className="text-xl sm:text-2xl font-bold mb-4">Reply to Show Cause Notice</h2>
      {error && <p className="text-red-600 mb-3">{error}</p>}

      {loading ? (
        <p className="text-gray-600">Loading notices...</p>
      ) : notices.length === 0 ? (
        <>
          <p className="text-gray-700 mb-4">No show cause notice found yet. Create one below.</p>
          <form onSubmit={createNotice} className="space-y-3 border rounded p-4">
            <input
              type="text"
              value={newNoticeReason}
              onChange={(event) => setNewNoticeReason(event.target.value)}
              placeholder="Reason for notice"
              className="border rounded p-2 w-full"
              required
            />
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Create Notice
            </button>
          </form>
        </>
      ) : (
        <>
          <form onSubmit={createNotice} className="mb-4 p-4 border rounded space-y-2">
            <h3 className="font-semibold">Create New Show Cause Notice</h3>
            <input
              type="text"
              value={newNoticeReason}
              onChange={(event) => setNewNoticeReason(event.target.value)}
              placeholder="Reason for notice"
              className="border rounded p-2 w-full"
              required
            />
            <button type="submit" className="bg-slate-700 text-white px-4 py-2 rounded hover:bg-slate-800">
              Add Notice
            </button>
          </form>

          <div className="mb-4">
            <label className="block mb-2 font-semibold">Select Notice</label>
            <select
              value={selectedNoticeId}
              onChange={(e) => setSelectedNoticeId(e.target.value)}
              className="border rounded p-2 w-full"
            >
              {notices.map((notice) => (
                <option key={notice.id} value={notice.id}>
                  {notice.reason} ({notice.status})
                </option>
              ))}
            </select>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <textarea
              value={reply}
              onChange={(event) => setReply(event.target.value)}
              placeholder="Write your reply here..."
              className="p-3 border border-gray-300 rounded-md w-full h-32"
              required
            />
            <input
              type="file"
              onChange={(event) => setFile(event.target.files?.[0] || null)}
              className="border border-gray-300 rounded-md p-2"
            />
            <button
              type="submit"
              className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition"
            >
              Submit Reply
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default ReplyPage;
