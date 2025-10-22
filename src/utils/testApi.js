// Simple API test utility
export async function testApiConnection() {
  console.log('Testing API connection...');
  
  try {
    // Test basic connectivity
    const response = await fetch('http://localhost:8000/api/Authentication/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'testuser' + Date.now(),
        password: 'testpass'
      })
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', [...response.headers.entries()]);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Success! Response data:', data);
      return { success: true, data };
    } else {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      return { success: false, error: errorText };
    }
  } catch (error) {
    console.error('Connection failed:', error);
    return { success: false, error: error.message };
  }
}

// Test CORS specifically
export async function testCors() {
  console.log('Testing CORS...');
  
  try {
    const response = await fetch('http://localhost:8000/api/Authentication/register', {
      method: 'OPTIONS',
      headers: {
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type',
        'Origin': 'http://localhost:8006'
      }
    });
    
    console.log('CORS preflight response status:', response.status);
    console.log('CORS headers:', [...response.headers.entries()]);
    
    return response.ok;
  } catch (error) {
    console.error('CORS test failed:', error);
    return false;
  }
}
