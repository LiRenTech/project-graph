import { Turnstile } from "@marsidev/react-turnstile";
import { fetch } from "@tauri-apps/plugin-http";
import { open } from "@tauri-apps/plugin-shell";
import { Check, Key, Ticket, User } from "lucide-react";
import { useState } from "react";
import Button from "../../components/Button";
import { Dialog } from "../../components/dialog";
import Input from "../../components/Input";
import { Settings } from "../../core/service/Settings";
import { Themes } from "../../core/service/Themes";

export default function LoginPage() {
  const [theme] = Settings.use("theme");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");

  const register = async () => {
    if (password !== passwordConfirm) {
      Dialog.show({
        title: "注册",
        content: "两次输入的密码不一致",
      });
      return;
    }
    const resp = await fetch(`${import.meta.env.LR_API_BASE_URL}/user/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
        inviteCode,
        turnstileResponse: turnstileToken,
      }),
    });
    if (resp.status === 200) {
      Dialog.show({
        type: "success",
        title: "注册",
        content: "注册成功，感谢对本项目的支持",
      });
    } else {
      Dialog.show({
        type: "error",
        title: "注册",
        content: (await resp.json()).msg,
      });
    }
  };

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">注册</h1>
      <div className="flex items-center gap-4">
        <User />
        <Input placeholder="用户名" value={username} onChange={setUsername} />
      </div>
      <div className="flex items-center gap-4">
        <Key />
        <Input placeholder="密码" type="password" value={password} onChange={setPassword} />
      </div>
      <div className="flex items-center gap-4">
        <Key />
        <Input placeholder="确认密码" type="password" value={passwordConfirm} onChange={setPasswordConfirm} />
      </div>
      <div className="flex items-center gap-4">
        <Ticket />
        <Input placeholder="邀请码" value={inviteCode} onChange={setInviteCode} />
      </div>
      <Button
        onClick={() => {
          open("https://tally.so/r/nrqzq2");
        }}
      >
        申请邀请码
      </Button>
      <Turnstile
        siteKey={import.meta.env.LR_TURNSTILE_SITE_KEY ?? ""}
        onSuccess={setTurnstileToken}
        options={{
          theme: Themes.getThemeById(theme)?.metadata.type,
          language: "cmn",
        }}
      />
      <Button onClick={register}>
        <Check />
        注册
      </Button>
    </div>
  );
}
