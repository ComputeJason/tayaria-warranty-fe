
import React from 'react';

const ReminderCard = () => {
  return (
    <div className="bg-gray-200 rounded-lg p-4 mb-6 mx-4">
      <h2 className="text-black text-lg font-bold mb-2">Reminder: Avoid Logging in During Registration</h2>
      
      <p className="text-black mb-3">
        To prevent system errors, consumers should not log into the app while 
        the retailer is registering their details. This may cause login issues later.
      </p>
      
      <p className="text-black mb-3">
        Please wait until the retailer completes the registration before logging in.
      </p>
      
      <p className="text-black mb-3">
        If you've already encountered this issue, please contact our support 
        team for assistance.
      </p>
      
      <p className="text-black mb-3">
        Thank you for your cooperation!
      </p>
      
      <div className="flex justify-between items-center">
        <div className="h-8 w-8">
          <img src="/lovable-uploads/ef1b240f-abaf-4df5-bfc8-43b7411279d5.png" alt="Tayaria Logo" className="h-full w-full object-contain" />
        </div>
        <div className="text-right">
          <img src="/lovable-uploads/ef1b240f-abaf-4df5-bfc8-43b7411279d5.png" alt="Tayaria Logo" className="h-5 w-auto object-contain inline-block" />
        </div>
      </div>
    </div>
  );
};

export default ReminderCard;
