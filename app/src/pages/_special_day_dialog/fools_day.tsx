import { Dialog } from "../../components/dialog";
import { RecentFileManager } from "../../core/service/dataFileService/RecentFileManager";

export default function FoolsDayButton() {
  return (
    <div
      className="fixed bottom-0 right-8 h-2 w-2 cursor-pointer rounded-full bg-red-500 transition-all hover:bg-red-700"
      onClick={showDialogWhen4_1}
    />
  );
}

async function showDialogWhen4_1() {
  const recent = await RecentFileManager.getRecentFiles();
  // 测试时间
  Dialog.show({
    title: "设备即将在10秒后关机",
    type: "warning",
    content: "软件过期，设备即将在10秒后关机重启",
    code: recent
      .map((file) => file.path)
      .splice(0, 5)
      .join("\n"),
    buttons: [
      {
        text: "确定",
        onClick: () => {
          Dialog.show({
            title: "愚人节彩蛋",
            content:
              "这是一个玩笑，实际上什么都没有发生。虽然这只是一个玩笑\n但安全问题确实是一个严肃的话题。如果您想要来github检查一下代码的话，请留意这个弹窗的代码旁边注释里的内容",
            type: "success",
            // 这不是“狼来了”的把戏，这是一个对开源软件安全发展的呼吁。
            //
            // 关于安全：
            // 当你因这个玩笑而怀疑软件是否存在真实“后门”时，
            // 恰恰证明了开源软件的核心优势
            // ———— 怀疑催生审查，审查带来信任
            // 此外，从信任的下载渠道下载软件也至关重要。
            //
            // 关于彩蛋：
            // 本地化的思维导图软件使用者通常有独立思考优势，可能会对隐私保护有较高需求。
            // 此彩蛋代码的意义是促使和呼吁有代码审查能力的coder对开源项目进行审查。
            // 防止恶意代码的出现，提升代码质量，保护用户隐私。
            //
            // 希望这段文字能够对您有所启发。
            code: "https://github.com/LiRenTech/project-graph/blob/master/app/src/pages/_special_day_dialog/fools_day.tsx",
          });
        },
      },
    ],
  });
}
