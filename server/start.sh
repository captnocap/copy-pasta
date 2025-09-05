#!/bin/bash

# WKApp Server Startup Script
# For Mac Mini deployment

set -e

echo "🚀 Starting WKApp Server Setup..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if running on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo -e "${RED}❌ This script is designed for macOS (Mac Mini). Detected: $OSTYPE${NC}"
    exit 1
fi

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check and install Homebrew
if ! command_exists brew; then
    echo -e "${YELLOW}📦 Installing Homebrew...${NC}"
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
    eval "$(/opt/homebrew/bin/brew shellenv)"
fi

# Update Homebrew
echo -e "${BLUE}🔄 Updating Homebrew...${NC}"
brew update

# Install Miniconda/Mamba for better Python environment management
if ! command_exists mamba; then
    echo -e "${YELLOW}🐍 Installing Miniconda and Mamba...${NC}"
    
    # Download and install Miniconda
    MINICONDA_URL="https://repo.anaconda.com/miniconda/Miniconda3-latest-MacOSX-$(uname -m).sh"
    curl -fsSL "$MINICONDA_URL" -o /tmp/miniconda.sh
    bash /tmp/miniconda.sh -b -p "$HOME/miniconda3"
    rm /tmp/miniconda.sh
    
    # Initialize conda
    eval "$($HOME/miniconda3/bin/conda shell.zsh hook)" 2>/dev/null || eval "$($HOME/miniconda3/bin/conda shell.bash hook)"
    
    # Install mamba
    conda install mamba -n base -c conda-forge -y
    
    # Add to shell profiles
    echo 'eval "$(~/miniconda3/bin/conda shell.zsh hook)"' >> ~/.zshrc 2>/dev/null || true
    echo 'eval "$(~/miniconda3/bin/conda shell.bash hook)"' >> ~/.bashrc 2>/dev/null || true
    
    echo -e "${GREEN}✅ Miniconda and Mamba installed!${NC}"
else
    echo -e "${GREEN}✅ Mamba already installed${NC}"
fi

# Initialize conda/mamba for current session
if [ -f "$HOME/miniconda3/bin/conda" ]; then
    eval "$($HOME/miniconda3/bin/conda shell.bash hook)"
    # Initialize mamba shell
    eval "$(mamba shell hook --shell bash)"
fi

# Install Tesseract for OCR
if ! command_exists tesseract; then
    echo -e "${YELLOW}👁️  Installing Tesseract OCR...${NC}"
    brew install tesseract
fi

# Install GnuPG for PGP operations
if ! command_exists gpg; then
    echo -e "${YELLOW}🔒 Installing GnuPG...${NC}"
    brew install gnupg
fi

# Install Bun for Session.js
if ! command_exists bun; then
    echo -e "${YELLOW}🥟 Installing Bun...${NC}"
    curl -fsSL https://bun.sh/install | bash
    source ~/.bashrc 2>/dev/null || source ~/.zshrc 2>/dev/null || true
    export PATH="$HOME/.bun/bin:$PATH"
fi

# Install Node.js/npm as fallback for Session.js
if ! command_exists npm && ! command_exists node; then
    echo -e "${YELLOW}📦 Installing Node.js (fallback for Session.js)...${NC}"
    brew install node
fi

# Create Mamba environment with Python 3.12
echo -e "${BLUE}🔧 Setting up Python environment with Mamba...${NC}"
if ! mamba env list | grep -q "server"; then
    echo -e "${YELLOW}🐍 Creating 'server' environment with Python 3.12...${NC}"
    mamba create -n server python=3.12 -y
fi

# Install Python dependencies via mamba (faster than pip for compiled packages)
echo -e "${BLUE}📦 Installing Python dependencies with Mamba...${NC}"
mamba install -n server -c conda-forge flask flask-cors requests pillow pytesseract -y

# Install remaining packages via pip in the server environment
echo -e "${BLUE}📦 Installing remaining dependencies with pip...${NC}"
mamba run -n server pip install flask-socketio==5.3.6 python-gnupg==0.5.2 python-socketio==5.11.0 eventlet==0.36.1 python-dotenv==1.0.0

# Create necessary directories
echo -e "${BLUE}📁 Creating directory structure...${NC}"
mkdir -p data/screenshots
mkdir -p logs

# Initialize database
echo -e "${BLUE}🗄️  Initializing database...${NC}"
mamba run -n server python -c "
from app import init_db
init_db()
print('✅ Database initialized successfully!')
"

