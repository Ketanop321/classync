import React, { useEffect, useMemo, useState } from 'react';
import { fetchTableRows, insertRow } from '../services/supabaseMvpApi';

const LibraryPage = () => {
  const [books, setBooks] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [readLater, setReadLater] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [genreFilter, setGenreFilter] = useState('All');

  const [bookForm, setBookForm] = useState({
    title: '',
    author: '',
    genre: '',
    description: '',
    cover_url: '',
    download_url: '',
    available_copies: 1,
  });

  const loadLibrary = async () => {
    setLoading(true);
    setError('');

    try {
      const [bookRows, reservationRows, readLaterRows] = await Promise.all([
        fetchTableRows('library_books', { orderBy: 'title', orderConfig: { ascending: true } }),
        fetchTableRows('library_reservations', { orderBy: 'created_at', orderConfig: { ascending: false } }),
        fetchTableRows('library_read_later', { orderBy: 'created_at', orderConfig: { ascending: false } }),
      ]);

      setBooks(bookRows || []);
      setReservations(reservationRows || []);
      setReadLater(readLaterRows || []);
    } catch (err) {
      setError(err.message || 'Failed to load library resources.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLibrary();
  }, []);

  const genres = useMemo(() => {
    const unique = Array.from(new Set(books.map((book) => book.genre))).filter(Boolean);
    return ['All', ...unique];
  }, [books]);

  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      const matchesQuery =
        book.title.toLowerCase().includes(query.toLowerCase()) ||
        book.author.toLowerCase().includes(query.toLowerCase());
      const matchesGenre = genreFilter === 'All' || book.genre === genreFilter;
      return matchesQuery && matchesGenre;
    });
  }, [books, query, genreFilter]);

  const reservedBookIds = new Set(reservations.map((reservation) => reservation.book_id));
  const readLaterBookIds = new Set(readLater.map((entry) => entry.book_id));

  const handleBookFormChange = (event) => {
    const { name, value } = event.target;
    setBookForm((prev) => ({ ...prev, [name]: name === 'available_copies' ? Number(value || 0) : value }));
  };

  const handleCreateBook = async (event) => {
    event.preventDefault();
    setError('');

    try {
      await insertRow('library_books', bookForm);
      setBookForm({ title: '', author: '', genre: '', description: '', cover_url: '', download_url: '', available_copies: 1 });
      await loadLibrary();
    } catch (err) {
      setError(err.message || 'Could not create library book.');
    }
  };

  const reserveBook = async (bookId) => {
    setError('');
    try {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14);

      await insertRow('library_reservations', {
        book_id: bookId,
        status: 'reserved',
        due_date: dueDate.toISOString().slice(0, 10),
      });
      await loadLibrary();
    } catch (err) {
      setError(err.message || 'Could not reserve this book.');
    }
  };

  const addToReadLater = async (bookId) => {
    setError('');
    try {
      await insertRow('library_read_later', { book_id: bookId });
      await loadLibrary();
    } catch (err) {
      setError(err.message || 'Could not add book to read later list.');
    }
  };

  return (
    <div className="p-4 md:p-8 bg-pink-100 min-h-screen">
      <h1 className="text-2xl md:text-4xl font-bold text-gray-800 mb-6 md:mb-8">Library Resources</h1>
      {error && <p className="text-red-600 mb-4">{error}</p>}

      <form onSubmit={handleCreateBook} className="bg-white p-4 rounded-lg shadow mb-6 grid grid-cols-1 md:grid-cols-4 gap-3">
        <input name="title" value={bookForm.title} onChange={handleBookFormChange} placeholder="Title" required className="border p-2 rounded" />
        <input name="author" value={bookForm.author} onChange={handleBookFormChange} placeholder="Author" required className="border p-2 rounded" />
        <input name="genre" value={bookForm.genre} onChange={handleBookFormChange} placeholder="Genre" className="border p-2 rounded" />
        <input name="cover_url" value={bookForm.cover_url} onChange={handleBookFormChange} placeholder="Cover URL" className="border p-2 rounded" />
        <input name="download_url" value={bookForm.download_url} onChange={handleBookFormChange} placeholder="Download URL" className="border p-2 rounded" />
        <input type="number" name="available_copies" value={bookForm.available_copies} onChange={handleBookFormChange} className="border p-2 rounded" />
        <input name="description" value={bookForm.description} onChange={handleBookFormChange} placeholder="Description" className="border p-2 rounded md:col-span-2" />
        <button type="submit" className="bg-pink-500 text-white rounded p-2 md:col-span-1">Add Book</button>
      </form>

      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-lg shadow-md mb-6">
        <input
          type="text"
          placeholder="Search by book title or author"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full sm:w-auto flex-grow p-2 border border-gray-300 rounded-lg focus:outline-none"
        />
        <select
          className="w-full sm:w-auto p-2 border border-gray-300 rounded-lg"
          value={genreFilter}
          onChange={(e) => setGenreFilter(e.target.value)}
        >
          {genres.map((genre) => (
            <option key={genre} value={genre}>{genre}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-gray-700">Loading library...</p>
      ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mt-6">
          {filteredBooks.map((book) => (
            <div key={book.id} className="bg-white rounded-lg shadow-lg p-4 flex flex-col items-center">
              <img
                src={book.cover_url || 'https://via.placeholder.com/160x220?text=Book'}
                alt={book.title}
                className="w-32 h-48 object-cover mb-4"
              />
              <h2 className="text-lg font-semibold text-center">{book.title}</h2>
              <p className="text-sm text-gray-700">{book.author}</p>
              <p className="text-xs text-gray-500">{book.genre || 'General'}</p>
              {book.download_url ? (
                <a href={book.download_url} target="_blank" rel="noreferrer" className="mt-4 px-4 py-2 bg-pink-400 text-white rounded hover:bg-pink-500">
                  Download
                </a>
              ) : (
                <button type="button" className="mt-4 px-4 py-2 bg-gray-300 text-white rounded cursor-not-allowed" disabled>
                  No Download URL
                </button>
              )}
              <button
                type="button"
                onClick={() => reserveBook(book.id)}
                disabled={reservedBookIds.has(book.id)}
                className="mt-2 px-4 py-2 bg-pink-300 text-white rounded hover:bg-pink-400 disabled:opacity-60"
              >
                {reservedBookIds.has(book.id) ? 'Reserved' : 'Reserve Book'}
              </button>
              <button
                type="button"
                onClick={() => addToReadLater(book.id)}
                disabled={readLaterBookIds.has(book.id)}
                className="mt-2 px-4 py-2 bg-blue-400 text-white rounded hover:bg-blue-500 disabled:opacity-60"
              >
                {readLaterBookIds.has(book.id) ? 'In Read Later' : 'Add to Read Later'}
              </button>
            </div>
          ))}
            {filteredBooks.length === 0 && <p className="text-gray-700 col-span-full">No books found.</p>}
          </div>
      )}

      <div className="mt-10 space-y-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-bold mb-4">Resource Management</h3>
          <p className="text-gray-600">Reserved Books: {reservations.length}</p>
          <p className="text-gray-600">Read Later List: {readLater.length}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-bold mb-4">Due Date Reminders</h3>
          {reservations.length === 0 ? (
            <p className="text-gray-600">No active reservations.</p>
          ) : (
            <ul className="space-y-2">
              {reservations.map((reservation) => (
                <li key={reservation.id} className="text-gray-700">
                  Reservation {reservation.id.slice(0, 8)} due on {reservation.due_date || 'N/A'}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default LibraryPage;
