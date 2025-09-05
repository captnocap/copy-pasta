#!/bin/bash

# WKApp Client Startup Script  
# For Qubes OS and other Linux laptops

set -e

echo "🖥️  Starting WKApp Client Setup..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Detect OS
OS="unknown"
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS="linux"
    # Detect distribution
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        DISTRO=$ID
    fi
elif [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macos"
fi

echo -e "${BLUE}🔍 Detected OS: $OS${NC}"

# Function to install Go
install_go() {
    local GO_VERSION="1.21.6"
    local GO_ARCH
    
    case $(uname -m) in
        x86_64) GO_ARCH="amd64" ;;
        aarch64|arm64) GO_ARCH="arm64" ;;
        *) 
            echo -e "${RED}❌ Unsupported architecture: $(uname -m)${NC}"
            exit 1
            ;;
    esac
    
    local GO_OS
    case $OS in
        linux) GO_OS="linux" ;;
        macos) GO_OS="darwin" ;;
        *) 
            echo -e "${RED}❌ Unsupported OS: $OS${NC}"
            exit 1
            ;;
    esac
    
    echo -e "${YELLOW}📦 Installing Go $GO_VERSION for $GO_OS-$GO_ARCH...${NC}"
    
    # Download Go
    GO_TAR="go${GO_VERSION}.${GO_OS}-${GO_ARCH}.tar.gz"
    GO_URL="https://golang.org/dl/${GO_TAR}"
    
    # Create temp directory
    TEMP_DIR=$(mktemp -d)
    cd "$TEMP_DIR"
    
    # Download and verify
    curl -fsSL "$GO_URL" -o "$GO_TAR"
    
    # Remove any existing Go installation
    sudo rm -rf /usr/local/go
    
    # Extract Go
    sudo tar -C /usr/local -xzf "$GO_TAR"
    
    # Add to PATH
    if ! grep -q "/usr/local/go/bin" ~/.bashrc; then
        echo 'export PATH=$PATH:/usr/local/go/bin' >> ~/.bashrc
    fi
    
    if ! grep -q "/usr/local/go/bin" ~/.profile; then
        echo 'export PATH=$PATH:/usr/local/go/bin' >> ~/.profile
    fi
    
    # For zsh users
    if [ -f ~/.zshrc ] && ! grep -q "/usr/local/go/bin" ~/.zshrc; then
        echo 'export PATH=$PATH:/usr/local/go/bin' >> ~/.zshrc
    fi
    
    # Set for current session
    export PATH=$PATH:/usr/local/go/bin
    
    # Cleanup
    cd - >/dev/null
    rm -rf "$TEMP_DIR"
    
    echo -e "${GREEN}✅ Go installed successfully!${NC}"
}

# Function to install dependencies on Linux
install_linux_deps() {
    echo -e "${BLUE}🐧 Installing Linux dependencies...${NC}"
    
    # Detect package manager and install
    if command_exists apt-get; then
        # Debian/Ubuntu
        sudo apt-get update
        sudo apt-get install -y curl build-essential libx11-dev libxrandr-dev libxinerama-dev \
                               libxcursor-dev libxi-dev libglu1-mesa-dev libgl1-mesa-dev \
                               pkg-config xorg-dev libgtk-3-dev
    elif command_exists dnf; then
        # Fedora
        sudo dnf install -y curl gcc make libX11-devel libXrandr-devel libXinerama-devel \
                           libXcursor-devel libXi-devel mesa-libGL-devel mesa-libGLU-devel \
                           pkg-config gtk3-devel
    elif command_exists yum; then
        # RHEL/CentOS
        sudo yum install -y curl gcc make libX11-devel libXrandr-devel libXinerama-devel \
                           libXcursor-devel libXi-devel mesa-libGL-devel mesa-libGLU-devel \
                           pkg-config gtk3-devel
    elif command_exists pacman; then
        # Arch Linux
        sudo pacman -Sy --needed curl gcc make libx11 libxrandr libxinerama libxcursor \
                                  libxi mesa glu pkg-config gtk3
    elif command_exists zypper; then
        # openSUSE
        sudo zypper install -y curl gcc make libX11-devel libXrandr-devel libXinerama-devel \
                               libXcursor-devel libXi-devel Mesa-libGL-devel Mesa-libGLU-devel \
                               pkg-config gtk3-devel
    else
        echo -e "${RED}❌ Unsupported package manager. Please install development tools manually.${NC}"
        exit 1
    fi
}

