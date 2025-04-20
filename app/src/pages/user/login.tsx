import { Turnstile } from "@marsidev/react-turnstile";
import { fetch } from "@tauri-apps/plugin-http";
import { Check, Key, User } from "lucide-react";
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
  const [turnstileToken, setTurnstileToken] = useState("");

  const login = async () => {
    const resp = await fetch(`${import.meta.env.LR_API_BASE_URL}/user/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
        turnstileResponse: turnstileToken,
      }),
    });
    if (resp.status === 200) {
      Dialog.show({
        type: "success",
        title: "登录",
        content: "登录成功",
      });
    } else {
      Dialog.show({
        type: "error",
        title: "登录",
        content: (await resp.json()).msg,
      });
    }
  };

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">登录</h1>
      <div className="flex items-center gap-4">
        <User />
        <Input placeholder="用户名" value={username} onChange={setUsername} />
      </div>
      <div className="flex items-center gap-4">
        <Key />
        <Input placeholder="密码" type="password" value={password} onChange={setPassword} />
      </div>
      <Turnstile
        siteKey={import.meta.env.LR_TURNSTILE_SITE_KEY ?? ""}
        onSuccess={setTurnstileToken}
        options={{
          theme: Themes.getThemeById(theme)?.metadata.type,
          language: "cmn",
        }}
      />
      <Button onClick={login}>
        <Check />
        登录
      </Button>
    </div>
  );
}
