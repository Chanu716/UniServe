# Software Requirements Specification (SRS)
## Campus Resource Booking System

**Version**: 1.0  
**Date**: February 4, 2026  
**Prepared by**: CRBS Development Team  

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Overall Description](#2-overall-description)
3. [Specific Requirements](#3-specific-requirements)
4. [External Interface Requirements](#4-external-interface-requirements)
5. [System Features](#5-system-features)
6. [Non-Functional Requirements](#6-non-functional-requirements)
7. [Other Requirements](#7-other-requirements)
8. [Appendices](#8-appendices)

---

## 1. Introduction

### 1.1 Purpose
This Software Requirements Specification (SRS) document provides a complete description of the Campus Resource Booking System (CRBS). It details the functional and non-functional requirements, system constraints, and interfaces for the system that will automate campus resource booking and management.

### 1.2 Scope
The Campus Resource Booking System is a web-based application that enables:
- Centralized booking of campus resources (classrooms, labs, seminar halls, equipment)
- Role-based access control for different user types
- Approval workflow for booking requests
- Conflict detection and prevention
- Resource utilization tracking and reporting
- Notification system for booking status updates

**Benefits**:
- Eliminates manual booking processes
- Prevents double bookings
- Improves resource utilization
- Provides transparency and accountability
- Reduces administrative overhead

### 1.3 Definitions, Acronyms, and Abbreviations

| Term | Definition |
|------|------------|
| CRBS | Campus Resource Booking System |
| SRS | Software Requirements Specification |
| UI | User Interface |
| RBAC | Role-Based Access Control |
| API | Application Programming Interface |
| DB | Database |
| JWT | JSON Web Token |

### 1.4 References
- IEEE Std 830-1998: IEEE Recommended Practice for Software Requirements Specifications
- Institution Resource Management Policy
- Data Protection and Privacy Regulations

### 1.5 Overview
The remainder of this document provides:
- Overall system description and context
- Detailed functional requirements
- Non-functional requirements
- Interface specifications
- System constraints and assumptions

---

## 2. Overall Description

### 2.1 Product Perspective
CRBS is a new, self-contained system that will replace the current manual booking process. The system consists of:
- **Web Application**: Browser-based interface accessible from any device
- **Database System**: Centralized data storage for users, resources, and bookings
- **Notification Service**: Email/SMS notifications for booking updates
- **Reporting Module**: Analytics and usage reports

### 2.2 Product Functions
The major functions of CRBS include:

1. **User Authentication & Authorization**
   - Secure login/logout
   - Role-based access control
   - Password management

2. **Resource Management**
   - Add/edit/delete resources
   - Define resource attributes (capacity, location, type)
   - Set availability schedules

3. **Booking Management**
   - Search available resources
   - Create booking requests
   - View booking status
   - Cancel bookings

4. **Approval Workflow**
   - Review pending requests
   - Approve/reject bookings
   - Add approval comments

5. **Notifications**
   - Booking confirmation
   - Status updates
   - Reminders

6. **Reports & Analytics**
   - Resource utilization reports
   - Booking history
   - Usage statistics

### 2.3 User Classes and Characteristics

| User Class | Characteristics | Functions |
|------------|----------------|-----------|
| **Student** | - Basic technical skills<br>- Occasional users<br>- Limited privileges | - Create booking requests<br>- View own bookings<br>- Cancel own bookings |
| **Faculty** | - Moderate technical skills<br>- Regular users<br>- Medium privileges | - Create booking requests<br>- View own bookings<br>- Priority booking for classes |
| **Department Coordinator** | - Good technical skills<br>- Frequent users<br>- Approval authority | - Approve/reject bookings<br>- View department bookings<br>- Generate reports |
| **Admin** | - Advanced technical skills<br>- Power users<br>- Full system access | - Manage users<br>- Manage resources<br>- System configuration<br>- Full reporting |
| **Management** | - Basic technical skills<br>- Occasional users<br>- Read-only access | - View reports<br>- Analyze utilization<br>- Export data |

### 2.4 Operating Environment
- **Client Side**: Modern web browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- **Server Side**: 
  - Web Server: Node.js 16+ / Python 3.8+ / Java 11+
  - Database Server: PostgreSQL 12+ / MySQL 8+
  - OS: Linux (Ubuntu 20.04+) / Windows Server 2019+
- **Network**: Intranet/Internet access with minimum 10 Mbps bandwidth

### 2.5 Design and Implementation Constraints
- Must use institutional authentication system (if exists)
- Must comply with data privacy regulations
- Must be accessible on mobile devices
- Must support minimum 500 concurrent users
- Database must support transactions for consistency
- Must follow web accessibility standards (WCAG 2.1)

### 2.6 Assumptions and Dependencies
**Assumptions**:
- Users have basic computer literacy
- Stable internet connectivity is available
- Institutional email system is operational
- Accurate resource data will be provided

**Dependencies**:
- Email server for notifications
- Institution's user directory (LDAP/Active Directory)
- Browser compatibility
- Third-party libraries and frameworks

---

## 3. Specific Requirements

### 3.1 Functional Requirements

#### 3.1.1 User Management Module

**FR-UM-01**: User Registration
- **Description**: System shall allow new users to register with institutional email
- **Input**: Name, email, department, role, password
- **Processing**: Validate email domain, check uniqueness, hash password
- **Output**: User account created, confirmation email sent
- **Priority**: High

**FR-UM-02**: User Login
- **Description**: System shall authenticate users with email and password
- **Input**: Email, password
- **Processing**: Verify credentials, generate session token
- **Output**: Access token, redirect to dashboard
- **Priority**: Critical

**FR-UM-03**: Password Reset
- **Description**: System shall allow users to reset forgotten passwords
- **Input**: Email address
- **Processing**: Verify email, send reset link
- **Output**: Password reset email sent
- **Priority**: Medium

**FR-UM-04**: User Profile Management
- **Description**: Users shall be able to view and update their profile
- **Input**: Profile fields (name, phone, department)
- **Processing**: Validate and update database
- **Output**: Profile updated confirmation
- **Priority**: Medium

**FR-UM-05**: Role Assignment
- **Description**: Admin shall be able to assign/modify user roles
- **Input**: User ID, new role
- **Processing**: Update user permissions
- **Output**: Role updated confirmation
- **Priority**: High

#### 3.1.2 Resource Management Module

**FR-RM-01**: Add Resource
- **Description**: Admin shall be able to add new resources
- **Input**: Resource name, type, capacity, location, amenities
- **Processing**: Validate data, create resource record
- **Output**: Resource created successfully
- **Priority**: High

**FR-RM-02**: Edit Resource
- **Description**: Admin shall be able to modify resource details
- **Input**: Resource ID, updated fields
- **Processing**: Validate data, update resource record
- **Output**: Resource updated successfully
- **Priority**: High

**FR-RM-03**: Delete Resource
- **Description**: Admin shall be able to delete resources
- **Input**: Resource ID
- **Processing**: Check for active bookings, soft delete
- **Output**: Resource deleted successfully
- **Priority**: Medium

**FR-RM-04**: View Resource Details
- **Description**: Users shall be able to view resource information
- **Input**: Resource ID
- **Processing**: Retrieve resource details from database
- **Output**: Display resource information
- **Priority**: High

**FR-RM-05**: Set Resource Availability
- **Description**: Admin shall define resource availability schedule
- **Input**: Resource ID, days, time slots, blackout dates
- **Processing**: Create availability rules
- **Output**: Availability configured
- **Priority**: High

#### 3.1.3 Booking Module

**FR-BM-01**: Search Resources
- **Description**: Users shall search for available resources
- **Input**: Date, time, resource type, capacity, amenities
- **Processing**: Query available resources matching criteria
- **Output**: List of available resources
- **Priority**: Critical

**FR-BM-02**: Create Booking Request
- **Description**: Users shall be able to request resource bookings
- **Input**: Resource ID, date, start time, end time, purpose
- **Processing**: Validate availability, check conflicts, create request
- **Output**: Booking request submitted
- **Priority**: Critical

**FR-BM-03**: Conflict Detection
- **Description**: System shall prevent overlapping bookings
- **Input**: Resource ID, date, time range
- **Processing**: Check existing bookings for conflicts
- **Output**: Conflict alert or confirmation
- **Priority**: Critical

**FR-BM-04**: View Bookings
- **Description**: Users shall view their booking history
- **Input**: User ID, date range, status filter
- **Processing**: Retrieve user bookings from database
- **Output**: List of bookings
- **Priority**: High

**FR-BM-05**: Cancel Booking
- **Description**: Users shall be able to cancel their bookings
- **Input**: Booking ID
- **Processing**: Check cancellation policy, update status
- **Output**: Booking cancelled, notification sent
- **Priority**: High

**FR-BM-06**: Recurring Bookings
- **Description**: Faculty shall be able to create recurring bookings
- **Input**: Resource ID, date range, days of week, time
- **Processing**: Create multiple booking instances
- **Output**: Recurring bookings created
- **Priority**: Medium

#### 3.1.4 Approval Workflow Module

**FR-AW-01**: View Pending Requests
- **Description**: Coordinators shall view pending booking requests
- **Input**: Department filter, date range
- **Processing**: Retrieve pending requests for department
- **Output**: List of pending requests
- **Priority**: High

**FR-AW-02**: Approve Booking
- **Description**: Coordinators shall approve booking requests
- **Input**: Booking ID, approval notes
- **Processing**: Update booking status, send notification
- **Output**: Booking approved
- **Priority**: Critical

**FR-AW-03**: Reject Booking
- **Description**: Coordinators shall reject booking requests
- **Input**: Booking ID, rejection reason
- **Processing**: Update booking status, send notification
- **Output**: Booking rejected
- **Priority**: High

**FR-AW-04**: Escalation
- **Description**: System shall escalate pending requests after timeout
- **Input**: Pending request, timeout period
- **Processing**: Notify higher authority
- **Output**: Escalation notification sent
- **Priority**: Medium

#### 3.1.5 Notification Module

**FR-NM-01**: Booking Confirmation
- **Description**: System shall send confirmation on successful booking
- **Input**: Booking details, user email
- **Processing**: Format email, send notification
- **Output**: Email sent to user
- **Priority**: High

**FR-NM-02**: Status Update Notification
- **Description**: System shall notify users of booking status changes
- **Input**: Booking ID, new status
- **Processing**: Send email/SMS notification
- **Output**: Notification delivered
- **Priority**: High

**FR-NM-03**: Reminder Notification
- **Description**: System shall send reminders before booking time
- **Input**: Booking details, reminder time
- **Processing**: Schedule and send reminder
- **Output**: Reminder sent
- **Priority**: Medium

#### 3.1.6 Reporting Module

**FR-RP-01**: Resource Utilization Report
- **Description**: System shall generate resource utilization reports
- **Input**: Date range, resource filter
- **Processing**: Calculate usage statistics
- **Output**: Utilization report (PDF/Excel)
- **Priority**: Medium

**FR-RP-02**: Booking History Report
- **Description**: Users shall view their booking history
- **Input**: User ID, date range
- **Processing**: Retrieve and format booking data
- **Output**: Booking history report
- **Priority**: Medium

**FR-RP-03**: Department Usage Report
- **Description**: Coordinators shall view department-wise usage
- **Input**: Department, date range
- **Processing**: Aggregate department bookings
- **Output**: Department usage report
- **Priority**: Medium

**FR-RP-04**: Peak Usage Analysis
- **Description**: Admin shall view peak usage patterns
- **Input**: Date range
- **Processing**: Analyze booking patterns
- **Output**: Peak usage analytics
- **Priority**: Low

---

## 4. External Interface Requirements

### 4.1 User Interface Requirements
- **UI-01**: System shall provide a responsive web interface
- **UI-02**: Interface shall be accessible on desktop and mobile devices
- **UI-03**: System shall follow Material Design / Bootstrap guidelines
- **UI-04**: Forms shall include client-side validation
- **UI-05**: System shall provide visual feedback for user actions
- **UI-06**: Interface shall support English language (extensible to other languages)

### 4.2 Hardware Interfaces
- **HW-01**: System shall be accessible via standard web browsers
- **HW-02**: No special hardware requirements on client side
- **HW-03**: Server hardware shall support minimum 500 concurrent users

### 4.3 Software Interfaces
- **SW-01**: Database Management System (PostgreSQL/MySQL)
  - Purpose: Store all application data
  - Interface: SQL queries via ORM
  
- **SW-02**: Email Server (SMTP)
  - Purpose: Send notifications
  - Interface: SMTP protocol
  
- **SW-03**: Authentication Service (Optional LDAP/Active Directory)
  - Purpose: User authentication
  - Interface: LDAP protocol

### 4.4 Communication Interfaces
- **CM-01**: HTTP/HTTPS protocol for web communication
- **CM-02**: RESTful API for frontend-backend communication
- **CM-03**: WebSocket for real-time notifications (optional)
- **CM-04**: JSON data format for API requests/responses

---

## 5. System Features

### Feature 1: Conflict-Free Booking
**Priority**: Critical  
**Description**: Prevent double booking of resources

**Functional Requirements**:
- System shall check for time conflicts before confirming booking
- System shall lock resource during booking creation
- System shall display alternative time slots if conflict detected
- System shall allow concurrent searches but sequential bookings

### Feature 2: Role-Based Access Control
**Priority**: Critical  
**Description**: Different access levels for different user roles

**Functional Requirements**:
- System shall restrict functions based on user role
- System shall prevent unauthorized access to admin functions
- System shall log all administrative actions
- System shall allow role modification by admin only

### Feature 3: Approval Workflow
**Priority**: High  
**Description**: Multi-level approval for bookings

**Functional Requirements**:
- System shall route requests to appropriate approver
- System shall track approval status
- System shall allow comments during approval
- System shall notify users of approval decisions

### Feature 4: Search and Filter
**Priority**: High  
**Description**: Advanced search for available resources

**Functional Requirements**:
- System shall support search by date, time, type, capacity
- System shall filter by amenities and location
- System shall display results in sortable format
- System shall show real-time availability

---

## 6. Non-Functional Requirements

### 6.1 Performance Requirements
- **PF-01**: System shall support minimum 500 concurrent users
- **PF-02**: Page load time shall not exceed 3 seconds
- **PF-03**: Search results shall be displayed within 2 seconds
- **PF-04**: Booking creation shall complete within 1 second
- **PF-05**: Database queries shall be optimized with indexing
- **PF-06**: System shall handle 1000 bookings per day

### 6.2 Safety Requirements
- **SF-01**: System shall maintain data backups daily
- **SF-02**: System shall log all critical operations
- **SF-03**: System shall prevent data corruption through transactions
- **SF-04**: System shall have disaster recovery plan

### 6.3 Security Requirements
- **SC-01**: All passwords shall be hashed using bcrypt/scrypt
- **SC-02**: System shall use HTTPS for all communications
- **SC-03**: Session tokens shall expire after 24 hours of inactivity
- **SC-04**: System shall implement SQL injection prevention
- **SC-05**: System shall implement XSS attack prevention
- **SC-06**: System shall log failed login attempts
- **SC-07**: System shall lock accounts after 5 failed login attempts
- **SC-08**: System shall encrypt sensitive data in database

### 6.4 Software Quality Attributes

#### 6.4.1 Reliability
- **RL-01**: System uptime shall be 99.5% minimum
- **RL-02**: Mean time between failures (MTBF) > 720 hours
- **RL-03**: Mean time to repair (MTTR) < 2 hours

#### 6.4.2 Availability
- **AV-01**: System shall be available 24/7
- **AV-02**: Planned maintenance shall be scheduled during low-usage hours
- **AV-03**: System shall notify users of scheduled downtime

#### 6.4.3 Maintainability
- **MT-01**: Code shall follow coding standards
- **MT-02**: System shall be modular for easy updates
- **MT-03**: Code shall be documented with comments
- **MT-04**: System shall maintain version control

#### 6.4.4 Portability
- **PT-01**: System shall run on Linux and Windows servers
- **PT-02**: System shall be database-agnostic (via ORM)
- **PT-03**: System shall be deployable in cloud or on-premise

#### 6.4.5 Usability
- **US-01**: New users shall complete booking within 5 minutes
- **US-02**: System shall provide contextual help
- **US-03**: Error messages shall be user-friendly
- **US-04**: Interface shall be intuitive and consistent

#### 6.4.6 Scalability
- **SL-01**: System shall support adding new departments
- **SL-02**: System shall support adding new resource types
- **SL-03**: Database shall support horizontal scaling
- **SL-04**: Application shall support load balancing

---

## 7. Other Requirements

### 7.1 Legal Requirements
- **LG-01**: System shall comply with data protection regulations
- **LG-02**: System shall maintain user privacy
- **LG-03**: System shall provide terms of service

### 7.2 Regulatory Requirements
- **RG-01**: System shall follow institutional IT policies
- **RG-02**: System shall maintain audit trails for compliance
- **RG-03**: System shall provide data export for audits

### 7.3 Internationalization
- **I18N-01**: System shall support date/time localization
- **I18N-02**: System shall be extensible for multi-language support
- **I18N-03**: System shall support timezone handling

---

## 8. Appendices

### Appendix A: Glossary
- **Resource**: Any bookable campus asset (room, equipment, facility)
- **Booking**: A reservation of a resource for specific date and time
- **Conflict**: Overlapping bookings for the same resource
- **Coordinator**: Department representative who approves bookings

### Appendix B: Analysis Models
- Use Case Diagrams
- Activity Diagrams
- Sequence Diagrams
- Class Diagrams
- ER Diagrams

(Detailed diagrams available in `/docs/diagrams/`)

### Appendix C: To Be Determined (TBD) List
- SMS notification provider selection
- Cloud hosting provider (if applicable)
- Specific authentication protocol
- Mobile app development (future phase)

---

**Document Revision History**

| Version | Date | Author | Description |
|---------|------|--------|-------------|
| 1.0 | Feb 4, 2026 | CRBS Team | Initial SRS document |

---

**Approval**

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Project Manager | | | |
| Lead Developer | | | |
| QA Lead | | | |
| Client Representative | | | |

---

*End of Software Requirements Specification*
