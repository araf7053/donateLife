# 🩸 DonateLife - Blood Donation Management Platform

A modern, full-stack web application that connects blood donors with patients in need. Built with **MERN stack**, DonateLife streamlines the blood donation process, making it easy for hospitals, donors, and patients to connect and save lives.

![Node.js](https://img.shields.io/badge/Node.js-v16%2B-green)
![React](https://img.shields.io/badge/React-v18-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-Latest-brightgreen)
![Express](https://img.shields.io/badge/Express-v5-gray)

---

## 🎯 **Features**

### **For Blood Donors 🩸**
- ✅ Create and manage donor profiles with blood type
- ✅ View blood requests matching their blood type
- ✅ Track donation history with detailed statistics
- ✅ Real-time notifications for urgent blood requests
- ✅ Check eligibility status for donations
- ✅ Connect with patients directly

### **For Blood Requesters 🏥**
- ✅ Post urgent blood requests with patient details
- ✅ Specify blood type, units needed, and urgency level
- ✅ Search for available donors nearby
- ✅ Track request status in real-time
- ✅ Get notifications when donors respond
- ✅ Manage multiple requests simultaneously

### **For Admins 👨‍💼**
- ✅ Comprehensive dashboard with system analytics
- ✅ User management (activate, deactivate, delete)
- ✅ Monitor all blood requests and donations
- ✅ View system-wide statistics
- ✅ Filter users by role
- ✅ Track donation trends

### **Technical Features ⚙️**
- ✅ Real-time notifications via Socket.io
- ✅ JWT-based authentication
- ✅ Role-based access control (Admin, Donor, Requester)
- ✅ Intelligent rate limiting with automatic retries
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Beautiful UI with Tailwind CSS
- ✅ Email notifications

---

## 🛠️ **Tech Stack**

### **Frontend**
- React 18 - UI library
- Vite - Build tool
- Tailwind CSS - Styling
- Axios - HTTP client
- React Router - Navigation
- Context API - State management

### **Backend**
- Node.js - Runtime
- Express.js - Web framework
- MongoDB - Database
- Socket.io - Real-time communication
- JWT - Authentication
- Bcryptjs - Password hashing
- Mongoose - DB ODM

### **DevOps & Tools**
- Git & GitHub - Version control
- npm - Package manager
- Postman - API testing
- MongoDB Atlas - Cloud database

---

## 📁 **Project Structure**

```
donateLife/
├── client/                          # React Frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── auth/               # Login & Register
│   │   │   ├── admin/              # Admin Dashboard, Manage Users
│   │   │   ├── donor/              # Donor Dashboard, Profile, Donations
│   │   │   └── requester/          # Requester Dashboard, Create Requests
│   │   ├── components/             # Reusable components (Navbar, etc)
│   │   ├── context/                # Auth Context
│   │   ├── api/                    # Axios configuration
│   │   └── index.css               # Global styles
│   └── package.json
│
├── server/                         # Express Backend
│   ├── models/                     # MongoDB schemas (User, BloodRequest, etc)
│   ├── routes/                     # API routes
│   ├── controllers/                # Business logic
│   ├── middleware/                 # Auth, validation middleware
│   ├── config/                     # Database, Socket config
│   ├── services/                   # Email, geo services
│   ├── scripts/                    # Seed script for test data
│   ├── index.js                    # Entry point
│   └── package.json
│
└── README.md                       # This file
```

---

## 🚀 **Getting Started**

### **Prerequisites**
- Node.js (v16 or higher)
- npm or yarn
- MongoDB (local or Atlas)

### **Installation**

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/donateLife.git
cd donateLife
```

2. **Setup Backend**
```bash
cd server
npm install

# Create .env file
echo "MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/donateLife
JWT_SECRET=your_secret_key
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173" > .env

# Run migrations/seed
npm run seed

# Start server
npm start
```

3. **Setup Frontend**
```bash
cd client
npm install

# Start development server
npm run dev
```

4. **Access the App**
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000/api`

---

## 🧪 **Testing the Application**

### **Test Credentials**

After running `npm run seed`, use these credentials:

```
Admin Account:
  Email:    admin@test.com
  Password: password123

Donor Account:
  Email:    donor@test.com
  Password: password123

Requester Account:
  Email:    requester@test.com
  Password: password123
```

### **Quick Start Guide**

1. **As a Requester:**
   - Login with `requester@test.com`
   - Click "Create Request"
   - Fill in patient details, blood type, units needed
   - Submit the request
   - View "My Requests" to track status

2. **As a Donor:**
   - Login with `donor@test.com`
   - Go to "Available Requests"
   - See blood requests matching your blood type
   - Click "I Can Donate" to help

3. **As an Admin:**
   - Login with `admin@test.com`
   - Access Admin Dashboard at `/admin`
   - View all users and requests
   - Manage users in "Manage Users" section

---

## 📚 **API Documentation**

### **Authentication Endpoints**
```
POST   /api/auth/login        - Log in user
POST   /api/auth/register     - Register new user
```

### **Donor Endpoints**
```
GET    /api/donors/profile    - Get donor profile
POST   /api/donors/profile    - Create/update donor profile
GET    /api/donors/search     - Search available donors
GET    /api/donations/my      - Get user's donations
```

### **Request Endpoints**
```
POST   /api/requests          - Create blood request
GET    /api/requests          - Get all requests
GET    /api/requests/:id      - Get specific request
GET    /api/requests/my       - Get user's requests
PATCH  /api/requests/:id/status - Update request status
DELETE /api/requests/:id      - Delete request
```

### **Admin Endpoints**
```
GET    /api/admin/stats       - Get system statistics
GET    /api/admin/users       - Get all users
PATCH  /api/admin/users/:id   - Update user status
DELETE /api/admin/users/:id   - Delete user
```

---

## 🔒 **Security Features**

- ✅ JWT-based authentication
- ✅ Password hashing with bcryptjs
- ✅ Rate limiting (1000 requests/15 minutes)
- ✅ CORS protection
- ✅ Helmet.js for HTTP headers
- ✅ Role-based access control
- ✅ Automatic retry with exponential backoff

---

## 🐛 **Troubleshooting**

### **Port Already in Use**
If port 5000 or 5173 is already in use:
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :5000
kill -9 <PID>
```

### **MongoDB Connection Error**
- Ensure MongoDB is running locally or update `.env` with MongoDB Atlas URI
- Check credentials in `.env` file

### **"Too many requests" Error**
- Wait a few seconds and try again (automatic retry is enabled)
- Check rate limit headers in Network tab

### **Login Failed**
- Verify test credentials by running `npm run seed` again
- Check Network tab in DevTools for API response
- Ensure backend is running on port 5000

---

## 📈 **Future Enhancements**

- [ ] SMS notifications for urgent requests
- [ ] Google Maps integration for nearby donors
- [ ] Payment integration for blood screening
- [ ] Donor eligibility automated checking
- [ ] Advanced analytics and reporting
- [ ] Mobile app (React Native)
- [ ] Video consultation feature
- [ ] Hospital integration API
- [ ] Donation statistics dashboard
- [ ] Automated email reminders

---

## 🤝 **Contributing**

We welcome contributions! Here's how:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📝 **License**

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 💬 **Support**

Have questions? Feel free to:
- Open an Issue on GitHub
- Check existing discussions
- Review the documentation

---

## 🙏 **Acknowledgments**

- Built with passion to help save lives 🩸
- Special thanks to the blood donation community
- Inspired by real-world blood donation platforms

---

## 📊 **Project Stats**

- **Lines of Code:** 5000+
- **Components:** 15+
- **API Endpoints:** 25+
- **Test Users:** 3 (Admin, Donor, Requester)
- **Features:** 20+

---

**Last Updated:** April 8, 2026

Made with ❤️ for the DonateLife community

---

**Ready to save lives? [Get Started](#-getting-started) now!** 🚀
