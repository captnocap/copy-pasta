#!/usr/bin/env python3

import time
import pyperclip
import requests
import base64
import json
import os
import sys
import platform
import socket
import uuid
from io import BytesIO
from PIL import ImageGrab
from colorama import Fore, Style, init

# Initialize colorama for cross-platform colored output
init()

def clear_screen():
    os.system('cls' if os.name == 'nt' else 'clear')

def test_server_connection(server_url, timeout=10):
    """Test connection to WKApp server"""
    try:
        # First, test basic connectivity
        print(f"{Fore.BLUE}🔍 Testing connection to {server_url}...")
        
        # Health check
        health_url = f"{server_url}/api/health"
        response = requests.get(health_url, timeout=timeout)
        
        if response.status_code == 200:
            health_data = response.json()
            print(f"{Fore.GREEN}✅ Server health check passed")
            print(f"   Server: {health_data.get('server', 'Unknown')}")
            print(f"   Version: {health_data.get('version', 'Unknown')}")
            print(f"   Uptime: {health_data.get('uptime', 0)} seconds")
            
            # Send ping to register client
            client_id = f"{platform.node()}-{str(uuid.uuid4())[:8]}"
            ping_data = {
                "client_id": client_id,
                "platform": f"{platform.system()} {platform.release()}"
            }
            
            ping_response = requests.post(f"{server_url}/api/ping", json=ping_data, timeout=timeout)
            if ping_response.status_code == 200:
                ping_result = ping_response.json()
                print(f"{Fore.GREEN}✅ Client registration successful")
                print(f"   Message: {ping_result.get('message', 'Connected')}")
                return True, client_id
            else:
                print(f"{Fore.YELLOW}⚠️  Health check passed but ping failed: {ping_response.status_code}")
                return True, client_id  # Still allow connection
                
        else:
            print(f"{Fore.RED}❌ Server health check failed: {response.status_code}")
            return False, None
            
    except requests.exceptions.ConnectionError:
        print(f"{Fore.RED}❌ Cannot connect to server: Connection refused")
        print(f"   Make sure the server is running at {server_url}")
        return False, None
    except requests.exceptions.Timeout:
        print(f"{Fore.RED}❌ Connection timeout after {timeout} seconds")
        return False, None
    except Exception as e:
        print(f"{Fore.RED}❌ Connection test failed: {e}")
        return False, None

def main():
    # Get server URL from environment or config
    server_url = os.getenv('SERVER_URL', 'http://localhost:6969')
    
    # Ensure proper URL format
    if not server_url.startswith(('http://', 'https://')):
        server_url = f'http://{server_url}'
    if ':' not in server_url.split('//')[1]:
        server_url = f'{server_url}:6969'
    
    # Clear screen and show header
    clear_screen()
    print(f"{Fore.CYAN}=================================")
    print(f"   WKApp Clipboard Monitor v1.0  ")
    print(f"=================================")
    print(f"{Style.RESET_ALL}")
    
    # Test server connection first
    connected, client_id = test_server_connection(server_url)
    print()  # Blank line after connection test
    
    if not connected:
        print(f"{Fore.RED}❌ Cannot start client - server connection failed")
        print(f"{Fore.YELLOW}💡 Solutions:")
        print(f"   1. Start the server: cd server && ./run_server.sh")
        print(f"   2. Check server URL in config.env")
        print(f"   3. Verify network connectivity")
        print(f"{Style.RESET_ALL}")
        sys.exit(1)
    
    print(f"{Fore.GREEN}🚀 Client connected successfully!")
    print(f"{Fore.BLUE}🌐 Server: {server_url}")
    print(f"{Fore.BLUE}🆔 Client ID: {client_id}")
    print(f"{Fore.YELLOW}👀 Monitoring clipboard for PGP messages...")
    print(f"{Style.RESET_ALL}")
    
    last_content = ""
    
    while True:
        try:
            # Check clipboard
            try:
                content = pyperclip.paste()
            except Exception as e:
                print(f"{Fore.RED}❌ Clipboard access error: {e}{Style.RESET_ALL}")
                time.sleep(5)
                continue
            
            # Check if clipboard changed and is not empty
            if content and content != last_content:
                last_content = content
                
                # Check if it's a PGP message
                trimmed = content.strip()
                if (trimmed.startswith("-----BEGIN PGP MESSAGE-----") and 
                    trimmed.endswith("-----END PGP MESSAGE-----")):
                    
                    timestamp = time.strftime("%H:%M:%S")
                    print(f"{Fore.YELLOW}[{timestamp}] 🔒 PGP message detected!")
                    
                    # Take screenshot
                    try:
                        screenshot = ImageGrab.grab()
                        
                        # Convert to base64
                        buffer = BytesIO()
                        screenshot.save(buffer, format='PNG', optimize=True)
                        screenshot_b64 = base64.b64encode(buffer.getvalue()).decode()
                        
                        print(f"{Fore.GREEN}[{timestamp}] ✅ Screenshot captured! ({len(screenshot_b64)//1024} KB)")
                        
                    except Exception as e:
                        print(f"{Fore.RED}[{timestamp}] ❌ Screenshot failed: {e}")
                        continue
                    
                    # Send to API
                    try:
                        payload = {
                            "pgp_message": content,
                            "screenshot_b64": screenshot_b64,
                            "timestamp": int(time.time())
                        }
                        
                        api_url = f"{server_url}/api/order"
                        response = requests.post(
                            api_url,
                            json=payload,
                            headers={'Content-Type': 'application/json'},
                            timeout=30
                        )
                        
                        if response.status_code == 200:
                            result = response.json()
                            order_id = result.get('order_id', 'Unknown')
                            print(f"{Fore.GREEN}[{timestamp}] ✅ Order sent successfully! ID: {order_id}")
                        else:
                            print(f"{Fore.RED}[{timestamp}] ❌ API error: {response.status_code} - {response.text}")
                            
                    except requests.exceptions.ConnectionError:
                        print(f"{Fore.RED}[{timestamp}] ❌ Failed to connect to server: {server_url}")
                        print(f"{Fore.YELLOW}[{timestamp}] 💾 Order data ready for retry when server is available")
                    except requests.exceptions.Timeout:
                        print(f"{Fore.RED}[{timestamp}] ❌ Request timed out")
                    except Exception as e:
                        print(f"{Fore.RED}[{timestamp}] ❌ Failed to send to API: {e}")
                    
                    print()  # Add blank line after processing
            
            time.sleep(0.5)  # Poll every 500ms
            
        except KeyboardInterrupt:
            print(f"\n{Fore.CYAN}👋 WKApp Client shutting down...{Style.RESET_ALL}")
            break
        except Exception as e:
            print(f"{Fore.RED}❌ Unexpected error: {e}{Style.RESET_ALL}")
            time.sleep(1)

if __name__ == "__main__":
    main()