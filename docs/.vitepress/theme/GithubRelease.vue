<template>
  <span v-if="release">
    <p>{{ release.name }}</p>
    <div class="container">
      <a
        v-for="asset of release.assets"
        :href="'https://proxy.zty012.de/' + asset.browser_download_url"
        :download="asset.name"
      >
        <button
          class="VPButton"
          :class="os === 'windows' && !isArm ? 'brand' : 'alt'"
          v-if="asset.name.endsWith('.exe')"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
          >
            <path
              fill="currentColor"
              d="M3 12V6.75l6-1.32v6.48zm17-9v8.75l-10 .15V5.21zM3 13l6 .09v6.81l-6-1.15zm17 .25V22l-10-1.91V13.1z"
            />
          </svg>
          Windows
        </button>
        <button
          class="VPButton"
          :class="os === 'macos' && isArm ? 'brand' : 'alt'"
          v-else-if="asset.name.endsWith('aarch64.dmg')"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
          >
            <path
              fill="currentColor"
              d="M17.05 20.28c-.98.95-2.05.8-3.08.35c-1.09-.46-2.09-.48-3.24 0c-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8c1.18-.24 2.31-.93 3.57-.84c1.51.12 2.65.72 3.4 1.8c-3.12 1.87-2.38 5.98.48 7.13c-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25c.29 2.58-2.34 4.5-3.74 4.25"
            />
          </svg>
          Mac (M1)
        </button>
        <button
          class="VPButton"
          :class="os === 'macos' && !isArm ? 'brand' : 'alt'"
          v-else-if="asset.name.endsWith('x64.dmg')"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
          >
            <path
              fill="currentColor"
              d="M17.05 20.28c-.98.95-2.05.8-3.08.35c-1.09-.46-2.09-.48-3.24 0c-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8c1.18-.24 2.31-.93 3.57-.84c1.51.12 2.65.72 3.4 1.8c-3.12 1.87-2.38 5.98.48 7.13c-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25c.29 2.58-2.34 4.5-3.74 4.25"
            />
          </svg>
          Mac (Intel)
        </button>
        <button
          class="VPButton"
          :class="os === 'linux' && !isArm ? 'brand' : 'alt'"
          v-else-if="asset.name.endsWith('.deb')"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
          >
            <path
              fill="currentColor"
              d="M19.7 17.6c-.1-.2-.2-.4-.2-.6c0-.4-.2-.7-.5-1c-.1-.1-.3-.2-.4-.2c.6-1.8-.3-3.6-1.3-4.9c-.8-1.2-2-2.1-1.9-3.7c0-1.9.2-5.4-3.3-5.1c-3.6.2-2.6 3.9-2.7 5.2c0 1.1-.5 2.2-1.3 3.1c-.2.2-.4.5-.5.7c-1 1.2-1.5 2.8-1.5 4.3c-.2.2-.4.4-.5.6c-.1.1-.2.2-.2.3c-.1.1-.3.2-.5.3c-.4.1-.7.3-.9.7c-.1.3-.2.7-.1 1.1c.1.2.1.4 0 .7c-.2.4-.2.9 0 1.4c.3.4.8.5 1.5.6c.5 0 1.1.2 1.6.4c.5.3 1.1.5 1.7.5c.3 0 .7-.1 1-.2c.3-.2.5-.4.6-.7c.4 0 1-.2 1.7-.2c.6 0 1.2.2 2 .1c0 .1 0 .2.1.3c.2.5.7.9 1.3 1h.2c.8-.1 1.6-.5 2.1-1.1c.4-.4.9-.7 1.4-.9c.6-.3 1-.5 1.1-1c.1-.7-.1-1.1-.5-1.7M12.8 4.8c.6.1 1.1.6 1 1.2q0 .45-.3.9h-.1c-.2-.1-.3-.1-.4-.2c.1-.1.1-.3.2-.5c0-.4-.2-.7-.4-.7c-.3 0-.5.3-.5.7v.1c-.1-.1-.3-.1-.4-.2V6c-.1-.5.3-1.1.9-1.2m-.3 2c.1.1.3.2.4.2s.3.1.4.2c.2.1.4.2.4.5s-.3.6-.9.8c-.2.1-.3.1-.4.2c-.3.2-.6.3-1 .3c-.3 0-.6-.2-.8-.4c-.1-.1-.2-.2-.4-.3c-.1-.1-.3-.3-.4-.6c0-.1.1-.2.2-.3c.3-.2.4-.3.5-.4l.1-.1c.2-.3.6-.5 1-.5c.3.1.6.2.9.4M10.4 5c.4 0 .7.4.8 1.1v.2c-.1 0-.3.1-.4.2v-.2c0-.3-.2-.6-.4-.5c-.2 0-.3.3-.3.6c0 .2.1.3.2.4c0 0-.1.1-.2.1c-.2-.2-.4-.5-.4-.8c0-.6.3-1.1.7-1.1m-1 16.1c-.7.3-1.6.2-2.2-.2c-.6-.3-1.1-.4-1.8-.4c-.5-.1-1-.1-1.1-.3s-.1-.5.1-1q.15-.45 0-.9c-.1-.3-.1-.5 0-.8s.3-.4.6-.5s.5-.2.7-.4c.1-.1.2-.2.3-.4c.3-.4.5-.6.8-.6c.6.1 1.1 1 1.5 1.9c.2.3.4.7.7 1c.4.5.9 1.2.9 1.6c0 .5-.2.8-.5 1m4.9-2.2c0 .1 0 .1-.1.2c-1.2.9-2.8 1-4.1.3l-.6-.9c.9-.1.7-1.3-1.2-2.5c-2-1.3-.6-3.7.1-4.8c.1-.1.1 0-.3.8c-.3.6-.9 2.1-.1 3.2c0-.8.2-1.6.5-2.4c.7-1.3 1.2-2.8 1.5-4.3c.1.1.1.1.2.1c.1.1.2.2.3.2c.2.3.6.4.9.4h.1c.4 0 .8-.1 1.1-.4c.1-.1.2-.2.4-.2q.45-.15.9-.6c.4 1.3.8 2.5 1.4 3.6c.4.8.7 1.6.9 2.5c.3 0 .7.1 1 .3c.8.4 1.1.7 1 1.2H18c0-.3-.2-.6-.9-.9s-1.3-.3-1.5.4c-.1 0-.2.1-.3.1c-.8.4-.8 1.5-.9 2.6c.1.4 0 .7-.1 1.1m4.6.6c-.6.2-1.1.6-1.5 1.1c-.4.6-1.1 1-1.9.9c-.4 0-.8-.3-.9-.7c-.1-.6-.1-1.2.2-1.8c.1-.4.2-.7.3-1.1c.1-1.2.1-1.9.6-2.2c0 .5.3.8.7 1c.5 0 1-.1 1.4-.5h.2c.3 0 .5 0 .7.2s.3.5.3.7c0 .3.2.6.3.9c.5.5.5.8.5.9c-.1.2-.5.4-.9.6m-9-12c-.1 0-.1 0-.1.1c0 0 0 .1.1.1s.1.1.1.1c.3.4.8.6 1.4.7c.5-.1 1-.2 1.5-.6l.6-.3c.1 0 .1-.1.1-.1c0-.1 0-.1-.1-.1c-.2.1-.5.2-.7.3c-.4.3-.9.5-1.4.5s-.9-.3-1.2-.6c-.1 0-.2-.1-.3-.1"
            />
          </svg>
          Linux (deb)
        </button>
        <button
          class="VPButton"
          :class="os === 'android' ? 'brand' : 'alt'"
          v-else-if="asset.name.endsWith('.apk')"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
          >
            <path
              fill="currentColor"
              d="M1 18q.225-2.675 1.638-4.925T6.4 9.5L4.55 6.3q-.15-.225-.075-.475T4.8 5.45q.2-.125.45-.05t.4.3L7.5 8.9Q9.65 8 12 8t4.5.9l1.85-3.2q.15-.225.4-.3t.45.05q.25.125.325.375t-.075.475L17.6 9.5q2.35 1.325 3.762 3.575T23 18zm6-2.75q.525 0 .888-.363T8.25 14t-.363-.888T7 12.75t-.888.363T5.75 14t.363.888t.887.362m10 0q.525 0 .888-.363T18.25 14t-.363-.888T17 12.75t-.888.363t-.362.887t.363.888t.887.362"
            />
          </svg>
          Android
        </button>
      </a>
    </div>
  </span>
  <span v-else>
    下载链接加载失败，请前往
    <a href="https://github.com/LiRenTech/project-graph/releases">Github</a>
    下载。
  </span>
  <div class="warning custom-block github-alert" v-if="notSupported">
    <p class="custom-block-title">不支持的系统</p>
    <p>
      根据浏览器平台信息 ({{ os }} {{ isArm ? "ARM" : "x86" }})，Project Graph
      目前不支持你的系统。
    </p>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";

