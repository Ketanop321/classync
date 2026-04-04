import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import AppRoutes from './routes/AppRoutes'; 
import NewsletterModal from './Newslettermodal';
import { useAuth } from './context/authContext/authContext';

const App = () => {
  const { isAuthenticated } = useAuth();

  return (
    <>
    {isAuthenticated && <NewsletterModal />}
    <Router>
      <div className="flex">
        {isAuthenticated && <Sidebar />}
        <div className={`flex-grow p-4 ${isAuthenticated ? 'lg:ml-64' : ''}`}>
          <AppRoutes /> {/* Render routes from AppRoutes */}
        </div>
      </div>
    </Router>
    
    </>
  );
};

export default App;
