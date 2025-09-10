#!/bin/bash
# Load configuration
if [ -f config.env ]; then
    export $(cat config.env | grep -v '^#' | xargs)
fi

# Try to build Go client if it doesn't exist
if [ ! -f "./wkapp-client" ]; then
    echo "🔨 Building Go client..."
    if command -v go >/dev/null 2>&1; then
        go build -o wkapp-client main.go
        if [ $? -eq 0 ]; then
            echo "✅ Go client built successfully!"
        else
            echo "❌ Go build failed, using Python client instead..."
        fi
    else
        echo "⚠️  Go not installed, using Python client instead..."
    fi
fi

# Run the client (Go if available, Python as fallback)
if [ -f "./wkapp-client" ]; then
    echo "🚀 Starting Go client..."
    ./wkapp-client
else
    echo "🚀 Starting Python client..."
    source venv/bin/activate 2>/dev/null || true
    python3 client.py
fi
