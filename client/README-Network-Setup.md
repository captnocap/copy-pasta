# WKApp Client Network Configuration

## Production Deployment Configuration

When deploying clients to connect to your Mac Mini server in the office, you'll need to configure the correct server address.

## Finding Your Mac Mini's IP Address

### On the Mac Mini (Server):
```bash
# Option 1: System Preferences method
# System Preferences → Network → Select active connection → Details

# Option 2: Command line
ifconfig | grep "inet " | grep -v 127.0.0.1

# Option 3: Specific interface
ifconfig en0 | grep "inet " | awk '{print $2}'

# Example output: 192.168.1.100
```

### Network Discovery from Client:
```bash  
# Scan local network for Mac Mini
nmap -sn 192.168.1.0/24 | grep -B 2 "Apple"

# Or use arp to find known devices
arp -a | grep -i apple
```

## Configuration Methods

### Method 1: Interactive Setup (Recommended)
When you run `./start.sh` on a client machine, it will prompt:
```
🌐 Server Configuration
Enter the Mac Mini server IP address (or hostname)
Examples: 192.168.1.100, office-mac-mini.local, localhost
Server IP/hostname: [Enter your Mac Mini's IP here]
```

### Method 2: Manual Configuration
Edit `client/config.env` directly:
```env
# Replace localhost with your Mac Mini's IP
SERVER_URL=http://192.168.1.100:5000
```

### Method 3: Environment Variable
Set the SERVER_URL environment variable:
```bash
# In terminal or shell profile
export SERVER_URL=http://192.168.1.100:5000

# Then run client
./run_client.sh
```

## Common Network Scenarios

### Local Office Network
```env
# Static IP assignment
SERVER_URL=http://192.168.1.100:6969

# DHCP with hostname resolution  
SERVER_URL=http://office-mac-mini.local:6969
```

### VPN Setup
```env
# Mac Mini accessible via VPN
SERVER_URL=http://10.0.0.50:6969

# VPN with custom port forwarding
SERVER_URL=http://vpn-server.company.com:6969
```

### Complex Network with Port Forwarding
```env
# Router forwarding external port to Mac Mini
SERVER_URL=http://office-router.company.com:8080
```

## Network Troubleshooting

### Test Connection
```bash
# Test if server is reachable
curl -I http://192.168.1.100:6969/api/health

# Expected response:
# HTTP/1.1 200 OK
# Content-Type: application/json
```

### Ping Test
```bash
# Basic connectivity
ping 192.168.1.100

# Should show successful ping responses
```

### Port Accessibility  
```bash
# Test if port 6969 is open
nc -zv 192.168.1.100 6969

# Or using telnet
telnet 192.168.1.100 6969
```

### DNS Resolution Test
```bash  
# If using hostname instead of IP
nslookup office-mac-mini.local
dig office-mac-mini.local

# Should resolve to correct IP address
```

## Mac Mini Server Network Setup

### Enable Network Access
On the Mac Mini, ensure the Flask server binds to all interfaces:
```python
# In server/app.py (already configured)
socketio.run(app, host='0.0.0.0', port=5000, debug=True)
```

### Firewall Configuration
```bash
# Allow incoming connections on port 5000
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add /usr/local/bin/python3
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --unblockapp /usr/local/bin/python3

# Or disable firewall for local network (less secure)
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --setglobalstate off
```

### Router Configuration (if needed)
If clients need to connect from outside the local network:
1. **Port Forwarding:** Forward external port → Mac Mini IP:5000
2. **Static IP:** Assign static IP to Mac Mini  
3. **DNS:** Set up local DNS entry for easy hostname access

## Security Considerations

### Network Isolation
- Keep server on isolated VLAN if possible
- Use VPN for remote access
- Monitor network traffic for unusual activity

### Access Control
- No authentication built into WKApp (relies on network security)  
- Consider adding HTTP basic auth if needed
- Log all client connections

### Encryption
- Currently HTTP (not HTTPS) for simplicity
- Consider SSL/TLS for production if transmitting over internet
- PGP messages are already encrypted end-to-end

## Client Deployment Examples

### Qubes OS AppVM
```bash
# In dedicated AppVM
cd /home/user/wkapp-client
echo "SERVER_URL=http://192.168.1.100:5000" > config.env
./run_client.sh
```

### Ubuntu Desktop
```bash
# Corporate laptop  
cd ~/wkapp-client
export SERVER_URL=http://office-mac-mini.local:5000
./run_client.sh
```

### macOS Laptop
```bash
# Remote worker via VPN
cd ~/Desktop/wkapp-client  
export SERVER_URL=http://10.0.0.50:5000
./run_client.sh
```

### Windows (via WSL)
```bash
# In WSL environment
cd /mnt/c/Users/username/wkapp-client
export SERVER_URL=http://192.168.1.100:5000
./run_client.sh
```

## Monitoring Connections

### Server Side (Mac Mini)
```bash
# View active connections
lsof -i :5000

# Monitor server logs
tail -f server/logs/server.log | grep "Client connected"
```

### Client Side
The client will display connection status:
```
🌐 Server: http://192.168.1.100:5000
👀 Monitoring clipboard for PGP messages...

[15:30:45] 🔒 PGP message detected!
[15:30:46] ✅ Screenshot captured! (245 KB)
[15:30:47] ✅ Order sent successfully! ID: ORD-1703862647
```

---

**💡 Pro Tip:** Use hostname resolution (`office-mac-mini.local`) instead of IP addresses when possible, as it's more resilient to DHCP changes and easier to remember.