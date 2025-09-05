from flask import Flask, request, jsonify, send_from_directory, render_template_string
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import sqlite3
import json
import time
from datetime import datetime
import base64
import os
import gnupg
import requests
import pytesseract
import subprocess
import csv
from PIL import Image
from io import BytesIO, StringIO

# Load environment variables from .env file
from dotenv import load_dotenv
load_dotenv()

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# Initialize GPG
gpg = gnupg.GPG()

# NANO-GPT configuration
NANO_GPT_API = "https://nano-gpt.com/api/v1/chat/completions"
NANO_GPT_API_KEY = os.getenv('NANO_GPT_API_KEY', '')
DEFAULT_MODEL = "google/gemini-flash-1.5"
current_model = DEFAULT_MODEL

print(f"🔑 API Key loaded: {'✅ Yes' if NANO_GPT_API_KEY else '❌ Missing'}")
if not NANO_GPT_API_KEY:
    print(f"⚠️  Set NANO_GPT_API_KEY in .env file")

# Database setup
DB_PATH = "data/orders.db"

def init_db():
    os.makedirs("data", exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS orders (
            id TEXT PRIMARY KEY,
            pgp_message TEXT,
            pgp_decrypted TEXT,
            screenshot_path TEXT,
            ocr_text TEXT,
            timestamp INTEGER,
            processed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            status TEXT DEFAULT 'received',
            gemini_request TEXT,
            gemini_response TEXT,
            customer_data TEXT,
            confidence_score REAL,
            model_used TEXT,
            exported BOOLEAN DEFAULT FALSE
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS action_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            action TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            status_code INTEGER,
            message TEXT
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS tracking_numbers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            tracking_number TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            linked_order_id TEXT,
            is_used BOOLEAN DEFAULT FALSE,
            FOREIGN KEY (linked_order_id) REFERENCES orders (id)
        )
    ''')
    
    conn.commit()
    conn.close()

def process_screenshot(screenshot_b64, order_id):
    """Save screenshot and extract text via OCR"""
    try:
        # Create screenshots directory
        screenshots_dir = "data/screenshots"
        os.makedirs(screenshots_dir, exist_ok=True)
        
        # Save screenshot
        screenshot_path = f"{screenshots_dir}/{order_id}.png"
        img_data = base64.b64decode(screenshot_b64)
        
        with open(screenshot_path, 'wb') as f:
            f.write(img_data)
        
        # Run OCR
        img = Image.open(BytesIO(img_data))
        ocr_text = pytesseract.image_to_string(img)
        
        return screenshot_path, ocr_text, None
    except Exception as e:
        return None, None, str(e)

def decrypt_pgp(pgp_message):
    """Decrypt PGP message"""
    try:
        decrypted = gpg.decrypt(pgp_message)
        if decrypted.ok:
            return str(decrypted), None
        else:
            return None, f"Decryption failed: {decrypted.status}"
    except Exception as e:
        return None, str(e)

def parse_address_with_api(pgp_decrypted, model_name):
    """Parse address from PGP decrypted text using Gemini API (from old.py)"""
    try:
        prompt = f"""Parse this address into structured JSON format. Return ONLY the JSON, no other text:

Address text:
{pgp_decrypted}

Required JSON format:
{{
    "name": "Full Name",
    "address1": "Street address with number",
    "address2": "Apartment/Unit if any, otherwise empty string",
    "city": "City name",
    "state": "State abbreviation (e.g. OR, CA)",
    "zip": "ZIP code"
}}

Return only valid JSON, no markdown or explanations."""

        response = requests.post(
            NANO_GPT_API,
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {NANO_GPT_API_KEY}"
            },
            json={
                "model": model_name,
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.1,
                "max_tokens": 500
            },
            timeout=15
        )
        
        if response.status_code == 200:
            result = response.json()
            content = result.get('choices', [{}])[0].get('message', {}).get('content', '').strip()
            content = content.replace('```json', '').replace('```', '').strip()
            
            try:
                parsed_address = json.loads(content)
                return parsed_address, None
            except json.JSONDecodeError as e:
                return None, f"Failed to parse address JSON: {e}"
        else:
            # Log the full error response for debugging
            try:
                error_data = response.json()
                error_msg = error_data.get('error', {}).get('message', 'Unknown error')
                print(f"🔴 API Error {response.status_code}: {error_msg}")
            except:
                print(f"🔴 API Error {response.status_code}: {response.text}")
            
            return None, f"Address API request failed: {response.status_code} - {response.text[:200]}"
            
    except Exception as e:
        return None, str(e)

def check_duplicate_address(cursor, parsed_address):
    """Check for duplicate addresses in database (from old.py logic)"""
    try:
        # Create address key for comparison
        address_key = {
            "name": parsed_address.get("name", "").strip().lower(),
            "address1": parsed_address.get("address1", "").strip().lower(),
            "address2": parsed_address.get("address2", "").strip().lower(),
            "city": parsed_address.get("city", "").strip().lower(),
            "state": parsed_address.get("state", "").strip().upper(),
            "zip": parsed_address.get("zip", "").strip()
        }
        
        # Search for matching addresses in recent orders (last 30 days)
        cursor.execute('''
            SELECT id, customer_data 
            FROM orders 
            WHERE status = 'processed' 
            AND customer_data IS NOT NULL 
            AND datetime(processed_at) > datetime('now', '-30 days')
            ORDER BY processed_at DESC
        ''')
        
        for order_id, customer_data_str in cursor.fetchall():
            try:
                customer_data = json.loads(customer_data_str)
                existing_addr = customer_data.get('parsed_address', {})
                
                existing_key = {
                    "name": existing_addr.get("name", "").strip().lower(),
                    "address1": existing_addr.get("address1", "").strip().lower(),
                    "address2": existing_addr.get("address2", "").strip().lower(),
                    "city": existing_addr.get("city", "").strip().lower(),
                    "state": existing_addr.get("state", "").strip().upper(),
                    "zip": existing_addr.get("zip", "").strip()
                }
                
                # Check for exact match
                if address_key == existing_key:
                    return order_id
                    
            except (json.JSONDecodeError, KeyError):
                continue
        
        return None
        
    except Exception as e:
        print(f"Duplicate check error: {e}")
        return None

def merge_duplicate_orders(cursor, existing_order_id, new_enhanced_data, new_order_id):
    """Merge new order data with existing order (from old.py logic)"""
    try:
        # Get existing order
        cursor.execute('SELECT customer_data FROM orders WHERE id = ?', (existing_order_id,))
        result = cursor.fetchone()
        
        if result:
            existing_data = json.loads(result[0]) if result[0] else {}
            existing_enhanced = existing_data.get('enhanced_order_data', {})
            
            # Merge enhanced data - new data takes precedence for non-empty values
            merged_enhanced = existing_enhanced.copy()
            for key, value in new_enhanced_data.items():
                if value and str(value).strip():  # Only update if new value is not empty
                    merged_enhanced[key] = value
            
            # Update existing order
            updated_customer_data = existing_data.copy()
            updated_customer_data['enhanced_order_data'] = merged_enhanced
            updated_customer_data['last_updated'] = datetime.now().isoformat()
            updated_customer_data['merged_from'] = new_order_id
            
            cursor.execute('''
                UPDATE orders 
                SET customer_data = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            ''', (json.dumps(updated_customer_data), existing_order_id))
            
            return True
            
    except Exception as e:
        print(f"Merge error: {e}")
        return False

def extract_order_data_with_vision(screenshot_b64, model_name):
    """Extract structured e-commerce order data from screenshot using Gemini Vision (from old.py)"""
    try:
        prompt = """Analyze this screenshot and extract order/e-commerce data. Look for these specific fields and return as JSON:

Required fields to find:
- Status (e.g., "Paid", "Processing", "Shipped", etc.)
- Paid On (date when payment was made)
- Customer (customer name or email)
- Listing (product/item name)
- Quantity (number of items)
- Shipping (shipping method or cost)
- Order Total (total amount paid)

Return ONLY JSON format:
{
    "status": "extracted status or empty string",
    "paid_on": "extracted date or empty string", 
    "customer": "extracted customer info or empty string",
    "listing": "extracted product name or empty string",
    "quantity": "extracted quantity or empty string",
    "shipping": "extracted shipping info or empty string",
    "order_total": "extracted total amount or empty string"
}

If you can't find a field, use an empty string. Return only valid JSON, no explanations."""

        response = requests.post(
            NANO_GPT_API,
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {NANO_GPT_API_KEY}"
            },
            json={
                "model": model_name,
                "messages": [
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt},
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/png;base64,{screenshot_b64}"
                                }
                            }
                        ]
                    }
                ]
            },
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            content = result.get('choices', [{}])[0].get('message', {}).get('content', '').strip()
            content = content.replace('```json', '').replace('```', '').strip()
            
            try:
                ocr_data = json.loads(content)
                return ocr_data, None
            except json.JSONDecodeError as e:
                return None, f"Failed to parse OCR JSON: {e}"
        else:
            return None, f"Vision API request failed: {response.status_code}"
            
    except Exception as e:
        return None, str(e)

@app.route('/api/order', methods=['POST'])
def receive_order():
    order_id = f"ORD-{int(time.time())}"
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        data = request.json
        
        # Emit initial status
        socketio.emit('order_status', {
            'order_id': order_id,
            'step': 'received',
            'message': 'Order received, processing...'
        })
        
        # Save screenshot first
        socketio.emit('order_status', {
            'order_id': order_id,
            'step': 'screenshot',
            'message': 'Saving screenshot...'
        })
        
        screenshot_path, _, screenshot_error = process_screenshot(data['screenshot_b64'], order_id)
        if screenshot_error:
            raise Exception(f"Screenshot save failed: {screenshot_error}")
        
        # Decrypt PGP
        socketio.emit('order_status', {
            'order_id': order_id,
            'step': 'decrypt',
            'message': 'Decrypting PGP message...'
        })
        
        pgp_decrypted, pgp_error = decrypt_pgp(data['pgp_message'])
        if pgp_error:
            raise Exception(f"PGP decryption failed: {pgp_error}")
        
        # Parse address from PGP
        socketio.emit('order_status', {
            'order_id': order_id,
            'step': 'address_parse',
            'message': 'Parsing shipping address...'
        })
        
        parsed_address, addr_error = parse_address_with_api(pgp_decrypted, current_model)
        if addr_error:
            raise Exception(f"Address parsing failed: {addr_error}")
        
        # Extract order data using Vision API
        socketio.emit('order_status', {
            'order_id': order_id,
            'step': 'vision_ocr',
            'message': 'Extracting order data with Vision API...'
        })
        
        enhanced_data, vision_error = extract_order_data_with_vision(data['screenshot_b64'], current_model)
        if vision_error:
            # Continue without enhanced data - address is more important
            enhanced_data = {}
            print(f"Vision API warning: {vision_error}")
        
        # Create combined order data
        gemini_request = f"Address parsing: {json.dumps(parsed_address, indent=2)}"
        gemini_response = json.dumps({
            "parsed_address": parsed_address,
            "enhanced_order_data": enhanced_data
        }, indent=2)
        
        # Check for duplicate addresses (from old.py logic)
        duplicate_order_id = check_duplicate_address(cursor, parsed_address)
        
        if duplicate_order_id:
            # Update existing order with additional data
            socketio.emit('order_status', {
                'order_id': order_id,
                'step': 'duplicate_merge',
                'message': f'Merging with existing order {duplicate_order_id}...'
            })
            
            merge_duplicate_orders(cursor, duplicate_order_id, enhanced_data, order_id)
            action_message = f"Order merged with existing {duplicate_order_id}"
            final_order_id = duplicate_order_id
        else:
            # Store new order in database
            cursor.execute('''
                INSERT INTO orders (id, pgp_message, pgp_decrypted, screenshot_path, 
                                  timestamp, status, gemini_request, gemini_response, model_used,
                                  customer_data)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (order_id, data['pgp_message'], pgp_decrypted, screenshot_path,
                  data.get('timestamp', int(time.time())), 'processed', gemini_request, 
                  gemini_response, current_model, json.dumps({
                      "parsed_address": parsed_address,
                      "enhanced_order_data": enhanced_data
                  })))
            action_message = "New order processed and stored"
            final_order_id = order_id
        
        # Log success  
        cursor.execute('''
            INSERT INTO action_log (action, status_code, message)
            VALUES (?, ?, ?)
        ''', (f"Order {final_order_id} processed", 200, action_message))
        
        conn.commit()
        
        # Emit success with enhanced data
        socketio.emit('order_processed', {
            'order_id': final_order_id,
            'original_order_id': order_id,
            'timestamp': datetime.now().isoformat(),
            'parsed_address': parsed_address,
            'enhanced_order_data': enhanced_data,
            'gemini_request': gemini_request,
            'gemini_response': gemini_response,
            'model_used': current_model,
            'was_duplicate': duplicate_order_id is not None
        })
        
        return jsonify({
            'status': 'success',
            'order_id': order_id,
            'message': 'Order processed successfully'
        }), 200
        
    except Exception as e:
        # Log error
        cursor.execute('''
            INSERT INTO action_log (action, status_code, message)
            VALUES (?, ?, ?)
        ''', (f"Order {order_id} failed", 500, str(e)))
        
        conn.commit()
        
        # Emit error
        socketio.emit('order_error', {
            'order_id': order_id,
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        })
        
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500
    finally:
        conn.close()

