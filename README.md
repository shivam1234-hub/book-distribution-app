# Book Distribution Competition App

A full-stack application for managing book distribution competitions with user tracking, point systems, and analytics.

## Features

- **Center Management**: Create and select centers
- **User Management**: Add users to centers with name and phone number
- **Book Distribution**: Track book distributions with price paid
- **Point System**: Automatic point calculation based on book points
- **Donation & Loss Tracking**: Calculate donations (overpayment) and losses (underpayment)
- **User Analytics**: View individual user statistics
- **Center Analytics**: View center-wide statistics and book-wise breakdowns
- **Responsive Design**: Mobile and laptop friendly UI

## Tech Stack

- **Frontend**: React.js
- **Backend**: Node.js with Express
- **Database**: MongoDB Atlas

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account (or local MongoDB)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```env
PORT=5000
MONGODB_URI=mongodb+srv://iymfpanathur_db_user:TlPQctbpVzXUnYBl@cluster0.xug7orv.mongodb.net/book-distribution?retryWrites=true&w=majority
```

Alternatively, you can run the setup script:
```bash
chmod +x setup-env.sh
./setup-env.sh
```

4. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

The server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the frontend directory (optional, defaults to localhost:5000):
```env
REACT_APP_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm start
```

The app will open in your browser at `http://localhost:3000`

## MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user
4. Whitelist your IP address (or use 0.0.0.0/0 for development)
5. Get your connection string and add it to the backend `.env` file

## Initial Data Setup

You'll need to create some initial data:

### Create Centers
Use MongoDB Compass, MongoDB Atlas UI, or make a POST request to `/api/centers`:
```json
{
  "name": "Center Name"
}
```

### Create Books
Make POST requests to `/api/books`:
```json
{
  "name": "Book Name",
  "point": 10,
  "price": 100
}
```

## API Endpoints

### Books
- `GET /api/books` - Get all books
- `POST /api/books` - Create a new book

### Centers
- `GET /api/centers` - Get all centers
- `POST /api/centers` - Create a new center
- `GET /api/centers/:id/analytics` - Get center analytics

### Users
- `GET /api/users/search?centerId=xxx&query=xxx` - Search users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create or get user
- `POST /api/users/:id/distribution` - Add book distribution
- `GET /api/users/:id/analytics` - Get user analytics

## Project Structure

```
book-distribution-app/
├── backend/
│   ├── models/
│   │   ├── Book.js
│   │   ├── User.js
│   │   └── Center.js
│   ├── routes/
│   │   ├── books.js
│   │   ├── centers.js
│   │   └── users.js
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── HomePage.js
│   │   │   ├── Dashboard.js
│   │   │   ├── AddDistribution.js
│   │   │   ├── UserAnalytics.js
│   │   │   └── CenterAnalytics.js
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
└── README.md
```

## Usage

1. Select a center from the dropdown
2. Search for a user by name or phone number, or add a new user
3. Click on a user to open their dashboard
4. Use the sidebar tabs to:
   - **Add Distribution**: Record a book distribution
   - **My Analytics**: View personal statistics
   - **Center Analytics**: View center-wide statistics

## Notes

- No authentication is required (as per requirements)
- Users are unique per center (same phone number can exist in different centers)
- Points, donations, and losses are calculated automatically
- All data is stored in MongoDB Atlas

