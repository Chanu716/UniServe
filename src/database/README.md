# Campus Resource Booking System - Database Setup

## Prerequisites
- PostgreSQL 12+ installed
- Database user with CREATE DATABASE privileges

## Setup Instructions

### 1. Create Database
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE crbs_db;

# Connect to the new database
\c crbs_db
```

### 2. Run Schema
```bash
# From the project root
psql -U postgres -d crbs_db -f src/database/schema.sql
```

### 3. Verify Setup
```sql
-- List all tables
\dt

-- Check users table
SELECT * FROM users;

-- Check resources table
SELECT * FROM resources;
```

## Database Configuration

Update the `.env` file in the backend directory:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=crbs_db
DB_USER=postgres
DB_PASSWORD=your_password
```

## Schema Overview

### Tables

#### users
- Stores user information and authentication data
- Supports role-based access control
- Includes account security features (login attempts, account locking)

#### resources
- Stores bookable resources (classrooms, labs, etc.)
- Includes metadata like capacity, location, amenities
- Supports soft deletion via `is_available` flag

#### bookings
- Stores booking requests and their status
- Links users and resources
- Supports recurring bookings
- Includes approval workflow fields

## Automatic Features

- **UUID Primary Keys**: All tables use UUIDs for better distribution and security
- **Timestamps**: Automatic `created_at` and `updated_at` tracking
- **Indexes**: Optimized for common query patterns
- **Constraints**: Data integrity checks at database level
- **Triggers**: Auto-update timestamps on record modification

## Sample Data

The schema includes sample data for testing:
- 1 admin user (admin@crbs.edu, password: admin123)
- 4 sample resources

## Backup and Restore

### Backup
```bash
pg_dump -U postgres crbs_db > backup.sql
```

### Restore
```bash
psql -U postgres crbs_db < backup.sql
```

## Troubleshooting

### Connection Issues
- Ensure PostgreSQL service is running
- Check firewall settings
- Verify database credentials in `.env`

### Permission Issues
```sql
GRANT ALL PRIVILEGES ON DATABASE crbs_db TO your_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_user;
```
