#!/bin/bash

# Tor Setup Script for WKApp Server
# This script sets up Tor hidden service for the Flask API

set -e

echo "🧅 Setting up Tor hidden service for WKApp Server..."
echo "=================================================="

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   echo "❌ This script should not be run as root. Please run as a regular user."
   echo "   The script will use sudo when needed."
   exit 1
fi

# Install Tor if not already installed
echo "📦 Installing Tor..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS - use Homebrew
    if ! command -v brew &> /dev/null; then
        echo "❌ Homebrew not found. Please install Homebrew first:"
        echo "   /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
        exit 1
    fi
    
    if ! brew list tor &> /dev/null; then
        echo "🍺 Installing Tor via Homebrew..."
        brew install tor
    else
        echo "✅ Tor is already installed via Homebrew"
    fi
    
    # macOS paths - check for both Intel and Apple Silicon Homebrew locations
    if [ -d "/opt/homebrew/etc/tor" ]; then
        # Apple Silicon Mac
        TOR_CONFIG_DIR="/opt/homebrew/etc/tor"
        TOR_DATA_DIR="/opt/homebrew/var/lib/tor"
        TOR_LOG_DIR="/opt/homebrew/var/log/tor"
    elif [ -d "/usr/local/etc/tor" ]; then
        # Intel Mac
        TOR_CONFIG_DIR="/usr/local/etc/tor"
        TOR_DATA_DIR="/usr/local/var/lib/tor"
        TOR_LOG_DIR="/usr/local/var/log/tor"
    else
        echo "❌ Could not find Tor configuration directory. Is Tor installed via Homebrew?"
        exit 1
    fi
    
    TOR_CONFIG_FILE="$TOR_CONFIG_DIR/torrc"
    TOR_SERVICE_DIR="$TOR_DATA_DIR/wkapp"
    TOR_USER=$(whoami)
    
elif command -v apt &> /dev/null; then
    # Debian/Ubuntu
    sudo apt update
    sudo apt install -y tor
    TOR_DATA_DIR="/var/lib/tor"
    TOR_CONFIG_FILE="/etc/tor/torrc"
    TOR_LOG_DIR="/var/log/tor"
    TOR_SERVICE_DIR="$TOR_DATA_DIR/wkapp"
    TOR_USER="debian-tor"
    
elif command -v yum &> /dev/null; then
    # RHEL/CentOS/Fedora
    sudo yum install -y tor
    TOR_DATA_DIR="/var/lib/tor"
    TOR_CONFIG_FILE="/etc/tor/torrc"
    TOR_LOG_DIR="/var/log/tor"
    TOR_SERVICE_DIR="$TOR_DATA_DIR/wkapp"
    TOR_USER="tor"
    
elif command -v dnf &> /dev/null; then
    # Fedora (newer)
    sudo dnf install -y tor
    TOR_DATA_DIR="/var/lib/tor"
    TOR_CONFIG_FILE="/etc/tor/torrc"
    TOR_LOG_DIR="/var/log/tor"
    TOR_SERVICE_DIR="$TOR_DATA_DIR/wkapp"
    TOR_USER="tor"
    
elif command -v pacman &> /dev/null; then
    # Arch Linux
    sudo pacman -S --noconfirm tor
    TOR_DATA_DIR="/var/lib/tor"
    TOR_CONFIG_FILE="/etc/tor/torrc"
    TOR_LOG_DIR="/var/log/tor"
    TOR_SERVICE_DIR="$TOR_DATA_DIR/wkapp"
    TOR_USER="tor"
    
else
    echo "❌ Unsupported operating system. Please install Tor manually."
    exit 1
fi

# Create Tor configuration directory for WKApp
echo "⚙️  Configuring Tor hidden service..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS - create directories without sudo
    mkdir -p "$TOR_SERVICE_DIR"
    mkdir -p "$TOR_LOG_DIR"
    mkdir -p "$(dirname "$TOR_CONFIG_FILE")"
    
    # Set correct permissions for hidden service directory
    chmod 700 "$TOR_SERVICE_DIR"
    echo "✅ Set permissions on hidden service directory"
else
    # Linux - use sudo
    sudo mkdir -p "$TOR_SERVICE_DIR"
    sudo mkdir -p "$TOR_LOG_DIR"
    sudo chown "$TOR_USER:$TOR_USER" "$TOR_SERVICE_DIR" "$TOR_LOG_DIR" 2>/dev/null || true
    sudo chmod 700 "$TOR_SERVICE_DIR"
fi

# Backup original torrc if it exists
if [ -f "$TOR_CONFIG_FILE" ]; then
    if [[ "$OSTYPE" == "darwin"* ]]; then
        cp "$TOR_CONFIG_FILE" "$TOR_CONFIG_FILE.backup.$(date +%Y%m%d_%H%M%S)"
    else
        sudo cp "$TOR_CONFIG_FILE" "$TOR_CONFIG_FILE.backup.$(date +%Y%m%d_%H%M%S)"
    fi
fi

# Create Tor configuration
echo "📝 Creating Tor configuration..."
TOR_CONFIG_CONTENT="# WKApp Server Tor Configuration

# Basic Tor configuration
SocksPort 9050
ControlPort 9051
DataDirectory $TOR_DATA_DIR

# Hidden service for WKApp API
HiddenServiceDir $TOR_SERVICE_DIR/
HiddenServicePort 6969 127.0.0.1:6969

# Enable control port authentication (optional, for monitoring)
HashedControlPassword 16:872860B76453A77D60CA2BB8C1A7042072093276A3D701AD684053EC4C

