import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function testSaveWorkflow() {
  console.log('🧪 Testing complete save workflow...\n');
  
  try {
    // Get first user
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (usersError || !users || users.length === 0) {
      console.error('❌ No users found');
      return;
    }
    
    const user = users[0];
    const testDate = '2025-10-18'; // Today's date
    
    console.log(`👤 Testing with user: ${user.name} (${user.id})`);
    console.log(`📅 Testing with date: ${testDate}\n`);
    
    // Step 1: Check for existing work log
    console.log('🔍 Step 1: Checking for existing work log...');
    const { data: existingWorkLog, error: fetchError } = await supabase
      .from('work_logs')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', testDate)
      .maybeSingle();
    
    if (fetchError) {
      console.error('❌ Error checking existing work log:', fetchError);
      return;
    }
    
    if (existingWorkLog) {
      console.log('✅ Found existing work log:', existingWorkLog.id);
      console.log('📊 Current hours:', existingWorkLog.hours_worked);
    } else {
      console.log('ℹ️  No existing work log found');
    }
    
    // Step 2: Create or update work log
    console.log('\n💾 Step 2: Creating/updating work log...');
    const hoursToSave = 8.5;
    const notesToSave = 'Test save workflow - automated test';
    
    let workLogId;
    
    if (!existingWorkLog) {
      // Create new work log
      const { data: newWorkLog, error: createError } = await supabase
        .from('work_logs')
        .insert([{
          user_id: user.id,
          date: testDate,
          hours_worked: hoursToSave,
          notes: notesToSave
        }])
        .select()
        .single();
      
      if (createError) {
        console.error('❌ Error creating work log:', createError);
        return;
      }
      
      workLogId = newWorkLog.id;
      console.log('✅ Created new work log:', workLogId);
    } else {
      // Update existing work log
      const { error: updateError } = await supabase
        .from('work_logs')
        .update({
          hours_worked: hoursToSave,
          notes: notesToSave
        })
        .eq('id', existingWorkLog.id);
      
      if (updateError) {
        console.error('❌ Error updating work log:', updateError);
        return;
      }
      
      workLogId = existingWorkLog.id;
      console.log('✅ Updated existing work log:', workLogId);
    }
    
    // Step 3: Add a test task
    console.log('\n📝 Step 3: Adding test task...');
    const { data: newTask, error: taskError } = await supabase
      .from('tasks')
      .insert([{
        work_log_id: workLogId,
        user_id: user.id,
        task_name: 'Test Task - Automated Test',
        description: 'This is a test task created by the save workflow test',
        status: 'Finished'
      }])
      .select()
      .single();
    
    if (taskError) {
      console.error('❌ Error creating task:', taskError);
      return;
    }
    
    console.log('✅ Created test task:', newTask.id);
    
    // Step 4: Verify data was saved correctly
    console.log('\n🔄 Step 4: Verifying saved data...');
    
    // Check work log
    const { data: savedWorkLog, error: verifyWorkLogError } = await supabase
      .from('work_logs')
      .select('*')
      .eq('id', workLogId)
      .single();
    
    if (verifyWorkLogError || !savedWorkLog) {
      console.error('❌ Error verifying work log:', verifyWorkLogError);
      return;
    }
    
    console.log('✅ Work log verified:');
    console.log(`   Hours: ${savedWorkLog.hours_worked}`);
    console.log(`   Notes: ${savedWorkLog.notes}`);
    
    // Check task
    const { data: savedTasks, error: verifyTaskError } = await supabase
      .from('tasks')
      .select('*')
      .eq('work_log_id', workLogId);
    
    if (verifyTaskError) {
      console.error('❌ Error verifying tasks:', verifyTaskError);
      return;
    }
    
    console.log(`✅ Tasks verified: ${savedTasks?.length || 0} task(s) found`);
    if (savedTasks && savedTasks.length > 0) {
      console.log(`   Latest task: ${savedTasks[savedTasks.length - 1].task_name}`);
    }
    
    // Step 5: Test metrics calculation
    console.log('\n📊 Step 5: Testing metrics calculation...');
    const { data: todayMetric, error: metricError } = await supabase
      .from('work_logs')
      .select('hours_worked')
      .eq('user_id', user.id)
      .eq('date', testDate)
      .maybeSingle();
    
    if (metricError) {
      console.error('❌ Error calculating today\'s metric:', metricError);
      return;
    }
    
    console.log('✅ Today\'s hours metric:', todayMetric?.hours_worked || 0);
    
    // Step 6: Clean up (optional - remove test data)
    console.log('\n🧹 Step 6: Cleaning up test data...');
    
    // Delete test task
    const { error: deleteTaskError } = await supabase
      .from('tasks')
      .delete()
      .eq('id', newTask.id);
    
    if (deleteTaskError) {
      console.log('⚠️  Could not clean up test task:', deleteTaskError.message);
    } else {
      console.log('✅ Test task cleaned up');
    }
    
    // Only delete work log if we created it (not if it existed before)
    if (!existingWorkLog) {
      const { error: deleteWorkLogError } = await supabase
        .from('work_logs')
        .delete()
        .eq('id', workLogId);
      
      if (deleteWorkLogError) {
        console.log('⚠️  Could not clean up test work log:', deleteWorkLogError.message);
      } else {
        console.log('✅ Test work log cleaned up');
      }
    } else {
      console.log('ℹ️  Keeping existing work log (was there before test)');
    }
    
    console.log('\n🎉 Save workflow test completed successfully!');
    
  } catch (error) {
    console.error('💥 Test failed with error:', error);
  }
}

testSaveWorkflow();