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
}

export const TermsAndConditionsContent = () => (
  <div className="text-white space-y-8">
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">1) Warranty Statement</h2>
      <div className="space-y-3 text-gray-300">
        <p>
          Pirelli 360 Tyre Secure, offered by Kit Loong Tayaria Sdn Bhd (KLT) is a value-added warranty programme which offers customers all-round coverage and a worry-free driving experience.
        </p>
        <p>
          With Pirelli 360 Tyre Secure, customers who purchase Pirelli car tyres (all models and sizes) which are supplied by the authorised distributor- KLT can enjoy extra protection against road hazard damage which renders tyres beyond a repairable condition.
        </p>
      </div>
    </div>

    <div className="space-y-4">
      <h2 className="text-xl font-semibold">2) Points of Coverage</h2>
      <div className="space-y-3 text-gray-300">
        <p>
          Pirelli 360 Tyre Secure comprises of protection under 2 primary initiatives. Namely,
        </p>
        <div className="space-y-4 ml-4">
          <div>
            <h3 className="font-medium mb-2">5-year Pirelli Limited Warranty:</h3>
            <p className="mb-2">
              Protects against manufacturing defects. Unless otherwise stated, all Pirelli tyres bearing Pirelli serial numbers are assured for 5 years from their date of manufacture. Warranty remains valid throughout the tyre's first tread life to the approved remaining tread wear/TWI pertaining to local conditions.
            </p>
            <p>
              Customers whose tyres are found to be defective under these stated conditions will be granted allowance for purchase of new/similar Pirelli products, the allowance of which will be based on the average remaining tread wear.
            </p>
          </div>
          <div>
            <h3 className="font-medium mb-2">6-month Road Hazard Warranty:</h3>
            <p className="mb-2">
              Provides a replacement for Pirelli car tyres (all models and sizes) that are damaged beyond repair due to road hazards which have occurred during the period of more than 6.0mm of the tyre's original tread depth, and/or during 6 months from the date of purchase (whichever comes first).
            </p>
            <p className="mb-2">
              These damages include, but are not limited to: punctures, cuts, bruises, or damage from potholes, which are attained during a normal course of driving on a maintained road. KLT will compensate/provide allowance for tyres which meet the conditions for warranty claim, following assessment by Authorised Technical Associate from KLT.
            </p>
            <p>
              Warranty shall be void if customers are unable to provide original copies of their proof of purchase (sales invoice/official receipt). Pirelli 360 Tyre Secure will be valid within 6 months from the date of purchase, provided that the remaining tread depth is more than 6.0mm.
            </p>
          </div>
        </div>
      </div>
    </div>

    <div className="space-y-4">
      <h2 className="text-xl font-semibold">3) Warranty Registration Process</h2>
      <div className="space-y-3 text-gray-300">
        <p>
          Customers who purchase any Pirelli tyres at participating authorised outlets will receive a Pirelli 360 Tyre Secure warranty card.
        </p>
        <p>
          To activate their warranty, customers should register their warranty card online at tayaria.com/pirelli-warranty-registration.
        </p>
        <p>
          The following information will be required at the point of registration: customer name, email address and contact number, vehicle details (plate number, brand, model and year), warranty card serial number, tyre details, and outlet purchase information.
        </p>
        <p>
          Customers will also be required to submit a digital copy of their Proof of Purchase (sales invoice/official receipt).
        </p>
        <p>
          Customers who receive a physical warranty card should retain the card for future claim purposes and ensure that all required details are provided. In this case, all information shared will be uploaded onto the KLT system. Following this, a confirmation SMS will be sent to the customer along with further details.
        </p>
      </div>
    </div>

    <div className="space-y-4">
      <h2 className="text-xl font-semibold">4) Warranty Claim Process</h2>
      <div className="space-y-3 text-gray-300">
        <p>
          Customers are to present their damaged applicable Pirelli tyre(s), original copy of Proof of Purchase (sales invoice/official receipt), and valid warranty card at any authorised dealers nationwide (refer to the page below for Authorized Dealers List).
        </p>
        <p>
          Tyre will only be considered as under warranty if damage is due to road hazards, and if it falls within a valid tyre age/duration of use. The damage will be assessed by authorised Technical Associate from KLT. Tampering with the product will render the warranty void (e.g., tampered serial number, ply rating, size of tyre, etc.) Only tyres purchased from authorised dealers in Malaysia are eligible for warranty.
        </p>
        <p>
          If there is currently no stock available for the replacement of tyre, KLT will issue a credit amount for the tyre. Credit computation will be based on the assessed value of the damaged tyre using the dealer invoice price as reference. Customers will be required to fill up and authorise the claim form provided to facilitate credit processing.
        </p>
        <p>
          Warranty card will be returned to the customer after processing the warranty if card corresponds to more than one tyre. All replaced tyres shall be surrendered to the authorised dealers and will be considered property of KLT. Tyre damage analysis and assigned credit value determined by KLT remain final.
        </p>
        <p>
          If tyre is not found to be defective, or damage is not due to manufacturing defect: Tyre will be returned to the customer and formal explanation by the KLT Pirelli Technical Associate will be provided. Visit tayaria.com/pirelli-warranty-registration for more information on manufacturing defects or speak to a KLT Pirelli Technical Associate at our authorised outlets.
        </p>
      </div>
    </div>

    <div className="space-y-4">
      <h2 className="text-xl font-semibold">5) Exclusions: 5-year Pirelli Limited Warranty</h2>
      <div className="space-y-3 text-gray-300">
        <p>
          Tyres with the following types of damage will not be considered valid for, or covered under the 5-year Pirelli Limited Warranty:
        </p>
        <p>
          Damage due to obstacles or debris, including cuts and punctures (whether or not repairable), improper mounting and dismounting of the tyre, imbalance of tyre and wheel, wrong or improper repair, under inflation/over inflation, improper tyre maintenance, mechanical irregularities in the vehicle (e.g. wheel misalignment, faulty shock absorbers, brakes), improper storage, and damages from accident, fire, tyre alteration or vandalism.
        </p>
        <p>
          Tyres from the following categories will not be considered valid for, or covered under the 5-year Pirelli Limited Warranty: Tyres used in motorsports, tyres used for wrong applications (on-road tyre used for off-road), tyres fitted with incompatible or improper valves/rims/wheels, second-hand tyres.
        </p>
        <p>
          Tyres purchased from non-authorised dealers in Malaysia will not be covered under the 5-year Pirelli Limited Warranty.
        </p>
      </div>
    </div>

    <div className="space-y-4">
      <h2 className="text-xl font-semibold">6) Exclusions: 6-month Road Hazard Warranty</h2>
      <div className="space-y-3 text-gray-300">
        <p>
          Tyres from the following categories will not be considered valid for, or covered under the 6-month Road Hazard Warranty: Tyres used for the wrong type of vehicle (misapplication), tyres with uneven wear due to mechanical issues of vehicle, tyres used on vehicles for commercial purposes or public utility (e.g., taxi and car rental services). Racing tyre & AT/MT for off road use, commercial use.
        </p>
        <p>
          Tyres purchased from non-authorised dealers in Malaysia will not be covered under the 6-month Road Hazard Warranty.
        </p>
      </div>
    </div>

    <div className="space-y-3 text-gray-300">
      <p>
        KLT reserves the right to change, amend, modify, suspend, discontinue, or terminate all or any part of Pirelli 360 Tyre Secure at any time without prior notice.
      </p>
      <p>
        Customers are advised to read the mechanics, terms and conditions, inclusions, and exclusions pertaining to the Pirelli 360 Tyre Secure Warranty Program on tayaria.com and monitor the site and Pirelli 360 Tyre Secure page for updates pertaining to the warranty. For inquiries, customers may also call the General Line at 03-7783 7663.
      </p>
    </div>
  </div>
);

const TermsAndConditions: React.FC<TermsAndConditionsProps> = ({
  open,
  onOpenChange,
  onAccept,
  formData,
  onSubmit,
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
      <DialogContent className="bg-tayaria-darkgray border-tayaria-gray max-h-[80vh] w-[90%] md:w-[900px] max-w-[900px] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-white text-center text-2xl mb-4">TERMS AND CONDITIONS</DialogTitle>
          <div className="border-t border-tayaria-gray w-full" />
        </DialogHeader>
        
        <div className="overflow-y-auto flex-1 px-6">
          <TermsAndConditionsContent />
        </div>

        <div className="border-t border-tayaria-gray p-6 bg-tayaria-darkgray">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="terms"
              checked={accepted}
              onCheckedChange={(checked) => setAccepted(checked as boolean)}
            />
            <Label htmlFor="terms" className="text-white">
              I have read and agree to the Terms and Conditions
            </Label>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="text-white border-tayaria-gray hover:bg-tayaria-gray"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAccept}
              disabled={!accepted}
              className="bg-tayaria-yellow hover:bg-tayaria-yellow/90 text-black disabled:opacity-50"
            >
              Accept & Continue
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TermsAndConditions; 