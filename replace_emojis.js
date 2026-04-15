import fs from 'fs'
import path from 'path'

const dir = './src'

const map = {
  '💍': '<Icon name="Heart" size="18" />',
  '📊': '<Icon name="LayoutDashboard" size="18" />',
  '💌': '<Icon name="Mail" size="18" />',
  '📋': '<Icon name="ClipboardList" size="18" />',
  '🎨': '<Icon name="Palette" size="18" />',
  '👥': '<Icon name="Users" size="18" />',
  '🛡️': '<Icon name="Shield" size="16" />',
  '👤': '<Icon name="User" size="16" />',
  '🚪': '<Icon name="LogOut" size="16" />',
  '👁️': '<Icon name="Eye" size="16" />',
  '👁': '<Icon name="Eye" size="16" />',
  '🔒': '<Icon name="Lock" size="16" />',
  '🔓': '<Icon name="Unlock" size="16" />',
  '🗑️': '<Icon name="Trash2" size="16" />',
  '✅': '<Icon name="CheckCircle2" size="16" />',
  '❌': '<Icon name="XCircle" size="16" />',
  '📭': '<Icon name="Mailbox" size="32" />',
  '📅': '<Icon name="Calendar" size="16" />',
  '⏰': '<Icon name="Clock" size="16" />',
  '🕐': '<Icon name="Clock" size="16" />',
  '📍': '<Icon name="MapPin" size="16" />',
  '👑': '<Icon name="Crown" size="24" />',
  '🌸': '<Icon name="Sparkles" size="18" />',
  '✨': '<Icon name="Sparkles" size="16" />',
  '✦': '<Icon name="Sparkles" size="16" />',
  '🕌': '<Icon name="MoonStar" size="16" />',
  '💜': '<Icon name="Heart" size="16" />',
  '♥': '<Icon name="Heart" size="16" />',
  '♡': '<Icon name="Heart" size="20" />',
  '✏️': '<Icon name="Pencil" size="16" />',
  '✏': '<Icon name="Pencil" size="16" />',
  '💾': '<Icon name="Save" size="16" />',
  '💔': '<Icon name="HeartCrack" size="32" />',
  '😢': '<Icon name="Frown" size="32" />',
  '🔍': '<Icon name="Search" size="16" />',
  '👋': '<Icon name="Hand" size="24" />',
  '🎉': '<Icon name="PartyPopper" size="18" />',
  '📱': '<Icon name="Smartphone" size="18" />',
  '🔗': '<Icon name="Link" size="16" />',
  '❋': '<Icon name="Stars" size="16" />',
}

function processDir(d) {
  const files = fs.readdirSync(d)
  for (const f of files) {
    const full = path.join(d, f)
    if (fs.statSync(full).isDirectory()) {
      processDir(full)
    } else if (full.endsWith('.vue')) {
      let content = fs.readFileSync(full, 'utf8')
      let changed = false
      for (const [emoji, replacement] of Object.entries(map)) {
        if (content.includes(emoji)) {
          // Special handlers:
          // In options array { icon: '📱' } --> we want to just pass the string 'Smartphone'
          // We will do a generic replace. If it's single quoted we might break syntax
          // Let's replace '📱' -> 'Smartphone' instead of <Icon...> if it's inside quotes.
          // For simplicity we will do a global replace for the emoji character
          const regex = new RegExp(emoji, 'g')
          content = content.replace(regex, (match, offset, string) => {
            // Check if it's inside quotes '{ icon: '...' }'
            const before = string.slice(Math.max(0, offset - 10), offset)
            if (before.includes('icon: \'') || before.includes('icon: \"') || before.includes("icon: '")) {
              const el = replacement.match(/name="([^"]+)"/)[1]
              return el // just return the icon name
            }
            return replacement
          })
          changed = true
        }
      }
      if (changed) {
        fs.writeFileSync(full, content)
        console.log(`Updated ${full}`)
      }
    }
  }
}

processDir(dir)