const props = defineProps<{
  repo: string;
  nightly: boolean;
}>();

const release = ref();
const os = ref("");
const isArm = ref(false);
const notSupported = ref(false);

const data = await (
  await fetch(
    `https://proxy.zty012.de/https://api.github.com/repos/${props.repo}/releases`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${import.meta.env.VITE_GITHUB_TOKEN}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
    },
  )
).json();
for (const item of data) {
  if (
    (item.prerelease && props.nightly) ||
    (!item.prerelease && !props.nightly)
  ) {
    release.value = item;
    console.log("found release", item.tag_name);
    break;
  }
}

onMounted(() => {
  const platform = navigator.platform.toLowerCase();
  const userAgent = navigator.userAgent.toLowerCase();
  if (
    userAgent.includes("arm64") ||
    userAgent.includes("aarch64") ||
    userAgent.includes("armv8")
  ) {
    isArm.value = true;
  }
  if (platform.includes("win")) {
    os.value = "windows";
  } else if (platform.includes("mac")) {
    os.value = "macos";
  } else if (platform.includes("linux")) {
    os.value = "linux";
  }
  if (isArm.value && (os.value === "windows" || os.value === "linux")) {
    notSupported.value = true;
  }
  console.log("os", os.value, "isArm", isArm.value);
});
</script>

