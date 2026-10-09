# Wedding Invitation System

A personalized wedding website where guests can access their custom invitations using unique codes from an XLS file. The system handles reception-only invitations with dynamic form generation based on the number of guests.

## Features

- **Code-based authentication**: Each guest has a unique code (from XLS file) to access their personalized invitation
- **Reception-only focus**: Guests see reception information only
- **Dynamic form generation**: Forms automatically generate based on numGuests from XLS data
- **Multi-guest support**: Handles main guest + additional guests with dietary restrictions
- **Child age tracking**: Optional child identification with age collection
- **Smart RSVP system**: Conditional forms that adapt based on attendance response
- **Responsive design**: Works beautifully on desktop and mobile devices
- **Modern UI**: Elegant design with your existing wedding theme (evergreen, gold, wine colors)

## File Structure

```
juliusandluzalen-wedding.github.io/
├── index.html                          # Main landing page (links to invitation system)
├── guest-data.js                       # Guest database with code mappings
├── invitation/
│   ├── index.html                     # Login page for code entry
│   ├── guest.html                     # Personalized guest invitation page
│   ├── invitation-script.js           # Login authentication logic
│   ├── guest-script.js                # Guest page logic and RSVP handling
│   └── invitation-styles.css          # Custom styles for invitation pages
├── styles.css                         # Main stylesheet (shared)
└── images/                            # Wedding images
```

## Setup Instructions

### 1. Configure Guest Data from XLS

Edit `guest-data.js` to add guests from your XLS file. The XLS should contain:
- **mainGuest**: The primary guest's name
- **code**: Unique access code for this guest
- **numGuests**: Total number of guests in this party

Each guest entry in `guest-data.js`:

```javascript
"CODE123": {
  mainGuest: "John Smith",              // From XLS mainGuest column
  code: "CODE123",                      // From XLS code column
  numGuests: 3,                         // From XLS numGuests column
  receptionTime: "6:00 PM",             // Reception start time
  receptionVenue: "Grand Ballroom",     // Reception venue name
  address: "123 Wedding Lane",          // Street address
  city: "New York, NY",                 // City and state
  date: "August 15, 2026"               // Wedding date
}
```

### 2. How numGuests Works

The system automatically generates RSVP forms based on the `numGuests` value:

- **numGuests = 1**: Shows form for main guest only (name pre-filled, dietary restrictions)
- **numGuests = 2**: Shows form for main guest + 1 additional guest (name, dietary, child checkbox + age if applicable)
- **numGuests = 3+**: Shows form for main guest + (numGuests-1) additional guests, each with name, dietary, child checkbox + age

### 3. Code Distribution

When sending invitations, provide each guest with their unique code. For example:
- "Your access code is: ABC123"
- "Access your invitation at [website-url]/invitation/ and enter your code"

## How It Works

1. **Guest Access**: Guests visit `/invitation/` and enter their code
2. **Authentication**: System validates code against guest data
3. **Reception Details**: Guest sees reception information (time, venue, address)
4. **Dynamic Forms**: RSVP form generates based on numGuests value
5. **Guest Information**: Main guest name is pre-filled; additional guests enter their details
6. **Child Identification**: For additional guests, checkbox to indicate if child (shows age field if yes)
7. **RSVP Submission**: All guest data collected and stored locally

## Form Fields

For each guest (main + additional):
- **Full Name**: Required field (pre-filled for main guest)
- **Dietary Restrictions**: Optional textarea for allergies/restrictions
- **Is this guest a child?**: Checkbox for additional guests only
- **Child's Age**: Number field (0-18) shown only if child checkbox is checked

Contact information (email, phone) is collected once per party.

## Customization

### Update Wedding Details

Edit the following in `guest-data.js`:
- Wedding date
- Reception time
- Reception venue name
- Address and city

### Update Styling

The invitation pages use:
- Main styles from `styles.css` (your existing wedding theme)
- Custom styles from `invitation/invitation-styles.css`

Modify colors, fonts, and layout in these files to match your preferences.

### RSVP Deadline

Update the RSVP deadline text in `invitation/guest.html`:
```html
<p>Please let us know if you can join us by <span id="rsvp-deadline">July 15, 2026</span></p>
```

## Testing

Test the system with the example codes in `guest-data.js`:
- `ABC123` - 1 guest (solo)
- `DEF456` - 2 guests (main + 1)
- `GHI789` - 4 guests (main + 3)

## Deployment

This is a static site designed for GitHub Pages. Simply push to your repository and it will be live at:
`https://juliusandluzalen-wedding.github.io/`

The invitation system will be accessible at:
`https://juliusandluzalen-wedding.github.io/invitation/`

## Data Storage

RSVP responses are currently stored in browser localStorage under the key `wedding_rsvp_submissions_v2`. The stored data includes:
- Guest code
- Main guest name
- Number of guests
- Attendance response
- Individual guest details (name, dietary, child status, age)
- Contact information (email, phone)
- Submission timestamp

## Future Enhancements

- Google Sheets integration for RSVP data collection
- Email notifications for RSVP confirmations
- Admin dashboard to view RSVP responses
- XLS file import automation
- Multi-language support

## Support

For questions or issues, contact: juliusandluzalen@gmail.com
