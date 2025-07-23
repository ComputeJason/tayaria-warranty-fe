import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface TermsAndConditionsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccept: () => void;
  formData?: any;
  onSubmit?: (data: any) => void;
  isLoading?: boolean;
}

export const TermsAndConditionsContent = () => (
  <div className="text-gray-800 space-y-8">
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-red-700">1. Warranty Statement</h2>
      <div className="space-y-3 text-gray-700">
        <p>
          • Offered by Kit Loong Tayaria Sdn Bhd (KLTSB) as a value-added programme.
        </p>
        <p>
          • Covers Pirelli, Kumho, GT Radial, Road X and DoubleStar brand passenger car tyres purchased from KLT's authorised distributor.
        </p>
        <p>
          • A minimum of two (2) tyres must be purchased in a single receipt to be eligible for the Road Hazard Warranty.
        </p>
      </div>
    </div>

    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-red-700">2. Points of Coverage</h2>
      <div className="space-y-3 text-gray-700">
        <p>
          • Covers tyre damage beyond repair due to road hazards (e.g., punctures, cuts, potholes) within 6 months from purchase and when tread depth exceeds 6.0mm.
        </p>
        <p>
          • Warranty claims require an original proof of purchase.
        </p>
      </div>
    </div>

    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-red-700">3. Warranty Registration Process</h2>
      <div className="space-y-3 text-gray-700">
        <p>
          • Customers must register their warranty online at tayaria.com-warrantyregistration within 14 days from date of purchase. Registration after the 14-days' period will not be accepted.
        </p>
        <p>
          • Required details include customer information, vehicle details, tyre details, and purchase information.
        </p>
      </div>
    </div>

    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-red-700">4. Warranty Claim Process</h2>
      <div className="space-y-3 text-gray-700">
        <p>
          • Claims must be made at authorised dealers, with proof of purchase.
        </p>
        <p>
          • Damage assessment will be conducted by KLTSB's authorised Technical Associate.
        </p>
        <p>
          • Replacement tyres are not given immediately upon claim. Claims are subject to KLTSB's evaluation and approval. KLTSB reserves the right to determine the validity of any claim at its sole discretion, and the Company's decision regarding the claim is final and binding.
        </p>
        <p>
          • If a replacement tyre is unavailable, a credit amount will be issued based on assessed tyre value.
        </p>
        <p>
          • Charges for fitment, balancing, and alignment are not included and shall be borne by customers.
        </p>
      </div>
    </div>

    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-red-700">5. Exclusions from 6-Month Road Hazard Warranty</h2>
      <div className="space-y-3 text-gray-700">
        <p>
          • Does not cover tyres used on the wrong type of vehicle, uneven wear from mechanical issues, or tyres used for commercial/public utility vehicles.
        </p>
        <p>
          • Off-road and racing tyres are excluded.
        </p>
        <p>
          • Does not cover damage due to improper mounting, maintenance issues, mechanical irregularities, or external causes like accidents or vandalism.
        </p>
        <p>
          • Tyres used for motorsports, off-road applications, second-hand tyres, and those purchased from unauthorised dealers are excluded.
        </p>
      </div>
    </div>

    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-red-700">6. Other Conditions</h2>
      <div className="space-y-3 text-gray-700">
        <p>
          • KLTSB reserves the right to change, amend, modify, suspend, continue or terminate all or any part of the Warranty Programs at any time without prior notice.
        </p>
        <p>
          • Customers should check the official website for updated terms and warranty information.
        </p>
      </div>
    </div>
  </div>
);

const TermsAndConditions: React.FC<TermsAndConditionsProps> = ({
  open,
  onOpenChange,
  onAccept,
  formData,
  onSubmit,
  isLoading,
}) => {
  const [accepted, setAccepted] = React.useState(false);

  const handleAccept = () => {
    if (accepted) {
      onAccept();
      if (formData && onSubmit) {
        onSubmit(formData);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border-2 border-yellow-300 max-h-[80vh] w-[90%] md:w-[900px] max-w-[900px] flex flex-col p-0 shadow-xl">
        <DialogHeader className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-6 pb-4 rounded-t-lg">
          <DialogTitle className="text-red-700 text-center text-2xl mb-4 font-bold">KLTSB ROAD HAZARD WARRANTY TERMS & CONDITIONS</DialogTitle>
          <div className="border-t border-yellow-300 w-full" />
        </DialogHeader>
        
        <div className="overflow-y-auto flex-1 px-6 py-4">
          <TermsAndConditionsContent />
        </div>

        <div className="border-t border-yellow-300 p-6 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-b-lg">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="terms"
              checked={accepted}
              onCheckedChange={(checked) => setAccepted(checked as boolean)}
            />
            <Label htmlFor="terms" className="text-gray-800 font-medium">
              I have read and agree to the Terms and Conditions
            </Label>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="bg-white text-black border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-colors"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAccept}
              disabled={!accepted || isLoading}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium disabled:opacity-50 transition-all duration-300"
            >
              {isLoading ? 'Accepting...' : 'Accept & Continue'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TermsAndConditions; 