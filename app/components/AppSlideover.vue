<script setup lang="ts">
const props = withDefaults(defineProps<{
  title?: string
  description?: string
}>(), {})

const open = defineModel<boolean>('open', { default: false })
const emit = defineEmits(['close'])

function handleClose() {
  open.value = false
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <Transition name="app-slideover-fade">
      <div
        v-if="open"
        class="app-slideover-overlay"
        @click.self="handleClose"
      >
        <Transition name="app-slideover-slide">
          <aside
            v-if="open"
            class="app-slideover-panel"
            role="dialog"
            aria-modal="true"
            :aria-label="title"
            @click.stop
          >
            <div class="app-slideover-header">
              <div class="min-w-0 flex-1">
                <p v-if="title" class="app-slideover-title">
                  {{ title }}
                </p>
                <p v-if="description" class="app-slideover-description">
                  {{ description }}
                </p>
              </div>
              <button
                type="button"
                class="app-slideover-close"
                aria-label="Close"
                @click="handleClose"
              >
                <UIcon name="i-lucide-x" class="size-5" />
              </button>
            </div>

            <div class="app-slideover-body">
              <slot />
            </div>
          </aside>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.app-slideover-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background-color: rgba(0, 0, 0, 0.55);
}

.app-slideover-panel {
  position: fixed;
  top: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  width: min(100vw, 28rem);
  height: 100dvh;
  background-color: #ffffff;
  box-shadow: -12px 0 40px rgba(0, 0, 0, 0.18);
}

.app-slideover-header {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #e5e7eb;
}

.app-slideover-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
}

.app-slideover-description {
  margin: 0.25rem 0 0;
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.5;
}

.app-slideover-close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border: none;
  border-radius: 0.375rem;
  background: transparent;
  color: #6b7280;
  cursor: pointer;
}

.app-slideover-close:hover {
  background-color: #f3f4f6;
  color: #111827;
}

.app-slideover-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.25rem;
}

.app-slideover-fade-enter-active,
.app-slideover-fade-leave-active {
  transition: opacity 0.2s ease;
}

.app-slideover-fade-enter-from,
.app-slideover-fade-leave-to {
  opacity: 0;
}

.app-slideover-slide-enter-active,
.app-slideover-slide-leave-active {
  transition: transform 0.25s ease;
}

.app-slideover-slide-enter-from,
.app-slideover-slide-leave-to {
  transform: translateX(100%);
}
</style>
