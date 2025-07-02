
import React, { useState } from 'react';
import { X, HelpCircle, ScanLine, ChevronDown } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

interface ManualInputModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: TyreData) => void;
}

interface TyreData {
  serialNumber: string;
  dot: string;
  pattern: string;
  section: string;
  aspect: string;
  rim: string;
}

const ManualInputModal = ({ open, onClose, onSubmit }: ManualInputModalProps) => {
  const [tyreData, setTyreData] = useState<TyreData>({
    serialNumber: '',
    dot: '',
    pattern: '',
    section: '0',
    aspect: '0',
    rim: '0'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTyreData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    onSubmit(tyreData);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="bg-tayaria-gray border-tayaria-lightgray p-0 w-[95%] mx-auto rounded-lg" onInteractOutside={(e) => e.preventDefault()}>
        <div className="p-5">
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <label htmlFor="serialNumber" className="tayaria-input-label">Serial Number*</label>
              <HelpCircle className="h-5 w-5 ml-2 text-tayaria-yellow" />
            </div>
            <div className="flex">
              <input
                type="text"
                id="serialNumber"
                name="serialNumber"
                placeholder="Scan or type tyre barcode"
                className="tayaria-input flex-grow"
                value={tyreData.serialNumber}
                onChange={handleChange}
              />
              <button className="ml-2 text-tayaria-yellow">
                <ScanLine className="h-6 w-6" />
              </button>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex items-center mb-2">
              <label htmlFor="dot" className="tayaria-input-label">DOT</label>
              <HelpCircle className="h-5 w-5 ml-2 text-tayaria-yellow" />
            </div>
            <div className="flex">
              <input
                type="text"
                id="dot"
                name="dot"
                placeholder="Please input DOT"
                className="tayaria-input flex-grow"
                value={tyreData.dot}
                onChange={handleChange}
              />
              <span className="ml-2 text-gray-400 py-2">| DOT Week</span>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex items-center mb-2">
              <label htmlFor="pattern" className="tayaria-input-label">Pattern*</label>
              <HelpCircle className="h-5 w-5 ml-2 text-tayaria-yellow" />
            </div>
            <select
              id="pattern"
              name="pattern"
              className="tayaria-input pr-10 appearance-none"
              value={tyreData.pattern}
              onChange={handleChange}
            >
              <option value="">Select Pattern</option>
              <option value="pattern1">Pattern 1</option>
              <option value="pattern2">Pattern 2</option>
              <option value="pattern3">Pattern 3</option>
            </select>
            <div className="relative">
              <ChevronDown className="absolute right-3 top-[-28px] text-white h-5 w-5 pointer-events-none" />
            </div>
          </div>

          <div className="mb-6">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-center mb-1">Section</div>
                <select
                  name="section"
                  className="tayaria-input text-center"
                  value={tyreData.section}
                  onChange={handleChange}
                >
                  <option value="0">0</option>
                  {Array.from({ length: 10 }, (_, i) => (
                    <option key={i+1} value={String(i+1)}>{i+1}</option>
                  ))}
                </select>
              </div>
              <div>
                <div className="text-center mb-1">Aspect</div>
                <select
                  name="aspect"
                  className="tayaria-input text-center"
                  value={tyreData.aspect}
                  onChange={handleChange}
                >
                  <option value="0">0</option>
                  {Array.from({ length: 10 }, (_, i) => (
                    <option key={i+1} value={String(i+1)}>{i+1}</option>
                  ))}
                </select>
              </div>
              <div>
                <div className="text-center mb-1">RIM</div>
                <select
                  name="rim"
                  className="tayaria-input text-center"
                  value={tyreData.rim}
                  onChange={handleChange}
                >
                  <option value="0">0</option>
                  {Array.from({ length: 10 }, (_, i) => (
                    <option key={i+1} value={String(i+1)}>{i+1}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <button 
            className="tayaria-button w-full"
            onClick={handleSubmit}
          >
            Done
          </button>
        </div>
        
        <button 
          className="absolute bottom-[-50px] left-1/2 transform -translate-x-1/2"
          onClick={onClose}
        >
          <X className="h-8 w-8 text-white" />
        </button>
      </DialogContent>
    </Dialog>
  );
};

export default ManualInputModal;
