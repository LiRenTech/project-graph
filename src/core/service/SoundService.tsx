// 实测发现 不可行:
// @tauri-apps/plugin-fs 只能读取文本文件，不能强行读取流文件并强转为ArrayBuffer
// import { readTextFile } from "@tauri-apps/plugin-fs";

import { readFile } from "../../utils/fs";
import { StringDict } from "../dataStruct/StringDict";
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
  let alignAndAttachSoundFile = "";

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
    Settings.watch("alignAndAttachSoundFile", (value) => {
      alignAndAttachSoundFile = value;
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

    // 对齐吸附音效
    export function alignAndAttach() {
      loadAndPlaySound(alignAndAttachSoundFile);
    }
  }

  const audioContext = new window.AudioContext();

  export function playSoundByFilePath(filePath: string) {
    loadAndPlaySound(filePath);
  }

  async function loadAndPlaySound(filePath: string) {
    if (filePath.trim() === "") {
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
    const uint8Array = await readFile(filePath);

    // 创建 ArrayBuffer
    const arrayBuffer = uint8Array.buffer as ArrayBuffer;

    // 解码音频数据
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    // 加入缓存
    pathAudioBufferMap.setById(filePath, audioBuffer);

    return audioBuffer;
  }
}
