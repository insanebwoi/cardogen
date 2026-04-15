<template>
  <div class="share-buttons" :class="`share-${theme}`">
    <p class="share-label">Share this invitation</p>
    <div class="share-row">
      <button @click="shareWhatsApp" class="share-btn whatsapp"><Icon name="Smartphone" size="18" /> WhatsApp</button>
      <button @click="copyLink" class="share-btn copy">
        <Icon :name="copied ? 'CheckCircle2' : 'Link'" size="16" />
        {{ copied ? 'Copied!' : 'Copy Link' }}
      </button>
      <button v-if="canShare" @click="nativeShare" class="share-btn native">📤 Share</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
const props = defineProps({ shortCode: String, brideName: String, groomName: String, theme: { type: String, default: 'gold' } })
const copied = ref(false)
const baseUrl = window.location.origin
const link = computed(() => `${baseUrl}/w/${props.shortCode}`)
const message = computed(() => `💍 You're invited to the wedding of ${props.brideName} & ${props.groomName}! 🎊\n\nView invitation & RSVP:\n${link.value}`)
const canShare = computed(() => !!navigator.share)

function shareWhatsApp() { window.open(`https://wa.me/?text=${encodeURIComponent(message.value)}`, '_blank') }
async function copyLink() {
  try { await navigator.clipboard.writeText(link.value) } catch {
    const i = document.createElement('input'); i.value = link.value; document.body.appendChild(i); i.select(); document.execCommand('copy'); document.body.removeChild(i)
  }
  copied.value = true; setTimeout(() => copied.value = false, 2000)
}
async function nativeShare() { try { await navigator.share({ title: `${props.brideName} & ${props.groomName} Wedding`, text: message.value, url: link.value }) } catch {} }
</script>

<style scoped>
.share-buttons { text-align: center; margin: 24px 0; padding: 20px 0; }
.share-label { font-size: 0.8rem; margin-bottom: 14px; opacity: 0.6; }
.share-row { display: flex; justify-content: center; gap: 10px; flex-wrap: wrap; }
.share-btn {
  padding: 10px 20px; border-radius: 100px; font-size: 0.8rem; font-weight: 600;
  cursor: pointer; transition: all 0.2s; border: none;
}
.share-btn:hover { transform: scale(1.05); }

.share-gold .share-label { color: rgba(245,230,200,0.5); }
.share-gold .whatsapp { background: #25d366; color: white; }
.share-gold .copy { background: rgba(212,175,55,0.15); color: #d4af37; }
.share-gold .native { background: rgba(255,255,255,0.1); color: #f5e6c8; }

.share-pink .share-label { color: #be185d; }
.share-pink .whatsapp { background: #25d366; color: white; }
.share-pink .copy { background: #fdf2f8; color: #be185d; }
.share-pink .native { background: #fce7f3; color: #9d174d; }

.share-minimal .share-label { color: #78716c; }
.share-minimal .whatsapp { background: #25d366; color: white; }
.share-minimal .copy { background: #f5f5f4; color: #44403c; }
.share-minimal .native { background: #e7e5e4; color: #44403c; }

.share-green .share-label { color: #6ee7b7; }
.share-green .whatsapp { background: #25d366; color: white; }
.share-green .copy { background: rgba(110,231,183,0.1); color: #6ee7b7; }
.share-green .native { background: rgba(255,255,255,0.08); color: #a7f3d0; }

.share-purple .share-label { color: rgba(255,255,255,0.4); }
.share-purple .whatsapp { background: #25d366; color: white; }
.share-purple .copy { background: rgba(168,85,247,0.15); color: #c084fc; }
.share-purple .native { background: rgba(255,255,255,0.08); color: white; }
</style>
