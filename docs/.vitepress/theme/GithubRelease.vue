<template>
  <span v-if="release" style="display: flex; gap: 4px">
    <a v-for="asset of release.assets" :href="'https://proxy.zty012.de/' + asset.browser_download_url" :download="asset.name">
      <VPButton theme="alt" v-if="asset.name.endsWith('.exe')" text="Windows" />
      <VPButton theme="alt" v-else-if="asset.name.endsWith('aarch64.dmg')" text="Mac (M1)" />
      <VPButton theme="alt" v-else-if="asset.name.endsWith('x64.dmg')" text="Mac (Intel)" />
      <VPButton theme="alt" v-else-if="asset.name.endsWith('.deb')" text="Linux (deb)" />
      <VPButton theme="alt" v-else-if="asset.name.endsWith('.apk')" text="Android" />
    </a>
  </span>
  <span v-else>
    正在加载下载链接，若长时间未加载请前往
    <a href="https://github.com/LiRenTech/project-graph/releases">Github</a>
    手动下载。
  </span>
</template>

<script lang="ts" setup>
import { VPButton } from 'vitepress/theme';
import { onMounted, ref } from 'vue';

const props = defineProps<{
  repo: string;
  nightly: boolean;
}>();

const release = ref();

onMounted(() => {
  fetch(`https://proxy.zty012.de/https://api.github.com/repos/${props.repo}/releases`, {
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${import.meta.env.VITE_GITHUB_TOKEN}`,
      'X-GitHub-Api-Version': '2022-11-28',
    },
  })
    .then((resp) => resp.json())
    .then((data) => {
      for (const item of data) {
        if ((item.prerelease && props.nightly) || (!item.prerelease && !props.nightly)) {
          release.value = item;
          break;
        }
      }
    });
});
</script>