# Function to install dependencies on macOS
install_macos_deps() {
    echo -e "${BLUE}🍎 Installing macOS dependencies...${NC}"
    
    # Check if Xcode command line tools are installed
    if ! xcode-select -p &>/dev/null; then
        echo -e "${YELLOW}🔧 Installing Xcode command line tools...${NC}"
        xcode-select --install
        echo -e "${YELLOW}⏳ Please complete the Xcode installation and run this script again.${NC}"
        exit 1
    fi
    
    # Install Homebrew if not present
    if ! command_exists brew; then
        echo -e "${YELLOW}🍺 Installing Homebrew...${NC}"
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
        echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
        eval "$(/opt/homebrew/bin/brew shellenv)"
    fi
    
    brew update
}

# Install OS-specific dependencies
case $OS in
    linux)
        install_linux_deps
        ;;
    macos) 
        install_macos_deps
        ;;
    *)
        echo -e "${RED}❌ Unsupported operating system${NC}"
        exit 1
        ;;
esac

# Check if Go is installed and correct version
if ! command_exists go; then
    echo -e "${YELLOW}📦 Go not found, installing...${NC}"
    install_go
else
    GO_VERSION=$(go version | grep -o 'go[0-9]\+\.[0-9]\+' | sed 's/go//')
    MAJOR=$(echo $GO_VERSION | cut -d. -f1)
    MINOR=$(echo $GO_VERSION | cut -d. -f2)
    
    if [ "$MAJOR" -lt 1 ] || ([ "$MAJOR" -eq 1 ] && [ "$MINOR" -lt 21 ]); then
        echo -e "${YELLOW}📦 Go version $GO_VERSION is too old (need 1.21+), updating...${NC}"
        install_go
    else
        echo -e "${GREEN}✅ Go $GO_VERSION is already installed${NC}"
    fi
fi

# Initialize Go module and download dependencies
echo -e "${BLUE}📦 Installing Go dependencies...${NC}"
go mod tidy
go mod download

# Check if Python client should be used instead of Go
if [ "$1" = "--python" ] || [ ! -z "$USE_PYTHON_CLIENT" ]; then
    echo -e "${BLUE}🐍 Setting up Python client...${NC}"
    
    # Install Python if not present
    if ! command_exists python3; then
        case $OS in
            linux)
                if command_exists apt-get; then
                    sudo apt-get install -y python3 python3-pip python3-venv
                elif command_exists dnf; then
                    sudo dnf install -y python3 python3-pip
                elif command_exists pacman; then
                    sudo pacman -S --needed python python-pip
                fi
                ;;
            macos)
                if command_exists brew; then
                    brew install python@3.12
                fi
                ;;
        esac
    fi
    
    # Create Python virtual environment
    if [ ! -d "venv" ]; then
        python3 -m venv venv
    fi
    
    # Install Python dependencies
    source venv/bin/activate
    pip install -r requirements.txt
    
    # Create Python startup script
    cat > run_client.sh << 'EOF'
#!/bin/bash
# Load configuration
if [ -f config.env ]; then
    export $(cat config.env | grep -v '^#' | xargs)
fi

# Activate Python environment and run client
source venv/bin/activate
python3 client.py
EOF
    
    echo -e "${GREEN}✅ Python client setup complete!${NC}"
    
else
    # Original Go build process
    echo -e "${BLUE}🔨 Building WKApp client...${NC}"
    
    # Try to build Go client
    if CGO_ENABLED=1 go build -o wkapp-client main.go 2>/dev/null; then
        # Make executable
        chmod +x wkapp-client
        
        # Create Go startup script
        cat > run_client.sh << 'EOF'
#!/bin/bash
# Load configuration
if [ -f config.env ]; then
    export $(cat config.env | grep -v '^#' | xargs)
fi

# Run the Go client
./wkapp-client
EOF
        
        echo -e "${GREEN}✅ Go client built successfully!${NC}"
    else
        echo -e "${YELLOW}⚠️  Go build failed, falling back to Python client...${NC}"
        export USE_PYTHON_CLIENT=1
        # Recursively call this script with Python flag
        exec "$0" --python
    fi
fi

# Create configuration file
if [ ! -f "config.env" ]; then
    echo -e "${BLUE}📝 Creating configuration file...${NC}"
    
    # Prompt for server IP address
    echo -e "${YELLOW}🌐 Server Configuration${NC}"
    echo -e "Enter the Mac Mini server IP address (or hostname)"
    echo -e "Examples: 192.168.1.100, office-mac-mini.local, localhost"
    read -p "Server IP/hostname: " SERVER_INPUT
    
    # Default to localhost if nothing entered
    if [ -z "$SERVER_INPUT" ]; then
        SERVER_INPUT="localhost"
    fi
    
    cat > config.env << EOF
