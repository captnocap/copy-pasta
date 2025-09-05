import { Session, ready } from '@session.js/client'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import Database from 'bun:sqlite'

// Session configuration
const MNEMONIC = 'envy ravine buffet directed karate leisure seismic yawning rotate depth pedantic optical directed'
const BOT_DISPLAY_NAME = 'WKApp Bot'

// You'll need to provide the group chat Session ID after creating the group
const TEAM_CHAT_ID = process.env.TEAM_CHAT_ID || '' // Will be set later

class WKAppSessionBot {
  private session: Session | null = null
  private db: Database

  constructor() {
    // Connect to the same SQLite database as Flask API
    const dbPath = join(process.cwd(), '..', 'data', 'orders.db')
    this.db = new Database(dbPath)
  }

  async initialize() {
    console.log('🔄 Initializing Session.js...')
    await ready
    
    this.session = new Session()
    this.session.setMnemonic(MNEMONIC, BOT_DISPLAY_NAME)
    
    console.log('✅ Session.js ready!')
    console.log('🆔 Session ID:', this.session.getSessionId())
    
    // Test if we can send messages
    if (TEAM_CHAT_ID) {
      await this.sendTestMessage()
    } else {
      console.log('⚠️  TEAM_CHAT_ID not set. Set it in environment or update the code.')
    }
  }

  async sendTestMessage() {
    if (!this.session || !TEAM_CHAT_ID) return

    try {
      const response = await this.session.sendMessage({
        to: TEAM_CHAT_ID,
        text: '🤖 WKApp Bot is now online and ready to send daily summaries!'
      })
      console.log('✅ Test message sent:', response.messageHash)
    } catch (error) {
      console.error('❌ Failed to send test message:', error)
    }
  }

  async generateDailySummary(): Promise<string> {
    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD
    
    try {
      // Get today's orders
      const ordersQuery = this.db.prepare(`
        SELECT COUNT(*) as total, 
               SUM(CASE WHEN status = 'processed' THEN 1 ELSE 0 END) as successful,
               SUM(CASE WHEN status != 'processed' THEN 1 ELSE 0 END) as failed
        FROM orders 
        WHERE date(processed_at) = date('now')
      `)
      
      const orderStats = ordersQuery.get() as any
      
      // Get failed orders details
      const failedOrdersQuery = this.db.prepare(`
        SELECT id, status
        FROM orders 
        WHERE date(processed_at) = date('now') AND status != 'processed'
        ORDER BY processed_at DESC
        LIMIT 5
      `)
      
      const failedOrders = failedOrdersQuery.all() as any[]
      
      // Get recent activity
      const activityQuery = this.db.prepare(`
        SELECT action, timestamp, status_code
        FROM action_log 
        WHERE date(timestamp) = date('now')
        ORDER BY timestamp DESC
        LIMIT 10
      `)
      
      const recentActivity = activityQuery.all() as any[]
      
      // Build summary message
      let summary = `📊 **Daily Order Summary - ${new Date().toLocaleDateString()}**\n\n`
      
      // Order statistics
      summary += `**📦 Orders Processed:**\n`
      summary += `✅ Successful: ${orderStats.successful || 0}\n`
      summary += `❌ Failed: ${orderStats.failed || 0}\n`
      summary += `📊 Total: ${orderStats.total || 0}\n\n`
      
      // Failed orders details
      if (failedOrders.length > 0) {
        summary += `**⚠️ Failed Orders (Last 5):**\n`
        failedOrders.forEach(order => {
          summary += `• ${order.id} - Status: ${order.status}\n`
        })
        summary += `\n`
      } else {
        summary += `🎉 **All orders processed successfully today!**\n\n`
      }
      
      // System activity
      summary += `**🔧 System Activity:**\n`
      const errorCount = recentActivity.filter(a => a.status_code >= 400).length
      const successCount = recentActivity.filter(a => a.status_code < 400).length
      
      summary += `✅ Successful operations: ${successCount}\n`
      summary += `❌ Errors: ${errorCount}\n\n`
      
      // Footer
      summary += `🕐 Generated at ${new Date().toLocaleTimeString()}\n`
      summary += `🤖 WKApp Processing System`
      
      return summary
      
    } catch (error) {
      console.error('Error generating daily summary:', error)
      return `❌ **Error generating daily summary**\n\nPlease check the system logs.\n\n🕐 ${new Date().toLocaleTimeString()}`
    }
  }

  async sendDailySummary(chatId?: string): Promise<boolean> {
    if (!this.session) {
      console.error('Session not initialized')
      return false
    }

    const targetChatId = chatId || TEAM_CHAT_ID
    if (!targetChatId) {
      console.error('No chat ID provided')
      return false
    }

    try {
      const summary = await this.generateDailySummary()
      
      const response = await this.session.sendMessage({
        to: targetChatId,
        text: summary
      })
      
      console.log('✅ Daily summary sent:', response.messageHash)
      
      // Log the action
      const logQuery = this.db.prepare(`
        INSERT INTO action_log (action, status_code, message)
        VALUES (?, ?, ?)
      `)
      
      logQuery.run(
        'Daily summary sent via Session',
        200,
        `Sent to chat: ${targetChatId.substring(0, 8)}...`
      )
      
      return true
      
    } catch (error) {
      console.error('❌ Failed to send daily summary:', error)
      
      // Log the error
      const logQuery = this.db.prepare(`
        INSERT INTO action_log (action, status_code, message)
        VALUES (?, ?, ?)
      `)
      
      logQuery.run(
        'Daily summary send failed',
        500,
        `Error: ${error}`
      )
      
      return false
    }
  }

  async sendOrderAlert(orderData: any) {
    if (!this.session || !TEAM_CHAT_ID) return

    try {
      let alertMessage = `🚨 **Order Processing Alert**\n\n`
      
      if (orderData.type === 'error') {
        alertMessage += `❌ **Failed to process order:** ${orderData.orderId}\n`
        alertMessage += `⚠️ **Error:** ${orderData.error}\n`
        alertMessage += `🕐 **Time:** ${new Date().toLocaleTimeString()}\n\n`
        alertMessage += `Please check the system immediately.`
      } else if (orderData.type === 'success') {
        alertMessage += `✅ **Order processed successfully:** ${orderData.orderId}\n`
        alertMessage += `👤 **Customer:** ${orderData.customer || 'N/A'}\n`
        alertMessage += `🕐 **Time:** ${new Date().toLocaleTimeString()}`
      }

      await this.session.sendMessage({
        to: TEAM_CHAT_ID,
        text: alertMessage
      })
      
      console.log('✅ Order alert sent:', orderData.orderId)
      
    } catch (error) {
      console.error('❌ Failed to send order alert:', error)
    }
  }
}

// Create bot instance
const bot = new WKAppSessionBot()

// Initialize bot
bot.initialize().catch(console.error)

// Export for use by Flask API
export { bot as sessionBot }

// CLI commands
const command = process.argv[2]

if (command === 'summary') {
  bot.initialize().then(async () => {
    console.log('📤 Sending daily summary...')
    const success = await bot.sendDailySummary()
    if (success) {
      console.log('✅ Daily summary sent successfully!')
    } else {
      console.error('❌ Failed to send daily summary')
    }
    process.exit(success ? 0 : 1)
  })
} else if (command === 'test') {
  bot.initialize().then(() => {
    console.log('🤖 Bot initialized and test message sent (if TEAM_CHAT_ID is set)')
  })
}