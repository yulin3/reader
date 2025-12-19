<template>
  <div
    :class="[
      'rounded-lg border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700',
      'shadow-sm overflow-hidden',
      $attrs.class
    ]"
  >
    <slot />
  </div>
</template>
