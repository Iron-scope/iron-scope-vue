<script setup>
import { useId } from 'vue'

defineProps({
  label: { type: String, required: true },
  type: { type: String, default: 'text' },
  autocomplete: { type: String, default: undefined },
  placeholder: { type: String, default: undefined },
  required: { type: Boolean, default: false },
  hint: { type: String, default: '' },
  error: { type: String, default: '' },
})

const model = defineModel({ type: String, default: '' })
const id = useId()
</script>

<template>
  <div>
    <label :for="id" class="label block text-ink">
      {{ label }}
      <span v-if="!required" class="font-normal tracking-normal text-muted normal-case">
        (optional)
      </span>
    </label>

    <input
      :id="id"
      v-model="model"
      :type="type"
      :autocomplete="autocomplete"
      :placeholder="placeholder"
      :required="required"
      :aria-invalid="error ? 'true' : undefined"
      :aria-describedby="error ? `${id}-err` : hint ? `${id}-hint` : undefined"
      class="mt-2.5 block w-full rounded-card border-2 bg-surface px-4 py-3 text-[16px] text-ink transition-colors duration-150 outline-none placeholder:text-muted"
      :class="error ? 'border-rust' : 'border-rule focus:border-ink'"
    />

    <p v-if="error" :id="`${id}-err`" class="mt-2 text-[14px] font-medium text-rust">
      {{ error }}
    </p>
    <p v-else-if="hint" :id="`${id}-hint`" class="mt-2 text-[14px] text-muted">
      {{ hint }}
    </p>
  </div>
</template>
