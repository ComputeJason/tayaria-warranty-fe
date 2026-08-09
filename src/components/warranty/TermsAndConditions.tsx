import React from 'react';

export const TermsAndConditionsContent = () => (
  <div className="text-gray-800 space-y-8">
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-red-700">1. Warranty Statement</h2>
      <div className="space-y-3 text-gray-700">
        <p>
          • Offered by Kit Loong Tayaria Sdn Bhd (KLTSB) as a value-added programme.
        </p>
        <p>
          • Covers Pirelli, Kumho, GT Radial and RoadX brand passenger car tyres purchased from KLT's authorised distributor. For RoadX, coverage will apply to 17" and above only.
        </p>
      </div>
    </div>

    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-red-700">2. Points of Coverage</h2>
      <div className="space-y-3 text-gray-700">
        <p>
          • A minimum of two (2) tyres must be purchased in a single receipt.
        </p>
        <p>
          • Covers tyre damage beyond repair due to road hazards (e.g., punctures, cuts, potholes) within 6 months from purchase and when tread depth exceeds 6.0mm.
        </p>
        <p>
          • Warranty claims require an original proof of purchase. (printed invoice)
        </p>
      </div>
    </div>

    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-red-700">3. Warranty Registration Process</h2>
      <div className="space-y-3 text-gray-700">
        <p>
          • Customers must register their warranty online at{' '}
          <a 
            href="https://tayaria.com/online-warranty-registration/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-red-600 hover:text-red-700 underline"
          >
            tayaria-tyre-assist
          </a>
          {' '}within 14 days from date of purchase. Registration after the 14-days' period will not be accepted.
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
          • Does not cover damage due to improper mounting, maintenance issues, mechanical irregularities, or external causes like accidents or vandalism.
        </p>
        <p>
          • Second-hand tyres, and those purchased from unauthorised dealers are excluded.
        </p>
        <p>
          • Does not cover for Tyre damages caused by installation, strike, riot, terrorism, malicious damage, floods & fire.
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

