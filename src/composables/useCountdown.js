import { ref, onMounted, onUnmounted, computed } from 'vue'

export function useCountdown(targetDate, targetTime) {
  const days = ref(0)
  const hours = ref(0)
  const minutes = ref(0)
  const seconds = ref(0)
  const isExpired = ref(false)
  let interval = null

  const target = computed(() => new Date(`${targetDate}T${targetTime}`))

  function update() {
    const now = new Date().getTime()
    const distance = target.value.getTime() - now
    if (distance <= 0) {
      isExpired.value = true
      days.value = hours.value = minutes.value = seconds.value = 0
      clearInterval(interval)
      return
    }
    days.value = Math.floor(distance / (1000 * 60 * 60 * 24))
    hours.value = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    minutes.value = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
    seconds.value = Math.floor((distance % (1000 * 60)) / 1000)
  }

  onMounted(() => { update(); interval = setInterval(update, 1000) })
  onUnmounted(() => { if (interval) clearInterval(interval) })

  return { days, hours, minutes, seconds, isExpired }
}