@app.route('/api/orders', methods=['GET'])
def get_orders():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT id, timestamp, processed_at, status, customer_data, confidence_score
        FROM orders
        ORDER BY processed_at DESC
        LIMIT 100
    ''')
    
    orders = []
    for row in cursor.fetchall():
        orders.append({
            'id': row[0],
            'timestamp': row[1],
            'processed_at': row[2],
            'status': row[3],
            'customer_data': json.loads(row[4]) if row[4] else None,
            'confidence_score': row[5]
        })
    
    conn.close()
    return jsonify(orders)

@app.route('/api/logs', methods=['GET'])
def get_logs():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT action, timestamp, status_code, message
        FROM action_log
        ORDER BY timestamp DESC
        LIMIT 50
    ''')
    
    logs = []
    for row in cursor.fetchall():
        logs.append({
            'action': row[0],
            'timestamp': row[1],
            'status_code': row[2],
            'message': row[3]
        })
    
    conn.close()
    return jsonify(logs)

@app.route('/')
def dashboard():
    """Serve the main dashboard HTML page"""
    try:
        with open('index.html', 'r') as f:
            html_content = f.read()
        return html_content
    except FileNotFoundError:
        return jsonify({'error': 'Dashboard not found'}), 404

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy', 
        'timestamp': datetime.now().isoformat(),
        'server': 'WKApp Order Processing Server',
        'version': '1.0.0',
        'uptime': int(time.time() - app.start_time) if hasattr(app, 'start_time') else 0
    })

