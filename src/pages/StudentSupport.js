import React, { useEffect, useMemo, useState } from 'react';
import { fetchTableRows, insertRow } from '../services/supabaseMvpApi';

const StudentSupport = () => {
  const [supportRequest, setSupportRequest] = useState('');
  const [faqSearch, setFaqSearch] = useState('');
  const [feedback, setFeedback] = useState('');
  const [tickets, setTickets] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [notices, setNotices] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const loadSupportData = async () => {
    setLoading(true);
    setError('');

    try {
      const [ticketRows, faqRows, noticeRows] = await Promise.all([
        fetchTableRows('support_tickets', { orderBy: 'created_at', orderConfig: { ascending: false } }),
        fetchTableRows('faqs', { orderBy: 'created_at', orderConfig: { ascending: false } }),
        fetchTableRows('notices', { orderBy: 'published_at', orderConfig: { ascending: false } }),
      ]);

      setTickets(ticketRows || []);
      setFaqs(faqRows || []);
      setNotices(noticeRows || []);
    } catch (err) {
      setError(err.message || 'Failed to load support data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSupportData();
  }, []);

  const filteredFaqs = useMemo(() => {
    return faqs.filter((faq) => faq.question.toLowerCase().includes(faqSearch.toLowerCase()));
  }, [faqs, faqSearch]);

  const handleSubmitRequest = async (e) => {
    e.preventDefault();

    try {
      await insertRow('support_tickets', { message: supportRequest, status: 'open' });
      setSupportRequest('');
      await loadSupportData();
      alert('Support request submitted successfully.');
    } catch (err) {
      setError(err.message || 'Could not submit support request.');
    }
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();

    try {
      await insertRow('feedback_entries', { message: feedback });
      setFeedback('');
      alert('Feedback submitted successfully.');
    } catch (err) {
      setError(err.message || 'Could not submit feedback.');
    }
  };

  return (
    <div className="p-4 sm:p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-gray-800 mb-8">Student Support</h1>
      {error && <p className="text-red-600 mb-4">{error}</p>}

      <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4">Support Ticket</h2>
        <form onSubmit={handleSubmitRequest}>
          <textarea
            className="w-full p-3 border rounded-lg shadow-sm mt-2"
            rows="4"
            placeholder="Describe your issue..."
            value={supportRequest}
            onChange={(e) => setSupportRequest(e.target.value)}
            required
          />
          <button type="submit" className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-300">
            Submit Request
          </button>
        </form>

        <h3 className="text-xl font-semibold mt-6 mb-2">Your Tickets</h3>
        {loading ? (
          <p className="text-gray-600">Loading tickets...</p>
        ) : tickets.length === 0 ? (
          <p className="text-gray-600">No tickets yet.</p>
        ) : (
          <ul className="space-y-2">
            {tickets.map((ticket) => (
              <li key={ticket.id} className="border rounded p-2">
                <p className="font-medium">{ticket.message}</p>
                <p className="text-sm text-gray-600">Status: {ticket.status}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4">FAQs</h2>
        <input
          type="text"
          className="w-full p-3 border rounded-lg shadow-sm mb-4"
          placeholder="Search FAQs..."
          value={faqSearch}
          onChange={(e) => setFaqSearch(e.target.value)}
        />
        <ul>
          {filteredFaqs.length === 0 ? (
            <li className="text-gray-600">No FAQ matched your search.</li>
          ) : (
            filteredFaqs.map((faq) => (
              <li key={faq.id} className="mb-2">
                <h3 className="font-semibold">{faq.question}</h3>
                <p>{faq.answer}</p>
              </li>
            ))
          )}
        </ul>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4">Feedback</h2>
        <form onSubmit={handleSubmitFeedback}>
          <textarea
            className="w-full p-3 border rounded-lg shadow-sm mt-2"
            rows="4"
            placeholder="Provide your feedback..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            required
          />
          <button type="submit" className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-300">
            Submit Feedback
          </button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4">Announcements</h2>
        {notices.length === 0 ? (
          <p className="text-gray-600">No announcements available.</p>
        ) : (
          <ul className="space-y-2">
            {notices.map((notice) => (
              <li key={notice.id} className="border rounded p-3">
                <h3 className="font-semibold">{notice.title}</h3>
                <p className="text-sm text-gray-500">{notice.published_at}</p>
                <p>{notice.content}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default StudentSupport;
