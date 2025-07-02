
import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Tractor } from 'lucide-react';
import Header from '@/components/Header';
import Navbar from '@/components/Navbar';
import ReminderCard from '@/components/ReminderCard';

const Index = () => {
  return (
    <div className="flex flex-col min-h-screen pb-16">
      <Header />
      
      <main className="flex-grow pt-2">
        <div className="px-4 mb-4">
          <ReminderCard />
        </div>
        
        <div className="flex flex-col px-4 gap-4 mb-4">
          {/* Main Action Buttons - full width and equal spacing */}
          <div className="grid grid-cols-1 gap-4">
            <Link to="/register-tyre" className="tayaria-button py-5 w-full">
              <div className="flex items-center">
                <Tractor className="h-6 w-6 mr-2" />
                <span className="text-lg font-bold">Register a Tyre</span>
              </div>
            </Link>
            
            <Link to="/file-case" className="tayaria-button py-5 w-full">
              <div className="flex items-center">
                <FileText className="h-6 w-6 mr-2" />
                <span className="text-lg font-bold">File a Case</span>
              </div>
            </Link>
          </div>
          
          {/* My Registrations Card */}
          <Link to="/my-registrations" className="tayaria-card">
            <h2 className="text-white text-xl font-bold mb-1">My Registrations</h2>
            <p className="text-gray-400 text-sm">View my registered tyres here</p>
          </Link>
          
          {/* My Cases Card - ensuring it's fully visible */}
          <Link to="/my-cases" className="tayaria-card">
            <h2 className="text-white text-xl font-bold mb-1">My Cases</h2>
            <p className="text-gray-400 text-sm">View cases status here</p>
          </Link>
        </div>
      </main>
      
      <Navbar />
    </div>
  );
};

export default Index;
