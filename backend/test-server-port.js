// Test script to check server port binding
import net from 'net';

const PORT = process.env.PORT || 3001;

// Check if port is in use
const server = net.createServer()
  .on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`❌ Port ${PORT} is already in use by another process`);
      console.log('Try running: netstat -ano | findstr :' + PORT);
    } else {
      console.error('❌ Error checking port:', err);
    }
    process.exit(1);
  })
  .on('listening', () => {
    console.log(`✅ Port ${PORT} is available`);
    server.close(() => {
      console.log('Test completed successfully');
      process.exit(0);
    });
  })
  .listen(PORT);
