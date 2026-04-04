import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/authContext/authContext';
import { fetchTableRows } from '../services/supabaseMvpApi';

const StudentDetails = () => {
  const { profile } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDetails = async () => {
      setLoading(true);
      setError('');

      try {
        const [ticketRows, registrationRows, paymentRows] = await Promise.all([
          fetchTableRows('support_tickets', { orderBy: 'created_at', orderConfig: { ascending: false } }),
          fetchTableRows('course_registrations', { orderBy: 'registered_at', orderConfig: { ascending: false } }),
          fetchTableRows('fee_payments', { orderBy: 'paid_at', orderConfig: { ascending: false } }),
        ]);

        setTickets(ticketRows || []);
        setRegistrations(registrationRows || []);
        setPayments(paymentRows || []);
      } catch (err) {
        setError(err.message || 'Failed to load student details.');
      } finally {
        setLoading(false);
      }
    };

    loadDetails();
  }, []);

  return (
    <div className="p-6 bg-slate-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Student Details</h1>
      {error && <p className="text-red-600 mb-4">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-semibold text-lg mb-2">Profile</h2>
          <p><span className="font-medium">Name:</span> {profile?.full_name || 'Not set'}</p>
          <p><span className="font-medium">Email:</span> {profile?.email || 'Not set'}</p>
          <p><span className="font-medium">Student ID:</span> {profile?.student_id || 'Not set'}</p>
          <p><span className="font-medium">Course:</span> {profile?.course || 'Not set'}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-semibold text-lg mb-2">Quick Stats</h2>
          {loading ? (
            <p className="text-gray-600">Loading stats...</p>
          ) : (
            <>
              <p><span className="font-medium">Support Tickets:</span> {tickets.length}</p>
              <p><span className="font-medium">Registered Courses:</span> {registrations.length}</p>
              <p><span className="font-medium">Fee Payments:</span> {payments.length}</p>
            </>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="font-semibold text-lg mb-2">Recent Payments</h2>
        {payments.length === 0 ? (
          <p className="text-gray-600">No payments available.</p>
        ) : (
          <ul className="space-y-2">
            {payments.slice(0, 5).map((payment) => (
              <li key={payment.id} className="border rounded p-2">
                <p><span className="font-medium">Semester:</span> {payment.semester}</p>
                <p><span className="font-medium">Amount:</span> ₹{payment.amount}</p>
                <p><span className="font-medium">Date:</span> {new Date(payment.paid_at).toLocaleString()}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default StudentDetails;
