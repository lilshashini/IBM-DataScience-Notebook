import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('Supabase URL:', supabaseUrl ? 'Set' : 'Missing');
console.log('Supabase Key:', supabaseAnonKey ? 'Set' : 'Missing');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('\n🔌 Testing Supabase connection...');
  
  try {
    // Test basic connection by checking tables
    const { data: tables, error: tableError } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (tableError) {
      console.error('❌ Failed to connect to users table:', tableError.message);
      return false;
    }
    
    console.log('✅ Connected to users table');
    
    // Test work_logs table
    const { data: workLogs, error: workLogError } = await supabase
      .from('work_logs')
      .select('count')
      .limit(1);
    
    if (workLogError) {
      console.error('❌ Failed to connect to work_logs table:', workLogError.message);
      return false;
    }
    
    console.log('✅ Connected to work_logs table');
    
    // Test tasks table
    const { data: tasks, error: taskError } = await supabase
      .from('tasks')
      .select('count')
      .limit(1);
    
    if (taskError) {
      console.error('❌ Failed to connect to tasks table:', taskError.message);
      return false;
    }
    
    console.log('✅ Connected to tasks table');
    
    return true;
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    return false;
  }
}

async function testDataOperations() {
  console.log('\n📊 Testing data operations...');
  
  try {
    // Test reading users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(5);
    
    if (usersError) {
      console.error('❌ Failed to read users:', usersError.message);
      return false;
    }
    
    console.log('✅ Users read successfully, count:', users?.length || 0);
    if (users && users.length > 0) {
      console.log('First user:', users[0]);
      
      // Test reading work logs for the first user
      const { data: workLogs, error: workLogError } = await supabase
        .from('work_logs')
        .select('*')
        .eq('user_id', users[0].id)
        .limit(5);
      
      if (workLogError) {
        console.error('❌ Failed to read work_logs:', workLogError.message);
        return false;
      }
      
      console.log('✅ Work logs read successfully, count:', workLogs?.length || 0);
      if (workLogs && workLogs.length > 0) {
        console.log('Sample work log:', workLogs[0]);
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ Data operations test failed:', error.message);
    return false;
  }
}

async function testSaveOperation() {
  console.log('\n💾 Testing save operation (simulated)...');
  
  try {
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    if (usersError || !users || users.length === 0) {
      console.error('❌ No users found for testing save operation');
      return false;
    }
    
    const userId = users[0].id;
    const testDate = new Date().toISOString().split('T')[0]; // Today's date in YYYY-MM-DD format
    
    console.log(`Testing with user_id: ${userId}, date: ${testDate}`);
    
    // Test creating a work log (we'll rollback this)
    const { data: workLog, error: workLogError } = await supabase
      .from('work_logs')
      .insert({
        user_id: userId,
        date: testDate,
        hours_worked: 8.5,
        notes: 'Test entry - will be deleted'
      })
      .select()
      .single();
    
    if (workLogError) {
      console.error('❌ Failed to create test work log:', workLogError.message);
      console.error('Error details:', workLogError);
      return false;
    }
    
    console.log('✅ Test work log created successfully:', workLog.id);
    
    // Clean up by deleting the test record
    const { error: deleteError } = await supabase
      .from('work_logs')
      .delete()
      .eq('id', workLog.id);
    
    if (deleteError) {
      console.error('⚠️ Failed to clean up test work log:', deleteError.message);
    } else {
      console.log('✅ Test work log cleaned up successfully');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Save operation test failed:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting Supabase Connectivity Test\n');
  
  const connectionOk = await testConnection();
  if (!connectionOk) {
    process.exit(1);
  }
  
  const dataOk = await testDataOperations();
  if (!dataOk) {
    process.exit(1);
  }
  
  const saveOk = await testSaveOperation();
  if (!saveOk) {
    process.exit(1);
  }
  
  console.log('\n🎉 All tests passed! Database connectivity is working.');
}

main().catch(console.error);