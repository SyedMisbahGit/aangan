(async () => {
  const fetch = (await import('node-fetch')).default;
  const base = 'http://localhost:3001';
  const log = (desc, res) => console.log(`\n--- ${desc} ---\n`, res);

  // 1. Health check
  let res = await fetch(`${base}/api/health`);
  log('GET /api/health', await res.json());

  // 2. Get whispers
  res = await fetch(`${base}/api/whispers`);
  log('GET /api/whispers', await res.json());

  // 3. Get feature toggles
  res = await fetch(`${base}/api/features/toggles`);
  log('GET /api/features/toggles', await res.json());

  // 4. Post a whisper
  res = await fetch(`${base}/api/whispers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: 'Test whisper', emotion: 'joy', zone: 'TestZone' })
  });
  log('POST /api/whispers', await res.json());

  // 5. Register FCM token
  res = await fetch(`${base}/api/fcm-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: 'testtoken123' })
  });
  log('POST /api/fcm-token', await res.json());

  // 6. Login as admin
  res = await fetch(`${base}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'admin123' })
  });
  const login = await res.json();
  log('POST /api/auth/login', login);
  const token = login.token;
  if (!token) {
    console.error('No admin token, skipping admin-only tests.');
    return;
  }
  const auth = { 'Authorization': `Bearer ${token}` };

  // 7. Verify token
  res = await fetch(`${base}/api/auth/verify`, { headers: auth });
  log('GET /api/auth/verify', await res.json());

  // 8. Analytics whispers
  res = await fetch(`${base}/api/analytics/whispers`, { headers: auth });
  log('GET /api/analytics/whispers', await res.json());

  // 9. Analytics zones
  res = await fetch(`${base}/api/analytics/zones`, { headers: auth });
  log('GET /api/analytics/zones', await res.json());

  // 10. Feature toggle update
  res = await fetch(`${base}/api/features/toggles`, {
    method: 'POST',
    headers: { ...auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({ feature: 'testFeature', enabled: true })
  });
  log('POST /api/features/toggles', await res.json());

  // 11. Broadcast notification (will likely fail if FCM not set up)
  res = await fetch(`${base}/api/admin/broadcast`, {
    method: 'POST',
    headers: { ...auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Test', body: 'Hello', url: 'https://example.com' })
  });
  log('POST /api/admin/broadcast', await res.json());

  // 12. List FCM tokens
  res = await fetch(`${base}/api/admin/fcm-tokens`, { headers: auth });
  log('GET /api/admin/fcm-tokens', await res.json());
})(); 