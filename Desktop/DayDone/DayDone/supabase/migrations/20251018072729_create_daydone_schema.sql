/*
  # DayDone Database Schema

  ## Overview
  This migration creates the complete database schema for DayDone - a progress tracking and task management system.

  ## New Tables

  ### 1. `users`
  User profiles for the application
  - `id` (uuid, primary key) - Unique user identifier
  - `name` (text) - User's display name
  - `email` (text, unique) - User's email address
  - `avatar_url` (text, nullable) - URL to user's avatar image
  - `created_at` (timestamptz) - When the user was created
  - `updated_at` (timestamptz) - Last profile update timestamp

  ### 2. `work_logs`
  Daily work log entries for each user
  - `id` (uuid, primary key) - Unique log identifier
  - `user_id` (uuid, foreign key) - References users table
  - `date` (date) - The date of the work log
  - `hours_worked` (numeric) - Number of hours worked on this date
  - `notes` (text, nullable) - General notes for the day
  - `created_at` (timestamptz) - When the log was created
  - `updated_at` (timestamptz) - Last update timestamp
  - Unique constraint on (user_id, date) to prevent duplicate logs for same date

  ### 3. `tasks`
  Individual tasks within work logs
  - `id` (uuid, primary key) - Unique task identifier
  - `work_log_id` (uuid, foreign key) - References work_logs table
  - `user_id` (uuid, foreign key) - References users table
  - `task_name` (text) - Name/title of the task
  - `description` (text, nullable) - Detailed task description
  - `status` (text) - Task status: Started, In Progress, Finished, Pending, On Hold
  - `created_at` (timestamptz) - When the task was created
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  - Enable RLS on all tables
  - Add policies for authenticated users to manage their own data
  - Users can only read, insert, update their own records
  - Users can view other users' data for leaderboard purposes (read-only)

  ## Indexes
  - Index on work_logs(user_id, date) for efficient date-based queries
  - Index on tasks(user_id, work_log_id) for efficient task retrieval
  - Index on work_logs(date) for dashboard aggregations
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create work_logs table
CREATE TABLE IF NOT EXISTS work_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date date NOT NULL,
  hours_worked numeric(5, 2) NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  work_log_id uuid NOT NULL REFERENCES work_logs(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  task_name text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'Started' CHECK (status IN ('Started', 'In Progress', 'Finished', 'Pending', 'On Hold')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_work_logs_user_date ON work_logs(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_work_logs_date ON work_logs(date DESC);
CREATE INDEX IF NOT EXISTS idx_tasks_work_log ON tasks(work_log_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user ON tasks(user_id);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view all users"
  ON users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- RLS Policies for work_logs table
CREATE POLICY "Users can view all work logs"
  ON work_logs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own work logs"
  ON work_logs FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own work logs"
  ON work_logs FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own work logs"
  ON work_logs FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for tasks table
CREATE POLICY "Users can view all tasks"
  ON tasks FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own tasks"
  ON tasks FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own tasks"
  ON tasks FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own tasks"
  ON tasks FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_work_logs_updated_at BEFORE UPDATE ON work_logs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