@app.route('/api/ping', methods=['POST'])
def client_ping():
    """Endpoint for client connection testing"""
    data = request.json or {}
    client_info = {
        'client_id': data.get('client_id', 'unknown'),
        'client_platform': data.get('platform', 'unknown'),
        'timestamp': datetime.now().isoformat(),
        'ip_address': request.remote_addr
    }
    
    # Log the client connection
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO action_log (action, status_code, message)
        VALUES (?, ?, ?)
    ''', ('Client ping received', 200, f"Client {client_info['client_id']} from {client_info['ip_address']}"))
    conn.commit()
    conn.close()
    
    # Emit to dashboard
    socketio.emit('client_connected', client_info)
    
    return jsonify({
        'status': 'pong',
        'server': 'WKApp Order Processing Server',
        'timestamp': datetime.now().isoformat(),
        'message': f"Hello {client_info['client_id']}! Connection verified."
    })

@app.route('/api/model', methods=['GET', 'POST'])
def manage_model():
    global current_model
    
    if request.method == 'POST':
        data = request.json
        new_model = data.get('model', DEFAULT_MODEL)
        current_model = new_model
        
        socketio.emit('model_changed', {
            'new_model': current_model,
            'timestamp': datetime.now().isoformat()
        })
        
        return jsonify({
            'status': 'success',
            'model': current_model,
            'message': f'Model changed to {current_model}'
        })
    
    return jsonify({'current_model': current_model, 'default_model': DEFAULT_MODEL})

@app.route('/api/export-csv', methods=['GET'])
def export_orders_csv():
    """Export orders to shipping label CSV format"""
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Get orders with parsed customer data that haven't been exported yet
        cursor.execute('''
            SELECT id, customer_data, processed_at, status
            FROM orders 
            WHERE status = 'processed' AND customer_data IS NOT NULL AND (exported = FALSE OR exported IS NULL)
            ORDER BY processed_at DESC
        ''')
        
        orders = cursor.fetchall()
        conn.close()
        
        # Create CSV in memory
        output = StringIO()
        writer = csv.writer(output)
        
        # Shipping label headers - exactly as specified + tracking number
        header = [
            "Carrier", "Service", "Length", "Width", "Height", "Weight(Lbs)", "Weight(Oz)",
            "Package Type", "From Name", "From Address1", "From Address2", "From City",
            "From State/Province", "From Zip/Postal Code", "From Country", "From Phone Number",
            "To Name", "To Address1", "To Address2", "To City", "To State/Province",
            "To Zip/Postal Code", "To Country", "To Phone Number", "Email", "Tracking Number"
        ]
        writer.writerow(header)
        
        # Import config for return addresses and service specs
        try:
            from config import RETURN_ADDRESSES, SERVICE_SPECS
            default_warehouse = list(RETURN_ADDRESSES.values())[0]
            default_service = list(SERVICE_SPECS.values())[0]
        except ImportError:
            # Fallback config if config.py doesn't exist
            default_warehouse = {
                'name': 'WKApp Fulfillment',
                'address1': '123 Main St',
                'address2': '',
                'city': 'Portland',
                'state': 'OR',
                'zip': '97201'
            }
            default_service = {
                'carrier': 'USPS',
                'service': 'Priority',
                'max_dimensions': '12x9x3',
                'max_weight': '1lbs',
                'package_type': 'Box'
            }
        
        # Get available tracking numbers that match customer names
        cursor.execute('''
            SELECT id, name, tracking_number
            FROM tracking_numbers 
            WHERE is_used = FALSE 
            ORDER BY created_at ASC
        ''')
        available_tracking = {row[1].lower().strip(): {'id': row[0], 'tracking': row[2]} for row in cursor.fetchall()}
        
        used_tracking_ids = []
        
        for order_id, customer_data_str, processed_at, status in orders:
            try:
                customer_data = json.loads(customer_data_str) if customer_data_str else {}
                parsed_address = customer_data.get('parsed_address', {})
                enhanced_data = customer_data.get('enhanced_order_data', {})
                
                # Build order contents for Email field - format as quantity x item
                order_parts = []
                
                # Primary format: quantity x item (what you're used to seeing)
                if enhanced_data.get('quantity') and enhanced_data.get('listing'):
                    quantity = enhanced_data.get('quantity', '1')
                    listing = enhanced_data.get('listing', '')
                    order_parts.append(f"{quantity}x {listing}")
                elif enhanced_data.get('listing'):
                    # If no quantity specified, assume 1
                    order_parts.append(f"1x {enhanced_data.get('listing')}")
                
                # For multiple items in future orders, split with | between items
                # (The OCR might capture multiple products - handle this later)
                
                # Add order total if available
                if enhanced_data.get('order_total'):
                    order_parts.append(f"Total: {enhanced_data['order_total']}")
                
                # Create the email content (what goes in the Email field)
                if order_parts:
                    email_content = " | ".join(order_parts)
                else:
                    # Fallback if no OCR data captured
                    email_content = f"Order: {order_id}"
                
                # Find matching tracking number by customer name
                customer_name = parsed_address.get('name', '').lower().strip()
                tracking_number = ''
                
                if customer_name and customer_name in available_tracking:
                    tracking_info = available_tracking[customer_name]
                    tracking_number = tracking_info['tracking']
                    used_tracking_ids.append(tracking_info['id'])
                    # Remove from available pool to prevent duplicate assignments
                    del available_tracking[customer_name]
                
                # Build the shipping label row
                row = [
                    default_service.get('carrier', 'USPS'),           # Carrier
                    default_service.get('service', 'Priority'),      # Service
                    default_service.get('max_dimensions', '').split('x')[0] if 'x' in str(default_service.get('max_dimensions', '')) else '',  # Length
                    default_service.get('max_dimensions', '').split('x')[1] if 'x' in str(default_service.get('max_dimensions', '')) and len(str(default_service.get('max_dimensions', '')).split('x')) > 1 else '',  # Width
                    default_service.get('max_dimensions', '').split('x')[2] if 'x' in str(default_service.get('max_dimensions', '')) and len(str(default_service.get('max_dimensions', '')).split('x')) > 2 else '',  # Height
                    default_service.get('max_weight', '').replace('lbs', '').strip(),  # Weight(Lbs)
                    '',                                               # Weight(Oz) - empty
                    default_service.get('package_type', 'Box'),      # Package Type
                    default_warehouse.get('name', ''),               # From Name
                    default_warehouse.get('address1', ''),           # From Address1
                    default_warehouse.get('address2', ''),           # From Address2
                    default_warehouse.get('city', ''),               # From City
                    default_warehouse.get('state', ''),              # From State/Province
                    default_warehouse.get('zip', ''),                # From Zip/Postal Code
                    'US',                                             # From Country
                    '',                                               # From Phone Number - empty
                    parsed_address.get('name', ''),                  # To Name
                    parsed_address.get('address1', ''),              # To Address1
                    parsed_address.get('address2', ''),              # To Address2
                    parsed_address.get('city', ''),                  # To City
                    parsed_address.get('state', ''),                 # To State/Province
                    parsed_address.get('zip', ''),                   # To Zip/Postal Code
                    'US',                                             # To Country
                    '',                                               # To Phone Number - empty
                    email_content,                                    # Email - contains order details
                    tracking_number                                   # Tracking Number
                ]
                writer.writerow(row)
                
            except json.JSONDecodeError:
                # Skip malformed data
                continue
        
        # Get CSV content
        csv_content = output.getvalue()
        output.close()
        
        # Mark exported orders and log the export
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Mark all exported orders as exported
        if orders:
            order_ids = [order[0] for order in orders]  # Extract order IDs
            placeholders = ','.join('?' * len(order_ids))
            cursor.execute(f'''
                UPDATE orders 
                SET exported = TRUE 
                WHERE id IN ({placeholders})
            ''', order_ids)
        
        # Mark tracking numbers as used and link to orders if any were assigned
        if used_tracking_ids:
            tracking_placeholders = ','.join('?' * len(used_tracking_ids))
            cursor.execute(f'''
                UPDATE tracking_numbers 
                SET is_used = TRUE 
                WHERE id IN ({tracking_placeholders})
            ''', used_tracking_ids)
        
        cursor.execute('''
            INSERT INTO action_log (action, status_code, message)
            VALUES (?, ?, ?)
        ''', ('Shipping CSV export generated', 200, 
              f'Exported {len(orders)} orders to shipping CSV, assigned {len(used_tracking_ids)} tracking numbers'))
        conn.commit()
        conn.close()
        
        # Return CSV as downloadable file
        response = app.response_class(
            csv_content,
            mimetype='text/csv',
            headers={'Content-Disposition': f'attachment; filename=shipping_labels_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv'}
        )
        
        return response
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'CSV export failed: {str(e)}'
        }), 500

@app.route('/api/send-summary', methods=['POST'])
def send_daily_summary():
    try:
        # Call Bun Session.js service
        result = subprocess.run(
            ['bun', 'run', 'summary'],
            cwd='session',
            capture_output=True,
            text=True,
            timeout=30
        )
        
        if result.returncode == 0:
            # Log success
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO action_log (action, status_code, message)
                VALUES (?, ?, ?)
            ''', ('Manual daily summary sent', 200, 'Summary sent via Session bot'))
            conn.commit()
            conn.close()
            
            socketio.emit('summary_sent', {
                'message': 'Daily summary sent successfully!',
                'timestamp': datetime.now().isoformat()
            })
            
            return jsonify({
                'status': 'success',
                'message': 'Daily summary sent successfully!'
            }), 200
        else:
            raise Exception(f"Bun process failed: {result.stderr}")
            
    except subprocess.TimeoutExpired:
        return jsonify({
            'status': 'error',
            'message': 'Summary send timed out'
        }), 500
    except Exception as e:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO action_log (action, status_code, message)
            VALUES (?, ?, ?)
        ''', ('Manual daily summary failed', 500, str(e)))
        conn.commit()
        conn.close()
        
        return jsonify({
            'status': 'error',
            'message': f'Failed to send summary: {str(e)}'
        }), 500

@app.route('/api/reset-exports', methods=['POST'])
def reset_export_state():
    """Reset the export state - mark all orders as not exported"""
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Count how many orders will be reset
        cursor.execute('SELECT COUNT(*) FROM orders WHERE exported = TRUE')
        reset_count = cursor.fetchone()[0]
        
        # Reset all orders to not exported
        cursor.execute('UPDATE orders SET exported = FALSE')
        
        # Log the reset action
        cursor.execute('''
            INSERT INTO action_log (action, status_code, message)
            VALUES (?, ?, ?)
        ''', ('Export state reset', 200, f'Reset {reset_count} orders to not exported'))
        
        conn.commit()
        conn.close()
        
        # Emit to dashboard
        socketio.emit('export_reset', {
            'message': f'Export state reset - {reset_count} orders available for export',
            'timestamp': datetime.now().isoformat(),
            'count': reset_count
        })
        
        return jsonify({
            'status': 'success',
            'message': f'Export state reset successfully',
            'reset_count': reset_count
        }), 200
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Reset failed: {str(e)}'
        }), 500

@app.route('/api/tracking-numbers', methods=['POST'])
def store_tracking_numbers():
    """Store tracking numbers from blob format (Name Tracking per line)"""
    try:
        data = request.json
        tracking_blob = data.get('tracking_blob', '').strip()
        
        if not tracking_blob:
            return jsonify({
                'status': 'error',
                'message': 'No tracking data provided'
            }), 400
        
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Parse the blob - each line should be "Name Tracking"
        lines = tracking_blob.split('\n')
        stored_count = 0
        errors = []
        
        for line_num, line in enumerate(lines, 1):
            line = line.strip()
            if not line:
                continue
                
            # Split line into name and tracking number
            parts = line.split()
            if len(parts) < 2:
                errors.append(f"Line {line_num}: Invalid format - expected 'Name Tracking'")
                continue
            
            # First part is name, last part is tracking number, middle parts go to name
            tracking_number = parts[-1]
            name = ' '.join(parts[:-1])
            
            # Store in database
            try:
                cursor.execute('''
                    INSERT INTO tracking_numbers (name, tracking_number)
                    VALUES (?, ?)
                ''', (name, tracking_number))
                stored_count += 1
            except sqlite3.Error as e:
                errors.append(f"Line {line_num}: Database error - {str(e)}")
        
        # Log the action
        cursor.execute('''
            INSERT INTO action_log (action, status_code, message)
            VALUES (?, ?, ?)
        ''', ('Tracking numbers imported', 200 if stored_count > 0 else 400, 
              f'Stored {stored_count} tracking numbers, {len(errors)} errors'))
        
        conn.commit()
        conn.close()
        
        # Emit to dashboard
        socketio.emit('tracking_numbers_imported', {
            'message': f'Imported {stored_count} tracking numbers',
            'timestamp': datetime.now().isoformat(),
            'count': stored_count,
            'errors': errors
        })
        
        return jsonify({
            'status': 'success' if stored_count > 0 else 'warning',
            'message': f'Stored {stored_count} tracking numbers',
            'stored_count': stored_count,
            'errors': errors
        }), 200 if stored_count > 0 else 400
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Import failed: {str(e)}'
        }), 500

@app.route('/api/tracking-numbers', methods=['GET'])
def get_tracking_numbers():
    """Get all tracking numbers with their usage status"""
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id, name, tracking_number, created_at, linked_order_id, is_used
            FROM tracking_numbers
            ORDER BY created_at DESC
        ''')
        
        tracking_numbers = []
        for row in cursor.fetchall():
            tracking_numbers.append({
                'id': row[0],
                'name': row[1],
                'tracking_number': row[2],
                'created_at': row[3],
                'linked_order_id': row[4],
                'is_used': bool(row[5])
            })
        
        conn.close()
        return jsonify(tracking_numbers)
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Failed to fetch tracking numbers: {str(e)}'
        }), 500

@socketio.on('connect')
def handle_connect():
    print(f"Client connected: {request.sid}")
    emit('connected', {'message': 'Connected to order processing server'})

@socketio.on('disconnect')
def handle_disconnect():
    print(f"Client disconnected: {request.sid}")

if __name__ == '__main__':
    # Set server start time for uptime tracking
    app.start_time = time.time()
    
    init_db()
    print("🚀 WKApp Order Processing Server")
    print("=" * 40)
    print(f"🌐 Server URL: http://localhost:6969")
    print(f"📊 Dashboard: http://localhost:6969/")
    print(f"🔍 Health Check: http://localhost:6969/api/health")
    print(f"📡 WebSocket: ws://localhost:6969")
    print("=" * 40)
    print("🎯 Ready for client connections!")
    
    socketio.run(app, host='0.0.0.0', port=6969, debug=True)