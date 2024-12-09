// 实测发现 不可行:
// @tauri-apps/plugin-fs 只能读取文本文件，不能强行读取流文件并强转为ArrayBuffer
// import { readTextFile } from "@tauri-apps/plugin-fs";

import { invoke } from "@tauri-apps/api/core";
import { StringDict } from "./dataStruct/StringDict";
import { Settings } from "./Settings";

/**
 * 播放音效的服务
 * 这个音效播放服务是用户自定义的
 */
export namespace SoundService {
  let cuttingLineStartSoundFile = "";
  let connectLineStartSoundFile = "";
  let connectFindTargetSoundFile = "";
  let cuttingLineReleaseSoundFile = "";

  export function init() {
    Settings.watch("cuttingLineStartSoundFile", (value) => {
      cuttingLineStartSoundFile = value;
    });
    Settings.watch("connectLineStartSoundFile", (value) => {
      connectLineStartSoundFile = value;
    });
    Settings.watch("connectFindTargetSoundFile", (value) => {
      connectFindTargetSoundFile = value;
    });
    Settings.watch("cuttingLineReleaseSoundFile", (value) => {
      cuttingLineReleaseSoundFile = value;
    });
  }

  export namespace play {
    // 开始切断
    export function cuttingLineStart() {
      loadAndPlaySound(cuttingLineStartSoundFile);
    }

    // 开始连接
    export function connectLineStart() {
      loadAndPlaySound(connectLineStartSoundFile);
    }

    // 连接吸附到目标点
    export function connectFindTarget() {
      loadAndPlaySound(connectFindTargetSoundFile);
    }

    // 自动保存执行特效
    // 自动备份执行特效

    // 框选增加物体音效

    // 切断特效声音
    export function cuttingLineRelease() {
      loadAndPlaySound(cuttingLineReleaseSoundFile);
    }
    // 连接成功
  }

  const audioContext = new window.AudioContext();

  async function loadAndPlaySound(filePath: string) {
    if (filePath.trim() === "") {
      console.log("filePath is empty");
      return;
    }

    // 解码音频数据
    const audioBuffer = await getAudioBufferByFilePath(filePath);
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    source.start(0);
  }

  const pathAudioBufferMap = new StringDict<AudioBuffer>();

  async function getAudioBufferByFilePath(filePath: string) {
    // 先从缓存中获取音频数据
    if (pathAudioBufferMap.hasId(filePath)) {
      const result = pathAudioBufferMap.getById(filePath);
      if (result) {
        return result;
      }
    }

    // 缓存中没有

    // 读取文件为字符串
    const base64Data: string = await invoke<string>("read_mp3_file", {
      path: filePath,
    });
    // 解码 Base64 字符串
    const byteCharacters = atob(base64Data); // 使用 atob 解码 Base64 字符串
    const byteNumbers = new Uint8Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i); // 转换为字节数组
    }

    // 创建 ArrayBuffer
    const arrayBuffer = byteNumbers.buffer;

    // 解码音频数据
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    // 加入缓存
    pathAudioBufferMap.setById(filePath, audioBuffer);

    return audioBuffer;
  }
}
