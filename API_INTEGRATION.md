# Warranty API Integration

This document describes the backend API integration for the warranty management system.

## API Base URL
```
http://localhost:8080/api (development)
https://tayaria-warranty-be.onrender.com/api (production)
```

## Integrated Endpoints

### 1. Register Warranty
- **Endpoint**: `POST /api/user/warranty`
- **Purpose**: Register a new tyre warranty
- **Request Schema**: See `src/services/warrantyApi.ts` for details
- **Response**: Warranty object with UUID and calculated expiry date

### 2. Check Warranties by Car Plate
- **Endpoint**: `GET /api/user/warranties/car-plate/{carPlate}`
- **Purpose**: Retrieve all warranties for a specific car plate
- **Response**: Array of warranty objects

## Implementation Details

### File Structure
- `src/services/warrantyApi.ts` - API service functions and type definitions
- `src/pages/Warranty.tsx` - Main warranty page with API integration
- `src/components/warranty/RegisterWarranty.tsx` - Registration form
- `src/components/warranty/CheckWarrantyStatus.tsx` - Status checking form

### Key Features
- ✅ Real API calls replacing mock data
- ✅ Error handling with toast notifications
- ✅ Loading states during API calls
- ✅ Type-safe data conversion between frontend and backend formats
- ✅ File upload handling (currently using fake URLs)

### Data Conversion
The frontend converts between its internal format and the backend API format:

**Frontend → Backend**:
- `contactNumber` → `phone_number`
- `purchaseDate` → `purchase_date` (ISO 8601 format)
- `receipt` → Fake URL (until file upload is implemented)

**Backend → Frontend**:
- UUID → String ID
- ISO dates → Formatted dates
- Status calculation based on expiry date

### Testing
The backend includes test data for these car plates:
- `ABC1234` - John Doe
- `XYZ5678` - Jane Smith  
- `DEF9012` - Bob Johnson

### Next Steps
1. Implement real file upload functionality
2. Add more detailed warranty information (tyre details, etc.)
3. Add warranty status tracking (used/active/expired)
4. Implement warranty claims functionality

## Error Handling
- Network errors are caught and displayed as toast notifications
- Validation errors from the backend are shown to users
- Loading states prevent multiple submissions

## Development Notes
- Currently using environment variables for base URL switching
- CORS is enabled on the backend for all origins
- File upload uses fake URLs until backend implementation is complete 