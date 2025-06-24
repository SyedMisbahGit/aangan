export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ error: 'No token provided' });
  }
  // Log the token (replace with DB save if needed)
  console.log('Received FCM token:', token);
  return res.status(200).json({ success: true });
}
