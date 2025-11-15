// Quick test script to verify API response
const fetch = require('node-fetch');

async function testAPI() {
  try {
    const response = await fetch('http://localhost:5001/api/attendance', {
      headers: {
        'Authorization': 'Bearer dummy-token-for-development'
      }
    });
    
    const data = await response.json();
    
    if (data.success && data.data) {
      console.log('✅ API Response Sample (first 3 records):');
      console.log(JSON.stringify(data.data.slice(0, 3), null, 2));
      
      // Check if employee_name exists
      const firstRecord = data.data[0];
      console.log('\n📋 First Record Fields:');
      console.log('- employee_name:', firstRecord.employee_name);
      console.log('- employee_id:', firstRecord.employee_id);
      console.log('- worker_id:', firstRecord.worker_id);
    } else {
      console.log('❌ API Error:', data);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 Make sure the server is running: cd server && npm start');
  }
}

testAPI();
