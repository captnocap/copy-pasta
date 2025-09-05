# WKApp Configuration
import os

# API Configuration
NANO_GPT_API_KEY = os.getenv('NANO_GPT_API_KEY', '')
DEFAULT_MODEL = "gemini-1.5-flash"

# Fallback Models (454 models as mentioned in architecture)
FALLBACK_MODELS = [
    "gemini-1.5-flash",
    "gpt-4o-mini", 
    "claude-3-haiku-20240307",
    "llama-3.1-8b-instant",
    "mixtral-8x7b-32768",
    # Add your 450 other fallback models here...
]

# Return Addresses (3 warehouse configs)
RETURN_ADDRESSES = {
    "warehouse1": {
        "name": "WKApp Fulfillment Center 1",
        "address1": "123 Main St",
        "address2": "Suite 100",
        "city": "Portland",
        "state": "OR",
        "zip": "97201"
    },
    "warehouse2": {
        "name": "WKApp Fulfillment Center 2", 
        "address1": "456 Oak Ave",
        "address2": "",
        "city": "Seattle",
        "state": "WA", 
        "zip": "98101"
    },
    "warehouse3": {
        "name": "WKApp Fulfillment Center 3",
        "address1": "789 Pine St",
        "address2": "Floor 2",
        "city": "San Francisco",
        "state": "CA",
        "zip": "94102"
    }
}

# Service Specifications (Carrier/service mappings)
SERVICE_SPECS = {
    "usps_priority": {
        "carrier": "USPS",
        "service": "Priority",
        "max_dimensions": "",
        "max_weight": "",
        "package_type": "flatrateenvelope"
    },
    "usps_express": {
        "carrier": "USPS",
        "service": "Express",
        "max_dimensions": "", 
        "max_weight": "",
        "package_type": "flatrateenvelope"
    }
}

# CSV Headers for Label Provider (25 fields)
CSV_HEADERS = [
    "Name",
    "Street Address1", 
    "Street Address2",
    "City",
    "State", 
    "Zip",
    "Country",
    "Phone",
    "Email",
    "Company",
    "Order ID",
    "Status", 
    "Enhanced Data",
    "Weight",
    "Dimensions",
    "Service Type",
    "Carrier",
    "Return Name",
    "Return Address1",
    "Return Address2", 
    "Return City",
    "Return State",
    "Return Zip",
    "Special Instructions",
    "Insurance Value"
]

# Session.js Configuration
SESSION_BOT_CONFIG = {
    "mnemonic": "envy ravine buffet directed karate leisure seismic yawning rotate depth pedantic optical directed",
    "bot_name": "WKApp Bot",
    "team_chat_id": os.getenv('TEAM_CHAT_ID', '')
}

# Security & Privacy
ENABLE_TEE = os.getenv('ENABLE_TEE', 'false').lower() == 'true'
LOG_SENSITIVE_DATA = False
DASHBOARD_SHOW_SENSITIVE = False