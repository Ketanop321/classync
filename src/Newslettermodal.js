import { useEffect, useState } from 'react';

function NewsletterModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const closeModal = () => {
    setIsOpen(false);
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="relative">
            {/* Close Button */}
            <button
              className="absolute top-2 right-2 bg-white rounded-full p-1 text-gray-600 hover:text-gray-800"
              onClick={closeModal}
            >
              ✕
            </button>

            {/* Image section */}
            <img
              src="/teckinka2.jpeg"
              alt="Sample"
              className="w-full max-w-md h-auto rounded-lg shadow-lg"
            />
          </div>
        </div>
      )}
    </>
  );
}

export default NewsletterModal;