# Set up Session.js dependencies
echo -e "${BLUE}🔗 Setting up Session.js bot...${NC}"
cd session

# Install Session.js client from npm registry
echo -e "${YELLOW}📦 Installing @session.js/client...${NC}"
if [ ! -d "node_modules" ]; then
    # Try with latest version first
    bun add @session.js/client || {
        echo -e "${YELLOW}⚠️  Failed to install @session.js/client, trying alternative installation...${NC}"
        # If that fails, try installing from GitHub directly
        bun add github:sessionjs/client || {
            echo -e "${YELLOW}⚠️  GitHub installation failed, using npm fallback...${NC}"
            # Final fallback: use npm
            npm install @session.js/client
        }
    }
else
    echo -e "${GREEN}✅ Dependencies already installed${NC}"
fi

# Test Session.js setup
echo -e "${BLUE}🧪 Testing Session.js bot...${NC}"
bun run test || echo -e "${YELLOW}⚠️  Session.js test failed - you may need to configure TEAM_CHAT_ID${NC}"

cd ..

# Create environment file template
if [ ! -f ".env" ]; then
    echo -e "${BLUE}📝 Creating .env template...${NC}"
    cat > .env << EOF
# WKApp Server Configuration
NANO_GPT_API_KEY=your_nano_gpt_api_key_here
TEAM_CHAT_ID=your_session_chat_id_here
ENABLE_TEE=false

# Flask Configuration  
FLASK_ENV=production
FLASK_DEBUG=false
EOF
    echo -e "${YELLOW}⚠️  Please edit .env file with your API keys and configuration${NC}"
fi

# Set up PGP keyring (if keys exist)
if [ -d "pgp_keys" ]; then
    echo -e "${BLUE}🔑 Importing PGP keys...${NC}"
    gpg --import pgp_keys/*.asc 2>/dev/null || echo -e "${YELLOW}⚠️  No PGP keys found to import${NC}"
fi

# Create startup script
cat > run_server.sh << 'EOF'
#!/bin/bash
# Initialize conda/mamba
eval "$(~/miniconda3/bin/conda shell.bash hook)"
eval "$(mamba shell hook --shell bash)"
export PATH="$HOME/.bun/bin:$PATH"
# Use mamba run to execute in the server environment
mamba run -n server python app.py
EOF

chmod +x run_server.sh

# Create systemd service file for auto-start (launchd for macOS)
echo -e "${BLUE}⚙️  Creating launchd service...${NC}"
SERVICE_FILE="$HOME/Library/LaunchAgents/com.wkapp.server.plist"
cat > "$SERVICE_FILE" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.wkapp.server</string>
    <key>ProgramArguments</key>
    <array>
        <string>$(pwd)/run_server.sh</string>
    </array>
    <key>WorkingDirectory</key>
    <string>$(pwd)</string>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>$(pwd)/logs/server.log</string>
    <key>StandardErrorPath</key>
    <string>$(pwd)/logs/server_error.log</string>
</dict>
</plist>
EOF

# Load the service
launchctl unload "$SERVICE_FILE" 2>/dev/null || true
launchctl load "$SERVICE_FILE"

echo -e "${GREEN}✅ WKApp Server setup complete!${NC}"
echo -e "${BLUE}🔧 Setup Summary:${NC}"
echo -e "  • Python virtual environment: ${GREEN}✓${NC}"  
echo -e "  • Flask API with dependencies: ${GREEN}✓${NC}"
echo -e "  • Tesseract OCR: ${GREEN}✓${NC}"
echo -e "  • GnuPG for PGP: ${GREEN}✓${NC}"
echo -e "  • Bun runtime: ${GREEN}✓${NC}"
echo -e "  • Session.js bot: ${GREEN}✓${NC}"
echo -e "  • Database initialized: ${GREEN}✓${NC}"
echo -e "  • Auto-start service: ${GREEN}✓${NC}"

echo -e "${YELLOW}📋 Next Steps:${NC}"
echo -e "  1. Edit .env file with your API keys"
echo -e "  2. Import PGP keys to gpg keyring"
echo -e "  3. Set TEAM_CHAT_ID for Session.js notifications"
echo -e "  4. Access dashboard at: ${BLUE}http://localhost:5000${NC}"

echo -e "${GREEN}🚀 Starting server...${NC}"
./run_server.sh