const net = require('net');

function checkPort(port) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(1000);
    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.on('error', () => {
      resolve(false);
    });
    socket.connect(port, '127.0.0.1');
  });
}

async function testPorts() {
  console.log('Port 5432 open:', await checkPort(5432));
  console.log('Port 5433 open:', await checkPort(5433));
  console.log('Port 3000 open:', await checkPort(3000));
  console.log('Port 3001 open:', await checkPort(3001));
}
testPorts();
