<template>
  <iframe
    :src="`https://web.project-graph.top/?frame=true&file=${dataBase64}`"
    frameborder="0"
    width="100%"
    height="400px"
    ref="el"
    @mouseenter="el.focus()"
  ></iframe>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";

const { data } = defineProps<{
  data: Record<string, any>;
}>();

const el = ref<HTMLIFrameElement>(null);

const dataBase64 = computed(() => {
  const binString = Array.from(new TextEncoder().encode(JSON.stringify(data)), (byte) =>
    String.fromCodePoint(byte),
  ).join("");
  return btoa(binString);
});
</script>