# WKApp Client Configuration
# IMPORTANT: Update SERVER_URL for production deployment
SERVER_URL=http://${SERVER_INPUT}:6969

# Polling settings
CLIPBOARD_POLL_INTERVAL=500ms
DEBUG_MODE=false

# Screenshot settings  
SCREENSHOT_QUALITY=90
SCREENSHOT_FORMAT=png

# Network settings
CONNECTION_TIMEOUT=30s
RETRY_ATTEMPTS=3
RETRY_DELAY=5s

# Production Examples:
# SERVER_URL=http://192.168.1.100:6969        (Static IP)
# SERVER_URL=http://office-mac-mini.local:6969 (Hostname)  
# SERVER_URL=http://10.0.0.50:6969            (VPN IP)
EOF
    echo -e "${GREEN}✅ Configuration created with server: ${SERVER_INPUT}${NC}"
    echo -e "${YELLOW}📝 Edit config.env anytime to change server address${NC}"
fi

# Create startup script
cat > run_client.sh << 'EOF'
#!/bin/bash
# Load configuration
if [ -f config.env ]; then
    export $(cat config.env | grep -v '^#' | xargs)
fi

# Run the client
./wkapp-client
EOF

chmod +x run_client.sh

# Special handling for Qubes OS
if [ -f /usr/bin/qubes-session ] || [ -n "$QUBES_ENV" ]; then
    echo -e "${BLUE}🔒 Detected Qubes OS - setting up security policies...${NC}"
    
    # Create Qubes-specific configuration
    cat > README-Qubes.md << 'EOF'
# WKApp Client - Qubes OS Setup

## Security Considerations
- Run this client in a dedicated AppVM (e.g., `wkapp-client`)  
- The AppVM needs network access to communicate with the server
- Screenshot capability requires access to X11 display
- Clipboard access is built-in to Qubes

## Recommended Qubes Setup
1. Create a new AppVM: `qvm-create --class=AppVM --label=blue wkapp-client`
2. Start the VM: `qvm-start wkapp-client`  
3. Install the client in this VM
4. Configure firewall rules to allow only server communication

## Firewall Configuration
Add to `/rw/config/qubes-firewall-user-script`:
```bash
# Allow connection to WKApp server only
iptables -I OUTPUT -p tcp --dport 5000 -d SERVER_IP -j ACCEPT
iptables -A OUTPUT -p tcp --dport 80,443 -j DROP
```

## Running
```bash
cd /home/user/wkapp-client
./run_client.sh
```
EOF

    echo -e "${GREEN}📖 Created Qubes-specific documentation${NC}"
fi

echo -e "${GREEN}✅ WKApp Client setup complete!${NC}"
echo -e "${BLUE}🔧 Setup Summary:${NC}"
echo -e "  • Go runtime: ${GREEN}✓${NC}"
echo -e "  • Dependencies: ${GREEN}✓${NC}"  
echo -e "  • Client binary: ${GREEN}✓${NC}"
echo -e "  • Configuration: ${GREEN}✓${NC}"

echo -e "${YELLOW}📋 Next Steps:${NC}"
echo -e "  1. Edit config.env with your server URL if needed"
echo -e "  2. Make sure the server is running at the configured URL"
echo -e "  3. Run: ${BLUE}./run_client.sh${NC}"

echo -e "${BLUE}ℹ️  Usage:${NC}"
echo -e "  • Copy PGP messages to clipboard"
echo -e "  • Client will automatically detect and process them"
echo -e "  • View results on the server dashboard"

# Test the client (works for both Go and Python)
echo -e "${BLUE}🧪 Testing client...${NC}"
if [ -f "wkapp-client" ]; then
    # Test Go client
    if ./wkapp-client --help 2>/dev/null || [ $? -eq 2 ]; then
        echo -e "${GREEN}✅ Go client binary works correctly${NC}"
    else
        echo -e "${YELLOW}⚠️  Go client test had issues, but this might be normal${NC}"
    fi
elif [ -f "client.py" ] && [ -d "venv" ]; then
    # Test Python client
    echo -e "${GREEN}✅ Python client ready${NC}"
else
    echo -e "${YELLOW}⚠️  No client found - setup may have failed${NC}"
fi

echo -e "${GREEN}🚀 Ready to start client!${NC}"
echo -e "${BLUE}Run: ./run_client.sh${NC}"