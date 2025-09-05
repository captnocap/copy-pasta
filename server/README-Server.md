# WKApp Server Setup Guide

## Mac Mini Production Deployment

### Prerequisites
- macOS 12.0+ (Monterey or newer)
- Admin access to install dependencies
- Network access for downloading packages
- At least 4GB free disk space

### Automated Setup
```bash
cd server
./start.sh
```

The setup script will automatically:
1. ✅ Install Homebrew (if missing)
2. ✅ Install Python 3.11+
3. ✅ Install Tesseract OCR
4. ✅ Install GnuPG
5. ✅ Install Bun runtime
6. ✅ Create Python virtual environment
7. ✅ Install all Python dependencies
8. ✅ Initialize SQLite database
9. ✅ Set up Session.js bot dependencies
10. ✅ Create launchd service for auto-start
11. ✅ Generate configuration templates

### Manual Configuration

#### 1. Environment Variables
Edit `server/.env`:
```env
# Required: Get API key from nano-gpt.com
NANO_GPT_API_KEY=your_nano_gpt_api_key_here

# Required: Session.js chat ID for team notifications  
TEAM_CHAT_ID=your_session_chat_id_here

# Optional: Enable Trusted Execution Environment
ENABLE_TEE=false

# Flask settings
FLASK_ENV=production
FLASK_DEBUG=false
```

#### 2. PGP Key Setup
Import your private PGP keys:
```bash
# Import private key
gpg --import /path/to/your/private_key.asc

# Import public keys (if needed)
gpg --import /path/to/public_keys.asc

# Verify keys are loaded
gpg --list-secret-keys
```

#### 3. Session.js Bot Configuration
```bash
cd server/session

# Test bot initialization
bun run test

# If successful, you'll see:
# ✅ Session.js ready!  
# 🆔 Session ID: 05xxxxx...

# Copy the Session ID and create a group chat
# Add the bot to your team group chat
# Get the group chat ID and update TEAM_CHAT_ID in .env
```

#### 4. Firewall Configuration  
Allow incoming connections on port 5000:
```bash
# Add firewall rule for local network access
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add /usr/local/bin/python3
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --unblockapp /usr/local/bin/python3
```

### Service Management

#### Auto-start Configuration
The setup script creates a launchd service that automatically starts the server on boot.

**Service file location:** `~/Library/LaunchAgents/com.wkapp.server.plist`

**Manual service control:**
```bash
# Stop server
launchctl unload ~/Library/LaunchAgents/com.wkapp.server.plist

# Start server  
launchctl load ~/Library/LaunchAgents/com.wkapp.server.plist

# View service status
launchctl list | grep com.wkapp.server
```

#### Manual Server Start
```bash
cd server
source venv/bin/activate
export PATH="$HOME/.bun/bin:$PATH"  
python3 app.py
```

### Accessing the Dashboard

**Web Interface:** http://localhost:5000

**API Endpoints:**
- `GET /api/health` - Server health check
- `POST /api/order` - Process new order (used by clients)  
- `GET /api/orders` - List recent orders
- `GET /api/logs` - Action log entries
- `GET/POST /api/model` - Current AI model management
- `GET /api/export-csv` - Export orders to CSV
- `POST /api/send-summary` - Trigger daily summary

### Directory Structure
```
server/
├── app.py              # Main Flask application
├── index.html          # Web dashboard  
├── requirements.txt    # Python dependencies
├── config.py          # Configuration settings
├── start.sh           # Setup script
├── run_server.sh      # Server startup script (auto-generated)
├── .env               # Environment variables (create manually)
├── venv/              # Python virtual environment (auto-generated)
├── data/              # Data storage (auto-generated)
│   ├── orders.db      # SQLite database
│   └── screenshots/   # Stored screenshots
├── logs/              # Log files (auto-generated) 
│   ├── server.log     # Application logs
│   └── server_error.log # Error logs
└── session/           # Session.js bot
    ├── index.ts       # Bot implementation
    ├── package.json   # Bun dependencies
    └── node_modules/  # Dependencies (auto-generated)
```

### Configuration Options

#### Return Addresses (`config.py`)
Configure your warehouse locations:
```python
RETURN_ADDRESSES = {
    "warehouse1": {
        "name": "Your Company Name",
        "address1": "123 Your Street", 
        "address2": "Suite 100",
        "city": "Your City",
        "state": "YS", 
        "zip": "12345"
    },
    # Add warehouse2 and warehouse3...
}
```

