# WKApp Order Processing System

Complete end-to-end order processing system with PGP decryption, OCR extraction, AI parsing, and team notifications.

## 🏗️ Architecture Overview

**Infrastructure:**
- **Mac Mini:** Server hosting Flask API + SQLite + web dashboard + Session.js client
- **Client Machines:** Go desktop apps (Qubes OS compatible)
- **External APIs:** Gemini 1.5 Flash (primary) + 454 fallback models + Session messenger

**Data Flow:**
```
Clipboard Monitor → PGP Detection → OCR Screenshot → Send to Flask API
       ↓
Receive Data → Decrypt PGP → Extract OCR → Send to Gemini → Parse Response → Store SQLite → Generate CSV → WebSocket Update → Respond to Client
       ↓
Live Action Log + Order Table Display + Daily Summary (Session.js)
```

## 🚀 Quick Start

### Server (Mac Mini)
```bash
cd server
./start.sh
```

### Client (Any Machine)
```bash
cd client  
./start.sh
```

## 📁 Project Structure

```
wkapp/
├── server/              # Mac Mini server components
│   ├── app.py          # Flask API with PGP, OCR, Gemini integration
│   ├── index.html      # Real-time web dashboard
│   ├── session/        # Session.js bot for team notifications
│   │   ├── index.ts    # Bun-based notification bot
│   │   └── package.json
│   ├── requirements.txt # Python dependencies
│   ├── config.py       # Configuration settings
│   └── start.sh        # Server setup script
├── client/             # Desktop client applications
│   ├── main.go         # Go clipboard monitor + screenshot
│   ├── go.mod          # Go dependencies
│   └── start.sh        # Client setup script
└── README.md           # This file
```

## 🖥️ Server Setup (Mac Mini)

The server setup script handles everything automatically:

**What it installs:**
- Python 3.11+ with virtual environment
- Flask + dependencies (CORS, SocketIO, etc.)
- Tesseract OCR engine
- GnuPG for PGP operations
- Bun runtime for Session.js
- SQLite database initialization
- Launchd service for auto-start

**Manual configuration needed:**
1. Edit `server/.env` with your API keys:
   ```env
   NANO_GPT_API_KEY=your_api_key_here
   TEAM_CHAT_ID=your_session_chat_id_here
   ```

2. Import PGP keys:
   ```bash
   gpg --import your_private_key.asc
   ```

3. Access dashboard at: `http://localhost:5000`

## 💻 Client Setup (Cross-Platform)

The client setup script supports:
- **Linux:** Ubuntu, Fedora, Arch, openSUSE (via native package managers)
- **macOS:** via Homebrew  
- **Qubes OS:** Special security-focused setup

**What it installs:**
- Go 1.21+ runtime
- Development dependencies (X11, build tools)
- Compiled client binary
- Configuration files

**Qubes OS specific:**
- Creates dedicated AppVM recommendations
- Security policy templates  
- Firewall configuration guidance

## 🔧 Configuration

### Server Configuration (`server/config.py`)
- **Return Addresses:** 3 warehouse configurations
- **Service Specs:** Carrier/service mappings (USPS, FedEx, UPS)
- **CSV Headers:** 25 fields for label provider compatibility
- **Fallback Models:** 454 AI model fallback chain
- **Security Settings:** TEE mode, sensitive data logging controls

### Client Configuration (`client/config.env`)
- **Server URL:** Target Flask API endpoint
- **Polling Interval:** Clipboard check frequency (500ms default)
- **Screenshot Settings:** Quality, format, compression
- **Network Settings:** Timeouts, retry logic

## 🔄 Workflow

1. **Worker copies PGP message to clipboard**
2. **Client detects PGP format and takes screenshot**
3. **Data sent to Flask API for processing:**
   - PGP decryption using local keyring
   - Address parsing via Gemini API
   - Screenshot OCR extraction for order details
   - Duplicate detection and merging
   - SQLite storage with confidence scores
4. **Real-time dashboard updates via WebSocket**
5. **CSV export for label provider**
6. **Daily team summary via Session.js**

## 🎯 Features

### Core Processing
- ✅ **PGP Decryption** - Local GPG keyring integration
- ✅ **OCR Screenshot** - Tesseract text extraction  
- ✅ **AI Parsing** - Gemini 1.5 Flash + 454 fallback models
- ✅ **Duplicate Detection** - Address-based deduplication
- ✅ **Data Merging** - Enhanced order information combining

### Real-time Monitoring  
- ✅ **WebSocket Updates** - Live action log and order tracking
- ✅ **Processing Steps** - Visual pipeline status indicators
- ✅ **Error Handling** - Comprehensive failure notifications
- ✅ **Model Switching** - Dynamic AI model selection

### Export & Integration
- ✅ **CSV Export** - Label provider compatible format (25 fields)
- ✅ **Session.js Bot** - Team chat notifications and summaries
- ✅ **Historical Tracking** - 30-day duplicate detection window
- ✅ **Confidence Scoring** - Data quality indicators

### Security & Privacy
- ✅ **Local Network Only** - No external auth required
- ✅ **PGP Security** - Messages encrypted end-to-end
- ✅ **Sensitive Data Protection** - No customer data in dashboard logs
- ✅ **TEE Support** - Trusted execution environment option

## 🛠️ Development

### Adding Fallback Models
Edit `server/config.py` and add to `FALLBACK_MODELS` list:
```python
FALLBACK_MODELS = [
    "gemini-1.5-flash",
    "your-new-model-name",
    # ... 453 more models
]
```

### Custom CSV Format
Modify `CSV_HEADERS` in `server/config.py` to match your label provider requirements.

### Session.js Configuration  
1. Set up Session messenger account
2. Create group chat and get chat ID
3. Update `TEAM_CHAT_ID` in environment variables
4. Test with: `cd server/session && bun run test`

## 🔍 Troubleshooting

### Server Issues
- **PGP Decryption Fails:** Check `gpg --list-keys` for imported private keys
- **Tesseract OCR Errors:** Ensure `tesseract --version` works
- **Gemini API Failures:** Verify API key and model availability
- **Database Issues:** Delete `server/data/orders.db` to reset

### Client Issues  
- **Go Build Fails:** Ensure development tools installed (`build-essential`, Xcode tools)
- **Screenshot Errors:** Check X11 access permissions on Linux
- **Network Connection:** Verify server URL in `client/config.env`
- **Clipboard Access:** May need accessibility permissions on macOS

### Qubes OS Specific
- **Network Policy:** Ensure AppVM can reach server IP:5000
- **Display Access:** Screenshot needs X11 forwarding
- **Firewall Rules:** Use provided templates in `client/README-Qubes.md`

## 📊 Monitoring

### Dashboard Metrics
- Total orders processed
- Today's order count  
- Current AI model in use
- Real-time processing pipeline status

### Log Files
- `server/logs/server.log` - Application logs
- `server/logs/server_error.log` - Error logs  
- Database: `server/data/orders.db` - All order data

### Daily Summaries
Automated via Session.js:
- Order statistics (successful/failed)
- System activity summary
- Failed order details
- Performance metrics

## 🤝 Support

For issues and feedback:
- Check logs in `server/logs/`
- Verify configuration in `.env` files
- Test individual components (PGP, OCR, API access)
- Review network connectivity and firewall rules

---

**🚨 Security Notice:** This system processes sensitive customer data. Ensure proper network isolation, access controls, and data retention policies are in place per your organization's requirements.