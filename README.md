# UniServe - Campus Resource Booking System

## 🎯 Project Overview

The Campus Resource Booking System is a centralized web-based application designed to automate the booking, approval, and management of campus resources such as classrooms, laboratories, seminar halls, and equipment. This system eliminates manual booking processes, prevents double bookings, and ensures efficient resource utilization through role-based access control and approval workflows.

## 📋 Problem Statement

Many educational institutions face challenges with manual resource booking processes:
- **Double bookings** due to lack of centralized tracking
- **Lack of transparency** in resource availability
- **Delays in approvals** through informal communication channels
- **Inefficient resource utilization** and planning
- **No audit trail** for accountability

## ✨ Key Features

- **Centralized Resource Management**: Single platform for all campus resources
- **Conflict-Free Scheduling**: Automatic detection of booking conflicts
- **Role-Based Access Control**: Different permissions for students, faculty, coordinators, and admins
- **Approval Workflow**: Multi-level approval system for booking requests
- **Real-Time Notifications**: Status updates for booking requests
- **Reports & Analytics**: Resource utilization and usage statistics
- **Search & Filtering**: Easy discovery of available resources

## 👥 User Roles

1. **Students**: Request resources for events/projects
2. **Faculty**: Book resources for classes/labs
3. **Department Coordinators**: Approve/reject booking requests
4. **Admin**: Manage users, resources, and system configuration
5. **Management**: View reports and utilization analytics

## 🏗️ System Architecture

The system follows a **3-tier architecture**:
- **Presentation Layer**: Web-based user interface (React)
- **Business Logic Layer**: Core application logic and workflows (Node.js/Express)
- **Data Layer**: Database management system (PostgreSQL)

## 📂 Project Structure

```
UniServe/
├── docs/                          # Documentation
│   ├── requirements/              # Requirements documents
│   │   └── SRS.md                # Software Requirements Specification
│   └── DEVELOPMENT.md            # Development guide
├── src/                           # Source code
│   ├── backend/                   # Node.js/Express backend
│   │   ├── src/
│   │   │   ├── config/           # Configuration
│   │   │   ├── controllers/      # Route controllers
│   │   │   ├── middleware/       # Express middleware
│   │   │   ├── models/           # Sequelize models
│   │   │   ├── routes/           # API routes
│   │   │   └── utils/            # Utilities
│   │   ├── package.json
│   │   └── server.js
│   ├── frontend/                  # React frontend
│   │   ├── src/
│   │   │   ├── components/       # React components
│   │   │   ├── pages/            # Page components
│   │   │   ├── services/         # API services
│   │   │   ├── store/            # State management
│   │   │   └── utils/            # Utilities
│   │   ├── package.json
│   │   └── vite.config.js
│   └── database/                  # Database scripts
│       ├── schema.sql
│       └── README.md
├── tests/                         # Test cases
└── deployment/                    # Deployment scripts
```

## 🛠️ Technology Stack

### Backend
- **Framework**: Node.js with Express.js
- **Database**: PostgreSQL with Sequelize ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: bcryptjs, helmet, cors
- **Validation**: express-validator
- **Logging**: Winston, Morgan

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **UI Library**: Material-UI (MUI)
- **Routing**: React Router v6
- **State Management**: Zustand
- **Forms**: Formik + Yup validation
- **HTTP Client**: Axios
- **Notifications**: React Toastify
- **Date Handling**: date-fns

### DevOps
- **Version Control**: Git
- **Package Manager**: npm
- **Development**: Nodemon (backend), Vite HMR (frontend)

## 📊 Project Status

**Current Phase**: Development Complete ✅

- ✅ **Requirement Analysis & SRS**: Complete
- ✅ **System Design & Architecture**: Complete
- ✅ **Development**: Complete
  - Backend API fully implemented
  - Frontend UI fully implemented
  - Database schema created
  - Authentication system working
  - Booking workflow implemented
- ⏳ **Testing**: Ready to begin
- ⏳ **Deployment**: Ready for deployment
- ⏳ **Documentation**: In progress

## 🚀 Getting Started

### Prerequisites
- Node.js 16+
- PostgreSQL 12+
- Git
- Modern web browser

### Installation

1. **Database Setup**
```bash
# Create database
createdb crbs_db

# Run schema
psql -d crbs_db -f src/database/schema.sql
```

2. **Backend Setup**
```bash
cd src/backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run dev
```

3. **Frontend Setup**
```bash
cd src/frontend
npm install
cp .env.example .env
npm run dev
```

4. **Access the Application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api/v1

### Default Admin Credentials
- Email: `admin@uniserve.edu`
- Password: `admin123`

## 📝 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/me` - Get current user
- `PUT /api/v1/auth/profile` - Update profile
- `PUT /api/v1/auth/change-password` - Change password

### Resources
- `GET /api/v1/resources` - Get all resources (with filters)
- `GET /api/v1/resources/:id` - Get resource by ID
- `POST /api/v1/resources` - Create resource (Admin only)
- `PUT /api/v1/resources/:id` - Update resource (Admin only)
- `DELETE /api/v1/resources/:id` - Delete resource (Admin only)

### Bookings
- `GET /api/v1/bookings` - Get all bookings
- `GET /api/v1/bookings/:id` - Get booking by ID
- `POST /api/v1/bookings` - Create booking
- `GET /api/v1/bookings/available` - Search available resources
- `PUT /api/v1/bookings/:id/approve` - Approve booking (Coordinator/Admin)
- `PUT /api/v1/bookings/:id/reject` - Reject booking (Coordinator/Admin)
- `PUT /api/v1/bookings/:id/cancel` - Cancel booking

## 👥 User Roles & Permissions

| Role | Permissions |
|------|------------|
| **Student** | Create bookings, View own bookings, Cancel own bookings |
| **Faculty** | Same as Student + Priority booking |
| **Coordinator** | Approve/Reject bookings, View department bookings |
| **Admin** | Full access: Manage users, resources, all bookings |
| **Management** | Read-only access to reports and analytics |

## 🔐 Security Features

- Password hashing with bcrypt (10 rounds)
- JWT token authentication
- Account lockout after 5 failed login attempts (30 min)
- HTTPS recommended for production
- SQL injection prevention via ORM
- XSS protection via helmet
- CORS configuration
- Input validation and sanitization

## 📖 Documentation

Detailed documentation is available in the `/docs` folder:
- [Software Requirements Specification (SRS)](docs/requirements/SRS.md)
- [Development Guide](docs/DEVELOPMENT.md)
- [Database Setup](src/database/README.md)

## 🧪 Testing

```bash
# Backend tests
cd src/backend
npm test

# Frontend tests
cd src/frontend
npm test
```

## 📦 Deployment

### Backend Deployment
```bash
cd src/backend
npm install --production
NODE_ENV=production npm start
```

### Frontend Build
```bash
cd src/frontend
npm run build
# Serve the dist/ folder
```

## 🔄 Future Enhancements

- [ ] Recurring bookings support
- [ ] Email/SMS notifications
- [ ] Resource utilization reports
- [ ] Calendar view for bookings
- [ ] Mobile app
- [ ] QR code for booking confirmation
- [ ] Integration with institutional LDAP/AD
- [ ] Real-time availability updates (WebSocket)
- [ ] Advanced analytics dashboard

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Team

- K Chanikya
- B Hemanth
-  B Vignesh
-  Vivek
  
