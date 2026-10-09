// Guest data structure mapping codes to guest information
// Each guest has a unique code from XLS file (mainGuest, code, numGuests)
const guestData = {
  // Example guests - replace with actual guest data from XLS
  "ABC123": {
    mainGuest: "John Smith",
    code: "ABC123",
    numGuests: 1,
    receptionTime: "6:00 PM",
    receptionVenue: "Grand Ballroom",
    address: "123 Wedding Lane",
    city: "New York, NY",
    date: "August 15, 2026"
  },
  "DEF456": {
    mainGuest: "Jane Doe",
    code: "DEF456",
    numGuests: 2,
    receptionTime: "6:00 PM",
    receptionVenue: "Grand Ballroom",
    address: "123 Wedding Lane",
    city: "New York, NY",
    date: "August 15, 2026"
  },
  "GHI789": {
    mainGuest: "Mike Johnson",
    code: "GHI789",
    numGuests: 4,
    receptionTime: "6:00 PM",
    receptionVenue: "Grand Ballroom",
    address: "123 Wedding Lane",
    city: "New York, NY",
    date: "August 15, 2026"
  }
};

// Function to get guest data by code
function getGuestByCode(code) {
  return guestData[code.toUpperCase()] || null;
}

// Function to validate code exists
function isValidCode(code) {
  return guestData.hasOwnProperty(code.toUpperCase());
}
