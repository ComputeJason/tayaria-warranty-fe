
import React from 'react';
import { CalendarDays, AlertCircle, CheckCircle, Clock } from 'lucide-react';

type CaseStatus = 'reviewing' | 'successful' | 'rejected';

interface CaseCardProps {
  id: string;
  tyreInfo: string;
  date: string;
  reason: string;
  status: CaseStatus;
}

const CaseCard: React.FC<CaseCardProps> = ({
  id,
  tyreInfo,
  date,
  reason,
  status
}) => {
  const getStatusIcon = () => {
    switch(status) {
      case 'reviewing':
        return <Clock className="h-5 w-5 text-tayaria-yellow" />;
      case 'successful':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <AlertCircle className="h-5 w-5 text-tayaria-red" />;
      default:
        return <Clock className="h-5 w-5 text-tayaria-yellow" />;
    }
  };
  
  const getStatusText = () => {
    switch(status) {
      case 'reviewing':
        return 'Under Review';
      case 'successful':
        return 'Claim Approved';
      case 'rejected':
        return 'Claim Rejected';
      default:
        return 'Under Review';
    }
  };
  
  const getStatusClass = () => {
    switch(status) {
      case 'reviewing':
        return 'bg-tayaria-yellow/20 text-tayaria-yellow';
      case 'successful':
        return 'bg-green-500/20 text-green-500';
      case 'rejected':
        return 'bg-tayaria-red/20 text-tayaria-red';
      default:
        return 'bg-tayaria-yellow/20 text-tayaria-yellow';
    }
  };
  
  return (
    <div className="tayaria-card mb-3">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-white font-semibold">{tyreInfo}</h3>
        <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${getStatusClass()}`}>
          {getStatusIcon()}
          <span className="ml-1">{getStatusText()}</span>
        </div>
      </div>
      
      <p className="text-gray-300 text-sm mb-2">
        <span className="text-tayaria-yellow font-medium">Reason: </span>
        {reason}
      </p>
      
      <div className="flex items-center text-gray-400 text-xs">
        <CalendarDays className="h-3 w-3 mr-1" />
        <span>Filed on {date}</span>
      </div>
      
      <div className="text-right mt-2">
        <span className="text-xs text-gray-400">Case ID: {id}</span>
      </div>
    </div>
  );
};

export default CaseCard;