<style scoped>
a {
  text-decoration: none;
}

.container {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  align-items: center;
}

.VPButton {
  display: inline-block;
  border: 1px solid transparent;
  text-align: center;
  font-weight: 600;
  white-space: nowrap;
  transition:
    color 0.25s,
    border-color 0.25s,
    background-color 0.25s;
  border-radius: 16px;
  padding: 5px 16px;
  line-height: 38px;
  font-size: 14px;
  display: flex;
  gap: 4px;
  align-items: center;
}

.VPButton.alt {
  border-color: var(--vp-button-alt-border);
  color: var(--vp-button-alt-text);
  background-color: var(--vp-button-alt-bg);
}

.VPButton.alt:hover {
  border-color: var(--vp-button-alt-hover-border);
  color: var(--vp-button-alt-hover-text);
  background-color: var(--vp-button-alt-hover-bg);
}

.VPButton.alt:active {
  border-color: var(--vp-button-alt-active-border);
  color: var(--vp-button-alt-active-text);
  background-color: var(--vp-button-alt-active-bg);
}

.VPButton.brand {
  border-color: var(--vp-button-brand-border);
  color: var(--vp-button-brand-text);
  background-color: var(--vp-button-brand-bg);
}

.VPButton.brand:hover {
  border-color: var(--vp-button-brand-hover-border);
  color: var(--vp-button-brand-hover-text);
  background-color: var(--vp-button-brand-hover-bg);
}

.VPButton.brand:active {
  border-color: var(--vp-button-brand-active-border);
  color: var(--vp-button-brand-active-text);
  background-color: var(--vp-button-brand-active-bg);
}
</style>
