import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import AppRoutes from './routes/AppRoutes'; 
import NewsletterModal from './Newslettermodal';
const App = () => {
  return (
    <>
    <NewsletterModal/>
    <Router>
      <div className="flex">
        <Sidebar />
        <div className="flex-grow p-4"> {/* Space for sidebar on desktop */}
          <AppRoutes /> {/* Render routes from AppRoutes */}
        </div>
      </div>
    </Router>
    
    </>
  );
};

export default App;
