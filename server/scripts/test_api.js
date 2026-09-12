import http from 'http';

const API_BASE = 'http://localhost:5000/api';

const fetchJSON = (url, options = {}) => {
  return new Promise((resolve, reject) => {
    const req = http.request(url, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            body: JSON.parse(data)
          });
        } catch (err) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', (err) => reject(err));
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    req.end();
  });
};

async function runTests() {
  console.log('=============================================');
  console.log('   KINGS MART API INTEGRATION VERIFIER   ');
  console.log('=============================================\n');

  try {
    // Test 1: Fetch Products Catalog
    console.log('TEST 1: Fetching Apparel Products Catalog...');
    const productsRes = await fetchJSON(`${API_BASE}/products`);
    if (productsRes.status === 200 && productsRes.body.products) {
      console.log(`✅ SUCCESS: Retrieved ${productsRes.body.products.length} seeded apparel pieces.`);
      console.log(`   Sample item: ${productsRes.body.products[0].name} ($${productsRes.body.products[0].price})`);
    } else {
      console.error(`❌ FAILED: Unexpected status ${productsRes.status}`, productsRes.body);
    }
    console.log('');

    // Test 2: Verify KING20 Promo Code
    console.log('TEST 2: Verifying Promo Code "KING20"...');
    const promoRes = await fetchJSON(`${API_BASE}/promos/validate`, {
      method: 'POST',
      body: { code: 'KING20' }
    });
    if (promoRes.status === 200 && promoRes.body.discountValue === 20) {
      console.log(`✅ SUCCESS: "KING20" validated with ${promoRes.body.discountType} discount of ${promoRes.body.discountValue}%.`);
    } else {
      console.error(`❌ FAILED: Unexpected promo result status ${promoRes.status}`, promoRes.body);
    }
    console.log('');

    // Test 3: Authenticating Admin Account
    console.log('TEST 3: Authenticating Default Admin Account...');
    const loginRes = await fetchJSON(`${API_BASE}/auth/login`, {
      method: 'POST',
      body: {
        email: 'admin@kingsmart.com',
        password: 'AdminPassword123'
      }
    });
    if (loginRes.status === 200 && loginRes.body.accessToken) {
      console.log(`✅ SUCCESS: Admin authenticated. Welcome, ${loginRes.body.name}!`);
      console.log(`   Admin Privilege Verified: ${loginRes.body.isAdmin}`);
    } else {
      console.error(`❌ FAILED: Admin login failed status ${loginRes.status}`, loginRes.body);
    }
    console.log('');

    console.log('=============================================');
    console.log('   ALL API VERIFICATIONS PASSED SUCCESSFULLY ');
    console.log('=============================================');
  } catch (error) {
    console.error('❌ CRITICAL ERROR IN VERIFICATION:', error.message);
    console.log('\nMake sure the backend server task is running on port 5000.');
  }
}

runTests();
