<script setup lang="ts">
import type { Container } from '~/types'
import { formatDisplayDate } from '~/utils/date-format'

defineProps<{
  container: Container
}>()
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    <div>
      <p class="ds-field-label">ISO Type</p>
      <p class="ds-field-value">{{ container.isoType }}</p>
    </div>
    <div>
      <p class="ds-field-label">Size</p>
      <p class="ds-field-value">{{ container.containerSize }} ft</p>
    </div>
    <div>
      <p class="ds-field-label">Category</p>
      <p class="ds-field-value">{{ container.containerCategory }}</p>
    </div>
    <div>
      <p class="ds-field-label">Owner</p>
      <p class="ds-field-value">{{ container.owner }}</p>
    </div>
    <div>
      <p class="ds-field-label">Manufacturer</p>
      <p class="ds-field-value">{{ container.manufacturer || '—' }}</p>
    </div>
    <div>
      <p class="ds-field-label">Year Built</p>
      <p class="ds-field-value">{{ container.yearBuilt || '—' }}</p>
    </div>
    <div>
      <p class="ds-field-label">Tare Weight (KG)</p>
      <p class="ds-field-value font-mono">{{ container.tareWeight ?? '—' }}</p>
    </div>
    <div>
      <p class="ds-field-label">Max Payload (KG)</p>
      <p class="ds-field-value font-mono">{{ container.maxPayload ?? '—' }}</p>
    </div>
    <div>
      <p class="ds-field-label">Internal Volume (M³)</p>
      <p class="ds-field-value font-mono">{{ container.internalVolume ?? '—' }}</p>
    </div>
    <div>
      <p class="ds-field-label">Lease Provider</p>
      <p class="ds-field-value">{{ container.leaseProvider || '—' }}</p>
    </div>
    <div>
      <p class="ds-field-label">Registry Location</p>
      <p class="ds-field-value">{{ container.registryLocation || '—' }}</p>
    </div>
    <div>
      <p class="ds-field-label">CSC Expiry Date</p>
      <p class="ds-field-value font-mono">{{ container.cscExpiryDate ? formatDisplayDate(container.cscExpiryDate) : '—' }}</p>
    </div>
    <div>
      <p class="ds-field-label">Registration Date</p>
      <p class="ds-field-value font-mono">{{ formatDisplayDate(container.registrationDate) }}</p>
    </div>
    <div>
      <p class="ds-field-label">Registered By</p>
      <p class="ds-field-value">{{ container.createdBy }}</p>
    </div>
    <div>
      <p class="ds-field-label">QR Code</p>
      <p class="ds-field-value font-mono text-on-surface-variant">{{ container.qrCode || '—' }}</p>
    </div>
    <div>
      <p class="ds-field-label">Last Updated</p>
      <p class="ds-field-value font-mono">{{ formatDisplayDate(container.updatedDate) }}</p>
    </div>
    <div v-if="container.updatedBy">
      <p class="ds-field-label">Updated By</p>
      <p class="ds-field-value">{{ container.updatedBy }}</p>
    </div>
  </div>
</template>
