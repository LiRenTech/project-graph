<script setup lang="ts">
import {
  NolebaseEnhancedReadabilitiesMenu,
  NolebaseEnhancedReadabilitiesScreenMenu,
} from "@nolebase/vitepress-plugin-enhanced-readabilities";
import { NolebaseHighlightTargetedHeading } from "@nolebase/vitepress-plugin-highlight-targeted-heading";
import { useData } from "vitepress";
import DefaultTheme from "vitepress/theme";
import { nextTick, onMounted, provide } from "vue";

const { isDark, localeIndex, site } = useData();

const enableTransitions = () =>
  "startViewTransition" in document && window.matchMedia("(prefers-reduced-motion: no-preference)").matches;

provide("toggle-appearance", async ({ clientX: x, clientY: y }: MouseEvent) => {
  if (!enableTransitions()) {
    isDark.value = !isDark.value;
    return;
  }

  const clipPath = [
    `circle(0px at ${x}px ${y}px)`,
    `circle(${Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))}px at ${x}px ${y}px)`,
  ];

  await document.startViewTransition(async () => {
    isDark.value = !isDark.value;
    await nextTick();
  }).ready;

  document.documentElement.animate(
    { clipPath: isDark.value ? clipPath.reverse() : clipPath },
    {
      duration: 1000,
      easing: "ease-out",
      pseudoElement: `::view-transition-${isDark.value ? "old" : "new"}(root)`,
    },
  );
});

const locales = Object.keys(site.value.locales);
const path = window.location.pathname;
const browserLanguage = navigator.language.toLowerCase();

onMounted(() => {
  let localeDefinedInPath = false;
  for (const locale of locales) {
    if (path.startsWith(`/${locale}`)) {
      localeDefinedInPath = true;
      break;
    }
  }
  console.log(localeDefinedInPath, browserLanguage);
  if (!localeDefinedInPath) {
    if (browserLanguage.startsWith("en")) {
      addLocalePrefixToPath("en");
    }
    if (browserLanguage.startsWith("zh")) {
      addLocalePrefixToPath("zh_CN");
    }
  }
});

function addLocalePrefixToPath(locale: string) {
  const newPath = `/${locale}/${path}`;
  const el = document.createElement("a");
  el.href = newPath;
  el.classList.add("visually-hidden");
  document.body.appendChild(el);
  el.click();
  el.blur();
  el.remove();
}
</script>

<template>
  <DefaultTheme.Layout>
    <template #nav-bar-content-after>
      <NolebaseEnhancedReadabilitiesMenu />
    </template>
    <template #nav-screen-content-after>
      <NolebaseEnhancedReadabilitiesScreenMenu />
    </template>
    <template #layout-top>
      <NolebaseHighlightTargetedHeading />
    </template>
    <template #doc-before>
      <div class="warning custom-block" v-if="localeIndex !== 'zh_CN'">
        <p class="custom-block-title">This document may be outdated!</p>
        <p>We don’t have enough time and energy to translate all the documents.</p>
      </div>
    </template>
  </DefaultTheme.Layout>
</template>

<style lang="scss">
::view-transition-old(root),
::view-transition-new(root) {
  animation: none;
  mix-blend-mode: normal;
}

::view-transition-old(root),
.dark::view-transition-new(root) {
  z-index: 1;
}

::view-transition-new(root),
.dark::view-transition-old(root) {
  z-index: 9999;
}

.VPSwitchAppearance {
  width: 22px !important;
}

.VPSwitchAppearance .check {
  transform: none !important;
}
</style>
