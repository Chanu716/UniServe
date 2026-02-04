-- Campus Resource Booking System Database Schema
-- PostgreSQL Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'faculty', 'coordinator', 'admin', 'management')),
    department VARCHAR(100),
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    failed_login_attempts INTEGER DEFAULT 0,
    account_locked_until TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Resources table
CREATE TABLE resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('classroom', 'laboratory', 'seminar_hall', 'auditorium', 'equipment', 'other')),
    capacity INTEGER CHECK (capacity >= 0),
    location VARCHAR(200),
    building VARCHAR(100),
    floor VARCHAR(20),
    description TEXT,
    amenities TEXT[],
    is_available BOOLEAN DEFAULT TRUE,
    image_url VARCHAR(500),
    department VARCHAR(100),
    requires_approval BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bookings table
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    purpose TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled', 'completed')),
    approved_by UUID REFERENCES users(id),
    approval_notes TEXT,
    rejection_reason TEXT,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_pattern JSONB,
    parent_booking_id UUID REFERENCES bookings(id),
    attendees_count INTEGER,
    special_requirements TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- Indexes for better query performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_resources_type ON resources(type);
CREATE INDEX idx_resources_available ON resources(is_available);
CREATE INDEX idx_bookings_resource_time ON bookings(resource_id, start_time, end_time);
CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_start_time ON bookings(start_time);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to auto-update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resources_updated_at BEFORE UPDATE ON resources
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample data for testing (optional)
-- Insert admin user (password: admin123)
INSERT INTO users (name, email, password, role, department) VALUES
('Admin User', 'admin@crbs.edu', '$2a$10$8kZ8KqZ8KqZ8KqZ8KqZ8KuYqZ8KqZ8KqZ8KqZ8KqZ8KqZ8KqZ8KqZ', 'admin', 'IT');

-- Insert sample resources
INSERT INTO resources (name, type, capacity, location, building, floor, amenities) VALUES
('Room 101', 'classroom', 30, 'First Floor', 'Main Building', '1', ARRAY['Projector', 'Whiteboard', 'AC']),
('Lab A1', 'laboratory', 25, 'Second Floor', 'Science Block', '2', ARRAY['Computers', 'Network', 'AC']),
('Seminar Hall 1', 'seminar_hall', 100, 'Ground Floor', 'Admin Building', '0', ARRAY['Projector', 'Sound System', 'AC']),
('Auditorium', 'auditorium', 500, 'Ground Floor', 'Central Block', '0', ARRAY['Stage', 'Sound System', 'Lighting', 'AC']);