# Log level (change to notice for less verbose logs)
Log info file $TOR_LOG_DIR/tor.log

# Security settings
ExitPolicy reject *:*"

if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "$TOR_CONFIG_CONTENT" > "$TOR_CONFIG_FILE"
else
    echo "$TOR_CONFIG_CONTENT" | sudo tee "$TOR_CONFIG_FILE" > /dev/null
fi

# Enable and start Tor service
echo "🚀 Starting Tor service..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS - use brew services
    if brew services list | grep -q "tor.*started"; then
        echo "🔄 Restarting Tor service..."
        brew services restart tor
    else
        echo "▶️  Starting Tor service..."
        brew services start tor
    fi
    
    # Give it more time on macOS
    echo "⏳ Waiting for Tor to generate hidden service address..."
    sleep 15
    
    # Check if hidden service was created
    if [ -f "$TOR_SERVICE_DIR/hostname" ]; then
        echo "✅ Tor hidden service created successfully!"
        echo ""
        echo "🧅 Your Tor hidden service address:"
        echo "   $(cat "$TOR_SERVICE_DIR/hostname")"
        echo ""
        echo "📋 Save this address - clients will use:"
        echo "   http://$(cat "$TOR_SERVICE_DIR/hostname"):6969"
        echo ""
    else
        echo "❌ Failed to create hidden service. Checking Tor logs..."
        echo "📄 Tor log location: $TOR_LOG_DIR/tor.log"
        if [ -f "$TOR_LOG_DIR/tor.log" ]; then
            tail -20 "$TOR_LOG_DIR/tor.log"
        fi
        echo ""
        echo "🔍 Try checking Tor service status:"
        echo "   brew services list | grep tor"
        echo "   brew services restart tor"
        exit 1
    fi
else
    # Linux - use systemctl
    sudo systemctl enable tor
    sudo systemctl restart tor
    
    echo "⏳ Waiting for Tor to generate hidden service address..."
    sleep 10
    
    # Check if hidden service was created
    if [ -f "$TOR_SERVICE_DIR/hostname" ]; then
        echo "✅ Tor hidden service created successfully!"
        echo ""
        echo "🧅 Your Tor hidden service address:"
        echo "   $(sudo cat "$TOR_SERVICE_DIR/hostname")"
        echo ""
        echo "📋 Save this address - clients will use:"
        echo "   http://$(sudo cat "$TOR_SERVICE_DIR/hostname"):6969"
        echo ""
    else
        echo "❌ Failed to create hidden service. Checking Tor logs..."
        sudo journalctl -u tor -n 20 --no-pager
        exit 1
    fi
fi

# Create a script to easily get the Tor address
cat << EOF > get_tor_address.sh
#!/bin/bash
if [ -f "$TOR_SERVICE_DIR/hostname" ]; then
    if [[ "\$OSTYPE" == "darwin"* ]]; then
        echo "🧅 Tor Address: http://\$(cat "$TOR_SERVICE_DIR/hostname"):6969"
    else
        echo "🧅 Tor Address: http://\$(sudo cat "$TOR_SERVICE_DIR/hostname"):6969"
    fi
else
    echo "❌ Tor hidden service not found. Run setup_tor.sh first."
fi
EOF
chmod +x get_tor_address.sh

# Create service status checker
cat << EOF > check_tor_status.sh
#!/bin/bash
echo "🔍 Tor Service Status:"
if [[ "\$OSTYPE" == "darwin"* ]]; then
    brew services list | grep tor
    echo ""
    echo "🧅 Hidden Service Address:"
    if [ -f "$TOR_SERVICE_DIR/hostname" ]; then
        echo "   http://\$(cat "$TOR_SERVICE_DIR/hostname"):6969"
    else
        echo "   ❌ Not generated yet"
    fi
    echo ""
    echo "📊 Recent Tor Logs:"
    if [ -f "$TOR_LOG_DIR/tor.log" ]; then
        tail -5 "$TOR_LOG_DIR/tor.log"
    else
        echo "   No log file found at $TOR_LOG_DIR/tor.log"
    fi
else
    sudo systemctl status tor --no-pager -l
    echo ""
    echo "🧅 Hidden Service Address:"
    if [ -f "$TOR_SERVICE_DIR/hostname" ]; then
        echo "   http://\$(sudo cat "$TOR_SERVICE_DIR/hostname"):6969"
    else
        echo "   ❌ Not generated yet"
    fi
    echo ""
    echo "📊 Recent Tor Logs:"
    sudo journalctl -u tor -n 5 --no-pager
fi
EOF
chmod +x check_tor_status.sh

echo "📁 Created helper scripts:"
echo "   ./get_tor_address.sh     - Get the Tor address"
echo "   ./check_tor_status.sh    - Check Tor service status"
echo ""
echo "🎉 Tor setup complete!"
echo ""
echo "💡 Next steps:"
echo "   1. Start your Flask server: ./run_server"
echo "   2. The server will display both local and Tor addresses"
echo "   3. Share the Tor address with Whonix clients"
echo ""
echo "🔧 Troubleshooting:"
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "   - Check Tor status: brew services list | grep tor"
    echo "   - View Tor logs: tail -f $TOR_LOG_DIR/tor.log"
    echo "   - Restart Tor: brew services restart tor"
    echo "   - Stop Tor: brew services stop tor"
else
    echo "   - Check Tor status: sudo systemctl status tor"
    echo "   - View Tor logs: sudo journalctl -u tor -f"
    echo "   - Restart Tor: sudo systemctl restart tor"
fi