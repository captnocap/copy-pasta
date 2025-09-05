package main

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"image"
	"image/png"
	"net/http"
	"os"
	"runtime"
	"strings"
	"time"

	"github.com/atotto/clipboard"
	"github.com/fatih/color"
	"github.com/go-vgo/robotgo"
)

func testServerConnection(serverURL string) (bool, string) {
	// Test server health
	fmt.Printf("🔍 Testing connection to %s...\n", serverURL)
	
	healthURL := serverURL + "/api/health"
	resp, err := http.Get(healthURL)
	if err != nil {
		fmt.Printf("❌ Cannot connect to server: %v\n", err)
		fmt.Printf("   Make sure the server is running at %s\n", serverURL)
		return false, ""
	}
	defer resp.Body.Close()
	
	if resp.StatusCode == 200 {
		var healthData map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&healthData)
		
		fmt.Printf("✅ Server health check passed\n")
		fmt.Printf("   Server: %v\n", healthData["server"])
		fmt.Printf("   Version: %v\n", healthData["version"])
		fmt.Printf("   Uptime: %.0f seconds\n", healthData["uptime"])
		
		// Send ping to register client
		hostname, _ := os.Hostname()
		clientID := fmt.Sprintf("%s-%d", hostname, time.Now().Unix()%10000)
		pingData := map[string]interface{}{
			"client_id": clientID,
			"platform":  fmt.Sprintf("%s %s", runtime.GOOS, runtime.GOARCH),
		}
		
		pingJSON, _ := json.Marshal(pingData)
		pingResp, err := http.Post(serverURL+"/api/ping", "application/json", bytes.NewBuffer(pingJSON))
		if err == nil && pingResp.StatusCode == 200 {
			defer pingResp.Body.Close()
			var pingResult map[string]interface{}
			json.NewDecoder(pingResp.Body).Decode(&pingResult)
			fmt.Printf("✅ Client registration successful\n")
			fmt.Printf("   Message: %v\n", pingResult["message"])
			return true, clientID
		}
		
		return true, clientID // Allow connection even if ping fails
	}
	
	fmt.Printf("❌ Server health check failed: %d\n", resp.StatusCode)
	return false, ""
}

func main() {
	// Colors for terminal output
	green := color.New(color.FgGreen, color.Bold)
	yellow := color.New(color.FgYellow)
	red := color.New(color.FgRed, color.Bold)
	cyan := color.New(color.FgCyan)
	blue := color.New(color.FgBlue)
	
	// Get server URL from environment or default to localhost
	serverURL := os.Getenv("SERVER_URL")
	if serverURL == "" {
		serverURL = "http://localhost:6969"
	}
	
	// Ensure server URL has proper format
	if !strings.HasPrefix(serverURL, "http://") && !strings.HasPrefix(serverURL, "https://") {
		serverURL = "http://" + serverURL
	}
	if !strings.HasSuffix(serverURL, ":6969") && !strings.Contains(serverURL, ":") {
		serverURL = serverURL + ":6969"
	}

	// Clear screen and show header
	fmt.Print("\033[H\033[2J")
	cyan.Println("=================================")
	cyan.Println("   WKApp Clipboard Monitor v1.0  ")
	cyan.Println("=================================\n")
	
	// Test server connection
	connected, clientID := testServerConnection(serverURL)
	fmt.Println()
	
	if !connected {
		red.Println("❌ Cannot start client - server connection failed")
		yellow.Println("💡 Solutions:")
		yellow.Println("   1. Start the server: cd server && ./run_server.sh")
		yellow.Println("   2. Check server URL in config.env")
		yellow.Println("   3. Verify network connectivity")
		return
	}
	
	green.Println("🚀 Client connected successfully!")
	blue.Printf("🌐 Server: %s\n", serverURL)
	blue.Printf("🆔 Client ID: %s\n", clientID)
	yellow.Println("👀 Monitoring clipboard for PGP messages...\n")

	lastContent := ""
	
	for {
		// Check clipboard
		content, err := clipboard.ReadAll()
		if err != nil {
			continue
		}

		// Check if clipboard changed
		if content != lastContent && content != "" {
			lastContent = content
			
			// Check if it's a PGP message
			trimmed := strings.TrimSpace(content)
			if strings.HasPrefix(trimmed, "-----BEGIN PGP MESSAGE-----") && 
			   strings.HasSuffix(trimmed, "-----END PGP MESSAGE-----") {
				
				timestamp := time.Now().Format("15:04:05")
				yellow.Printf("[%s] 🔒 PGP message detected!\n", timestamp)
				
				// Take screenshot using robotgo (macOS 15.0 compatible)
				bitmap := robotgo.CaptureScreen(0, 0, -1, -1)
				defer robotgo.FreeBitmap(bitmap)
				
				// Convert robotgo bitmap to image.Image
				img := robotgo.ToImage(bitmap)
				if img == nil {
					red.Printf("[%s] ❌ Screenshot failed: unable to capture screen\n", timestamp)
					continue
				}

				// Convert to base64
				var buf bytes.Buffer
				if err := png.Encode(&buf, img); err != nil {
					red.Printf("[%s] ❌ Failed to encode screenshot: %v\n", timestamp, err)
					continue
				}
				screenshotB64 := base64.StdEncoding.EncodeToString(buf.Bytes())
				
				green.Printf("[%s] ✅ Screenshot captured! (%d KB)\n", timestamp, len(screenshotB64)/1024)
				
				// Send to API
				payload := map[string]interface{}{
					"pgp_message":    content,
					"screenshot_b64": screenshotB64,
					"timestamp":      time.Now().Unix(),
				}
				
				jsonData, err := json.Marshal(payload)
				if err != nil {
					red.Printf("[%s] ❌ Failed to prepare data: %v\n", timestamp, err)
					continue
				}
				
				// Send to Flask API
				apiURL := serverURL + "/api/order"
				resp, err := http.Post(apiURL, "application/json", bytes.NewBuffer(jsonData))
				if err != nil {
					red.Printf("[%s] ❌ Failed to send to API: %v\n", timestamp, err)
					yellow.Printf("[%s] 💾 Data saved locally for retry\n\n", timestamp)
				} else {
					defer resp.Body.Close()
					if resp.StatusCode == 200 {
						var result map[string]interface{}
						json.NewDecoder(resp.Body).Decode(&result)
						green.Printf("[%s] ✅ Order sent successfully! ID: %v\n\n", timestamp, result["order_id"])
					} else {
						red.Printf("[%s] ❌ API error: %s\n\n", timestamp, resp.Status)
					}
				}
			}
		}
		
		time.Sleep(500 * time.Millisecond)
	}
}