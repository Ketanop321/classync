import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { saveAs } from 'file-saver';
import { FaCreditCard, FaUniversity, FaMobileAlt, FaSearch } from 'react-icons/fa';
import { fetchTableRows, insertRow, upsertRow } from '../services/supabaseMvpApi';

const FeesManagement = () => {
  const [selectedSemester, setSelectedSemester] = useState('1st');
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState('');
  const [supportTicket, setSupportTicket] = useState('');
  const [filterText, setFilterText] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [error, setError] = useState('');

  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);

  const [invoiceForm, setInvoiceForm] = useState({
    tuition: 0,
    hostel: 0,
    library: 0,
    lab: 0,
    misc: 0,
    pending: 0,
    fine: 0,
    deadline: '',
  });

  const loadData = async () => {
    setError('');
    try {
      const [invoiceRows, paymentRows] = await Promise.all([
        fetchTableRows('fee_invoices', { orderBy: 'semester', orderConfig: { ascending: true } }),
        fetchTableRows('fee_payments', { orderBy: 'paid_at', orderConfig: { ascending: false } }),
      ]);
      setInvoices(invoiceRows || []);
      setPayments(paymentRows || []);
    } catch (err) {
      setError(err.message || 'Failed to load fee data.');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const semesterInvoice = useMemo(() => {
    return invoices.find((invoice) => invoice.semester === selectedSemester) || null;
  }, [invoices, selectedSemester]);

  useEffect(() => {
    if (!semesterInvoice) {
      setInvoiceForm({ tuition: 0, hostel: 0, library: 0, lab: 0, misc: 0, pending: 0, fine: 0, deadline: '' });
      return;
    }

    setInvoiceForm({
      tuition: Number(semesterInvoice.tuition || 0),
      hostel: Number(semesterInvoice.hostel || 0),
      library: Number(semesterInvoice.library || 0),
      lab: Number(semesterInvoice.lab || 0),
      misc: Number(semesterInvoice.misc || 0),
      pending: Number(semesterInvoice.pending || 0),
      fine: Number(semesterInvoice.fine || 0),
      deadline: semesterInvoice.deadline || '',
    });
  }, [semesterInvoice]);

  const handleSemesterChange = (e) => setSelectedSemester(e.target.value);

  const handleInvoiceField = (event) => {
    const { name, value } = event.target;
    setInvoiceForm((prev) => ({ ...prev, [name]: name === 'deadline' ? value : Number(value || 0) }));
  };

  const handleInvoiceSave = async () => {
    setError('');
    try {
      await upsertRow(
        'fee_invoices',
        {
          semester: selectedSemester,
          ...invoiceForm,
        },
        'user_id,semester'
      );

      setNotification('Invoice saved successfully.');
      await loadData();
    } catch (err) {
      setError(err.message || 'Could not save invoice.');
    }
  };

  const handlePayment = async () => {
    setIsLoading(true);
    setError('');

    try {
      const payableAmount = Number(invoiceForm.pending || 0) + Number(invoiceForm.fine || 0);

      if (payableAmount <= 0) {
        setNotification('No pending amount for selected semester.');
        return;
      }

      await insertRow('fee_payments', {
        semester: selectedSemester,
        amount: payableAmount,
        method: paymentMethod,
        status: 'successful',
        receipt_note: `Paid via ${paymentMethod}`,
      });

      await upsertRow(
        'fee_invoices',
        {
          semester: selectedSemester,
          ...invoiceForm,
          pending: 0,
          fine: 0,
        },
        'user_id,semester'
      );

      const blob = new Blob(
        [`Receipt\nSemester: ${selectedSemester}\nAmount: ₹${payableAmount}\nMethod: ${paymentMethod}`],
        { type: 'text/plain;charset=utf-8' }
      );
      saveAs(blob, `Payment_Receipt_${selectedSemester}.txt`);

      setNotification('Payment Successful!');
      await loadData();
    } catch (err) {
      setError(err.message || 'Could not process payment.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSupportTicket = async () => {
    if (!supportTicket.trim()) {
      return;
    }

    setError('');
    try {
      await insertRow('support_tickets', { message: supportTicket.trim(), status: 'open' });
      setSupportTicket('');
      setNotification('Support ticket submitted successfully.');
    } catch (err) {
      setError(err.message || 'Could not submit support ticket.');
    }
  };

  const filteredPayments = payments.filter((payment) =>
    payment.semester.toLowerCase().includes(filterText.toLowerCase())
  );

  const totalFee =
    Number(invoiceForm.tuition) +
    Number(invoiceForm.hostel) +
    Number(invoiceForm.library) +
    Number(invoiceForm.lab) +
    Number(invoiceForm.misc);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col lg:flex-row p-4 sm:p-6 lg:p-8 bg-gradient-to-r from-indigo-500 to-blue-600 min-h-screen text-white"
    >
      <div className="w-full lg:w-2/3 pr-0 lg:pr-8 mb-6 lg:mb-0">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6 text-center">Fees Management</h1>
        {error && <p className="text-red-200 mb-3">{error}</p>}
        {notification && <p className="text-green-200 mb-3">{notification}</p>}

        <div className="mb-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="w-full lg:w-auto mb-4 lg:mb-0">
            <label className="block text-lg font-medium mb-2">Select Semester:</label>
            <select
              onChange={handleSemesterChange}
              value={selectedSemester}
              className="w-full p-3 rounded-lg shadow-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="1st">1st Semester</option>
              <option value="2nd">2nd Semester</option>
              <option value="3rd">3rd Semester</option>
              <option value="4th">4th Semester</option>
            </select>
          </div>
           <div className="mt-0 lg:mt-0 lg:ml-4 flex items-center w-full lg:w-auto">
             <FaSearch className="text-white mr-2" />
            <input
              type="text"
              placeholder="Search by semester..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
               className="p-2 rounded-lg text-gray-800 w-full lg:w-auto"
             />
           </div>
         </div>

        <motion.div className="bg-white text-gray-800 p-6 rounded-lg shadow-lg mb-6 border">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold mb-4">Fee Structure for {selectedSemester} Semester</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {['tuition', 'hostel', 'library', 'lab', 'misc', 'pending', 'fine'].map((field) => (
              <label key={field} className="flex flex-col text-sm">
                <span className="font-semibold capitalize">{field}</span>
                <input
                  type="number"
                  name={field}
                  value={invoiceForm[field]}
                  onChange={handleInvoiceField}
                  className="border p-2 rounded"
                />
              </label>
            ))}
            <label className="flex flex-col text-sm">
              <span className="font-semibold">Deadline</span>
              <input
                type="date"
                name="deadline"
                value={invoiceForm.deadline || ''}
                onChange={handleInvoiceField}
                className="border p-2 rounded"
              />
            </label>
          </div>
          <div className="mt-4 flex justify-between text-base sm:text-lg font-semibold gap-3">
            <span>Total Fee:</span>
            <span>₹{totalFee}</span>
          </div>
          <button
            onClick={handleInvoiceSave}
            className="mt-4 bg-slate-800 text-white px-4 py-2 rounded hover:bg-slate-700"
          >
            Save Invoice
          </button>
        </motion.div>

        <motion.div className="bg-white text-gray-800 p-6 rounded-lg shadow-lg border">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold mb-4">Make a Payment</h2>
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div className="flex justify-between items-start sm:items-center gap-3">
              <span className="font-medium">Amount to Pay:</span>
              <span className="text-right">₹{Number(invoiceForm.pending || 0) + Number(invoiceForm.fine || 0)}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 mt-4 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full shadow-lg hover:from-blue-600 flex items-center justify-center space-x-2"
              >
                <FaCreditCard />
                <span>Card</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('upi')}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-full shadow-lg hover:from-green-600 flex items-center justify-center space-x-2"
              >
                <FaMobileAlt />
                <span>UPI</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('net_banking')}
                className="w-full bg-gradient-to-r from-purple-500 to-blue-600 text-white px-4 py-2 rounded-full shadow-lg hover:from-blue-600 flex items-center justify-center space-x-2"
              >
                <FaUniversity />
                <span>Net Banking</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handlePayment}
              disabled={isLoading}
              className={`w-full bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'}`}
            >
              {isLoading ? 'Processing...' : `Pay Now (${paymentMethod})`}
            </button>
          </form>
        </motion.div>
      </div>

      <div className="w-full lg:w-1/3 lg:pl-8">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold mb-4">Payment History</h2>
        <div className="bg-white text-gray-800 p-6 rounded-lg shadow-lg border">
          <h3 className="font-medium mb-4">Previous Payments</h3>
          <ul className="space-y-4">
            {filteredPayments.length > 0 ? (
              filteredPayments.map((payment) => (
                <li key={payment.id} className="flex flex-col sm:flex-row sm:justify-between gap-1">
                  <span>{payment.semester}</span>
                  <span className="text-sm sm:text-base">₹{payment.amount} ({new Date(payment.paid_at).toLocaleDateString()})</span>
                </li>
              ))
            ) : (
              <li>No payments found.</li>
            )}
          </ul>
        </div>

        <div className="bg-white text-gray-800 p-6 rounded-lg shadow-lg border mt-6">
          <h3 className="font-medium mb-4">Submit a Support Ticket</h3>
          <textarea
            placeholder="Describe your issue..."
            value={supportTicket}
            onChange={(e) => setSupportTicket(e.target.value)}
            className="p-2 rounded-lg text-gray-800 mb-4 w-full h-24 border"
          />
          <button
            onClick={handleSupportTicket}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-600 w-full"
          >
            Submit Ticket
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default FeesManagement;
