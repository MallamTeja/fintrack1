# Fintrack

A modern financial tracking application with a clean, responsive user interface.

## Features

- User Authentication (Login/Register)
- Modern UI with Light/Dark theme support
- Responsive design
- Password strength validation
- Form validation
- Secure API endpoints

## Tech Stack

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express.js
- Database: MongoDB
- Authentication: JWT

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/fintrack.git
cd fintrack
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```
MONGODB_URI=your_mongodb_connection_string
PORT=5000
JWT_SECRET=your_jwt_secret
```

4. Start the server:
```bash
node server.js
```

5. Open your browser and navigate to `http://localhost:5000`

## Project Structure

```
fintrack/
├── public/           # Static files
│   ├── login.html    # Login page
│   ├── register.html # Registration page
│   └── dashboard.html# Main dashboard
├── config/          # Configuration files
├── models/          # Database models
├── server.js        # Express server
└── package.json     # Project dependencies
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 