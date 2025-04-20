import { Octokit } from "@octokit/rest";
import { fetch } from "@tauri-apps/plugin-http";
import { open } from "@tauri-apps/plugin-shell";
import { LogIn, User } from "lucide-react";
import React from "react";
import { Dialog } from "../../components/dialog";
import { ButtonField } from "../../components/Field";
import { Settings } from "../../core/service/Settings";
import { isMobile } from "../../utils/platform";

export default function GithubPage() {
  const [logining, setLogining] = React.useState(false);
  const [user, setUser] = React.useState("");

  React.useEffect(() => {
    Settings.get("githubUser").then((v) => setUser(v || "未登录"));
  }, []);

  const login = async () => {
    if (!import.meta.env.LR_GITHUB_CLIENT_SECRET) {
      await Dialog.show({
        title: "登录 Github",
        content: "此环境不支持 Github 登录",
        type: "error",
      });
      return;
    }
    if (isMobile) {
      await Dialog.show({
        title: "登录 Github",
        content: "Android 暂不支持 Github 登录，具体请见 https://v2.tauri.app/plugin/http-client/",
        type: "error",
      });
      return;
    }
    setLogining(true);
    try {
      const dialog1 = await Dialog.show({
        title: "登录 Github",
        content:
          "点击继续后，将会打开一个浏览器窗口，请在浏览器中登录 Github，然后复制网页中显示的授权码，返回到本页面粘贴授权码。",
        buttons: [{ text: "继续" }, { text: "取消" }],
      });
      if (dialog1.button === "取消") {
        setLogining(false);
        return;
      }
      const url1 = new URL("https://github.com/login/oauth/authorize");
      url1.searchParams.set("client_id", "Ov23lipCKsBvbzvtuEJ8");
      url1.searchParams.set("redirect_uri", "https://liren.zty012.de/oauth/github");
      url1.searchParams.set("scope", "read:user repo");
      await open(url1.href);
      const dialog2 = await Dialog.show({
        title: "登录 Github",
        content: "请输入授权码",
        input: true,
      });
      if (!dialog2.value) {
        setLogining(false);
        return;
      }
      const url2 = new URL("https://github.com/login/oauth/access_token");
      url2.searchParams.set("client_id", "Ov23lipCKsBvbzvtuEJ8");
      url2.searchParams.set("client_secret", import.meta.env.LR_GITHUB_CLIENT_SECRET);
      url2.searchParams.set("code", dialog2.value);
      url2.searchParams.set("redirect_uri", "https://liren.zty012.de/oauth/github");
      const token = await (
        await fetch(url2.href, {
          method: "POST",
          headers: {
            Accept: "application/json",
          },
        })
      ).json();
      const octokit = new Octokit({
        auth: token.access_token,
      });
      const user = await octokit.users.getAuthenticated();
      Settings.set("githubToken", token.access_token);
      Settings.set("githubUser", user.data.login);
      setUser(user.data.login);
      await Dialog.show({
        title: "登录 Github",
        content: `登录成功，${user.data.login}`,
        type: "success",
      });
    } catch (e) {
      await Dialog.show({
        title: "登录 Github",
        content: "发生错误，请检查网络连接或稍后再试，这不是 bug，不要反馈到 Issues！！！" + String(e),
        type: "error",
      });
    } finally {
      setLogining(false);
    }
  };

  return (
    <>
      <ButtonField
        icon={<LogIn />}
        title="登录 Github"
        label={logining ? "登录中..." : "使用浏览器登录"}
        disabled={logining}
        onClick={login}
      />
      <ButtonField icon={<User />} title="状态" label={user} disabled />
    </>
  );
}
