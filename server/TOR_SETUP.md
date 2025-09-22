# 🧅 Tor Setup for WKApp Server

This guide explains how to set up Tor hidden service for the WKApp server to allow Whonix clients to connect securely.

## 🚀 Quick Setup

1. **Run the Tor setup script:**
   ```bash
   ./setup_tor.sh
   ```

2. **Start the server:**
   ```bash
   ./run_server
   ```

3. **Copy the Tor address shown and share it with Whonix clients.**

## 📋 Manual Setup (if needed)

If the automatic setup doesn't work, follow these manual steps:

### 1. Install Tor
```bash
# Ubuntu/Debian
sudo apt update && sudo apt install tor

# RHEL/CentOS/Fedora
sudo dnf install tor

# Arch Linux
sudo pacman -S tor
```

### 2. Configure Tor
Edit `/etc/tor/torrc`:
```bash
sudo nano /etc/tor/torrc
```

Add these lines:
```
# WKApp Hidden Service
HiddenServiceDir /var/lib/tor/wkapp/
HiddenServicePort 6969 127.0.0.1:6969

# Security settings
ExitPolicy reject *:*
```

### 3. Start Tor Service
```bash
sudo systemctl enable tor
sudo systemctl start tor
```

### 4. Get Hidden Service Address
```bash
sudo cat /var/lib/tor/wkapp/hostname
```

## 🔧 Helper Scripts

After running `setup_tor.sh`, you'll have these helper scripts:

- `./get_tor_address.sh` - Display the Tor hidden service address
- `./check_tor_status.sh` - Check Tor service status and logs

## 🌐 Client Configuration (Whonix)

In your Whonix workstation, use the Tor address to connect:

```javascript
// Replace in your client script
const SERVER_URL = 'http://your-onion-address.onion:6969';
```

## 🛠️ Troubleshooting

### Check Tor Status
```bash
sudo systemctl status tor
```

### View Tor Logs
```bash
sudo journalctl -u tor -f
```

### Restart Tor
```bash
sudo systemctl restart tor
```

### Hidden Service Not Generated
If the hostname file doesn't exist:
1. Check Tor logs for errors
2. Ensure proper permissions on `/var/lib/tor/wkapp/`
3. Restart Tor service

### Connection Issues from Whonix
1. Verify the onion address is correct
2. Ensure WKApp server is running
3. Check Whonix firewall settings
4. Test with: `curl http://your-onion-address.onion:6969/api/health`

## 🔒 Security Notes

- The hidden service only exposes port 6969 (WKApp API)
- No exit relay functionality (ExitPolicy reject *:*)
- Traffic is automatically encrypted through Tor
- The onion address changes if you delete `/var/lib/tor/wkapp/`

## 📊 Monitoring

Monitor Tor activity:
```bash
# Real-time logs
sudo journalctl -u tor -f

# Check if hidden service is working
curl http://$(sudo cat /var/lib/tor/wkapp/hostname):6969/api/health
```