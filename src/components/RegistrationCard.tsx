
import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, FileText } from 'lucide-react';

interface RegistrationCardProps {
  id: string;
  pattern: string;
  size: string;
  date: string;
  serialNumber: string;
}

const RegistrationCard: React.FC<RegistrationCardProps> = ({
  id,
  pattern,
  size,
  date,
  serialNumber
}) => {
  return (
    <div className="tayaria-card mb-3 relative">
      <div className="flex flex-col">
        <h3 className="text-tayaria-yellow font-semibold text-lg">{pattern}</h3>
        <p className="text-white text-sm mb-1">Size: {size}</p>
        <p className="text-white text-sm mb-1">Serial: {serialNumber}</p>
        <div className="flex items-center text-gray-400 text-xs mb-2">
          <CalendarDays className="h-3 w-3 mr-1" />
          <span>Registered on {date}</span>
        </div>
        
        <Link 
          to={`/file-claim/${id}`} 
          className="tayaria-button mt-2 text-sm"
        >
          <FileText className="h-4 w-4" />
          <span>File a Claim</span>
        </Link>
      </div>
    </div>
  );
};

export default RegistrationCard;
