<script setup lang="ts">
const props = withDefaults(defineProps<{
  title?: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  color?: 'primary' | 'error' | 'neutral' | 'success' | 'warning'
  icon?: string
  loading?: boolean
}>(), {
  color: 'error',
  icon: 'i-lucide-alert-triangle'
})

const { t } = useI18n()

const resolvedTitle = computed(() => props.title ?? t('confirm.title'))
const resolvedDescription = computed(() => props.description ?? t('confirm.description'))
const resolvedConfirmLabel = computed(() => props.confirmLabel ?? t('common.confirm'))
const resolvedCancelLabel = computed(() => props.cancelLabel ?? t('common.cancel'))

const open = defineModel<boolean>('open', { default: false })
const emit = defineEmits(['confirm', 'close'])

function handleCancel() {
  open.value = false
  emit('close')
}

function handleConfirm() {
  emit('confirm')
}
</script>

<template>
  <Transition name="confirm-fade">
    <div
      v-if="open"
      class="confirm-overlay"
      @click.self="handleCancel"
    >
      <div class="confirm-card">
        <div class="confirm-body">
          <div class="confirm-icon-wrap" :class="color === 'error' ? 'confirm-icon-error' : 'confirm-icon-primary'">
            <UIcon :name="icon" class="size-5" />
          </div>
          <div class="confirm-text">
            <p class="confirm-title">{{ resolvedTitle }}</p>
            <p class="confirm-desc">{{ resolvedDescription }}</p>
          </div>
        </div>
        <div class="confirm-actions">
          <button type="button" class="confirm-btn-cancel" :disabled="loading" @click="handleCancel">
            {{ resolvedCancelLabel }}
          </button>
          <button type="button" class="confirm-btn-confirm" :class="color === 'error' ? 'confirm-btn-error' : 'confirm-btn-primary'" :disabled="loading" @click="handleConfirm">
            <span v-if="loading" class="confirm-spinner" />
            {{ resolvedConfirmLabel }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.confirm-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background-color: rgba(0, 0, 0, 0.55);
}

.confirm-card {
  width: 100%;
  max-width: 26rem;
  border-radius: 0.75rem;
  background-color: #ffffff;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.confirm-body {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.confirm-icon-wrap {
  flex-shrink: 0;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.confirm-icon-error {
  background-color: rgba(239, 68, 68, 0.12);
  color: #ef4444;
}

.confirm-icon-primary {
  background-color: rgba(59, 130, 246, 0.12);
  color: #3b82f6;
}

.confirm-text {
  flex: 1;
  min-width: 0;
}

.confirm-title {
  font-weight: 600;
  font-size: 0.9375rem;
  color: #111827;
  margin: 0 0 0.25rem 0;
}

.confirm-desc {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
  line-height: 1.5;
}

.confirm-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.confirm-btn-cancel,
.confirm-btn-confirm {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  outline: none;
  transition: opacity 0.15s;
}

.confirm-btn-cancel:disabled,
.confirm-btn-confirm:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.confirm-btn-cancel {
  background-color: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.confirm-btn-cancel:hover:not(:disabled) {
  background-color: #e5e7eb;
}

.confirm-btn-error {
  background-color: #ef4444;
  color: #ffffff;
}

.confirm-btn-error:hover:not(:disabled) {
  background-color: #dc2626;
}

.confirm-btn-primary {
  background-color: #3b82f6;
  color: #ffffff;
}

.confirm-btn-primary:hover:not(:disabled) {
  background-color: #2563eb;
}

.confirm-spinner {
  display: inline-block;
  width: 0.875rem;
  height: 0.875rem;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.confirm-fade-enter-active,
.confirm-fade-leave-active {
  transition: opacity 0.2s ease;
}

.confirm-fade-enter-from,
.confirm-fade-leave-to {
  opacity: 0;
}
</style>
