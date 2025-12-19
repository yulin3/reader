<template>
  <button
    :class="[
      'px-4 py-2 rounded-md font-medium transition-colors',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      variantClasses,
      sizeClasses
    ]"
    @click="$emit('click', $event)"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type Variant = 'primary' | 'secondary' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

const props = withDefaults(defineProps<{
  variant?: Variant
  size?: Size
}>(), {
  variant: 'primary',
  size: 'md'
})

defineEmits<{
  click: [event: MouseEvent]
}>()

const variantClasses = computed(() => ({
  primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
  secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600 focus:ring-gray-500',
  ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 focus:ring-gray-500'
}[props.variant]))

const sizeClasses = computed(() => ({
  sm: 'px-2 py-1 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg'
}[props.size]))
</script>