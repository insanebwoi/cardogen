<template>
  <div class="step-indicator">
    <div class="si-track">
      <div class="si-progress" :style="{ width: `${(currentStep / (steps.length - 1)) * 100}%` }"></div>
    </div>
    <div class="si-steps">
      <div v-for="(s, i) in steps" :key="i" class="si-step" :class="{ active: i === currentStep, done: i < currentStep }">
        <div class="si-dot">
          <Icon v-if="i < currentStep" name="Check" size="18" />
          <Icon v-else :name="s.icon" size="18" />
        </div>
        <span class="si-label">{{ s.label }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({ steps: Array, currentStep: Number })
</script>

<style scoped>
.step-indicator { position: relative; }
.si-track { height: 3px; background: var(--gray-200); border-radius: 2px; position: absolute; top: 20px; left: 32px; right: 32px; z-index: 0; }
.si-progress { height: 100%; background: linear-gradient(90deg, var(--rose-500), var(--rose-400)); border-radius: 2px; transition: width 0.4s ease; }
.si-steps { display: flex; justify-content: space-between; position: relative; z-index: 1; }
.si-step { display: flex; flex-direction: column; align-items: center; gap: 8px; flex: 1; }
.si-dot {
  width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
  font-size: 1rem; background: white; border: 2px solid var(--gray-200); transition: all 0.3s;
}
.si-step.active .si-dot { border-color: var(--rose-500); background: var(--rose-500); color: white; box-shadow: 0 0 0 4px rgba(244,63,94,0.15); }
.si-step.done .si-dot { border-color: var(--rose-500); background: var(--rose-500); color: white; }
.si-label { font-size: 0.65rem; color: var(--gray-400); font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
.si-step.active .si-label { color: var(--rose-600); }
.si-step.done .si-label { color: var(--rose-500); }
@media (max-width: 600px) { .si-label { display: none; } }
</style>
