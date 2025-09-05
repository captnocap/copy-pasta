#!/bin/bash
# Manual dependency installation for server environment

echo "🔧 Installing Python dependencies in server environment..."

# Activate the server environment and install via pip
mamba run -n server pip install \
  flask==3.0.3 \
  flask-cors==4.0.0 \
  flask-socketio==5.3.6 \
  python-gnupg==0.5.2 \
  requests==2.32.3 \
  pytesseract==0.3.13 \
  pillow==10.4.0 \
  python-socketio==5.11.0 \
  eventlet==0.36.1 \
  python-dotenv==1.0.0

echo "✅ Dependencies installed!"