#### Service Specifications
Configure shipping carriers and service types:
```python
SERVICE_SPECS = {
    "usps_priority": {
        "carrier": "USPS",
        "service": "Priority Mail", 
        "max_dimensions": "12x12x5",
        "max_weight": "70lbs",
        "package_type": "Box"
    },
    # Add more services...
}
```

#### Model Fallbacks
Configure your 454 fallback AI models:
```python
FALLBACK_MODELS = [
    "gemini-1.5-flash",      # Primary
    "gpt-4o-mini",           # Secondary
    "claude-3-haiku-20240307", # Tertiary
    # ... add your remaining 451 models
]
```

### Monitoring & Maintenance

#### Log Monitoring
```bash
# Real-time server logs
tail -f server/logs/server.log

# Error logs
tail -f server/logs/server_error.log

# System service logs (if running via launchd)
log show --predicate 'subsystem == "com.wkapp.server"' --last 1h
```

#### Database Management
```bash
# View database contents
cd server
source venv/bin/activate
python3 -c "
import sqlite3
conn = sqlite3.connect('data/orders.db')
cursor = conn.cursor()
cursor.execute('SELECT COUNT(*) FROM orders')
print(f'Total orders: {cursor.fetchone()[0]}')
cursor.execute('SELECT COUNT(*) FROM action_log')  
print(f'Total log entries: {cursor.fetchone()[0]}')
conn.close()
"

# Backup database
cp data/orders.db "data/orders_backup_$(date +%Y%m%d_%H%M%S).db"
```

#### Performance Monitoring
- **CPU Usage:** Activity Monitor → Python processes
- **Memory:** Flask app typically uses 100-200MB RAM
- **Disk Space:** Screenshots and logs can grow over time
- **Network:** Monitor port 5000 connections

### Security Considerations

#### Network Security
- Server binds to `0.0.0.0:5000` for local network access
- No external authentication - relies on network isolation
- Consider VPN access for remote monitoring

#### Data Security  
- PGP keys stored in macOS keychain via GPG
- Customer addresses encrypted in database
- Screenshots contain sensitive data - secure storage location
- Dashboard excludes sensitive details (addresses, weights)

#### Access Controls
- File permissions set during installation
- Database files readable only by server user
- Log rotation to prevent disk filling

### Troubleshooting

#### Common Issues

**"Port 5000 already in use"**
```bash
# Find process using port 5000
sudo lsof -i :5000

# Kill if necessary
sudo kill -9 <PID>
```

**"GPG decryption failed"**  
```bash
# Check loaded keys
gpg --list-secret-keys

# Test decryption manually
echo "YOUR_PGP_MESSAGE" | gpg --decrypt
```

**"Tesseract not found"**
```bash
# Verify installation
tesseract --version

# Reinstall if needed
brew reinstall tesseract
```

**"Bun command not found"**
```bash
# Check PATH
echo $PATH | grep -o bun

# Reinstall Bun
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc
```

**"Database locked"**
```bash
# Stop all server processes
pkill -f "python3 app.py"

# Remove lock file
rm -f data/orders.db-wal data/orders.db-shm
```

#### Performance Issues

**High CPU usage:**
- Check for infinite loops in log processing
- Monitor AI API response times
- Consider model switching if Gemini is slow

**High memory usage:**
- Large screenshots consume memory
- Database query optimization needed
- Restart service periodically if needed

**Slow responses:**
- Check AI API latency
- Database query performance
- Network connectivity to external APIs

### Backup & Recovery

#### Automated Backups
Add to crontab for daily backups:
```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /path/to/server/backup_script.sh
```

**backup_script.sh:**
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
cp /path/to/server/data/orders.db "/path/to/backups/orders_$DATE.db"
tar -czf "/path/to/backups/screenshots_$DATE.tar.gz" /path/to/server/data/screenshots/
# Keep only last 30 days
find /path/to/backups -name "*.db" -mtime +30 -delete
find /path/to/backups -name "*.tar.gz" -mtime +30 -delete
```

#### Recovery Process
1. Stop the server service
2. Restore database: `cp backup.db data/orders.db`
3. Restore screenshots: `tar -xzf screenshots_backup.tar.gz`
4. Restart service
5. Verify functionality via dashboard

---

**🔧 Need Help?** Check logs, verify configuration, and ensure all dependencies are properly installed. The setup script handles most common issues automatically.