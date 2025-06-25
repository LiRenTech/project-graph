import { Turnstile, TurnstileInstance } from "@marsidev/react-turnstile";
import { fetch } from "@tauri-apps/plugin-http";
import { Check, Key, User } from "lucide-react";
import { useRef, useState } from "react";
import Button from "../../components/Button";
import { Dialog } from "../../components/dialog";
import Input from "../../components/Input";
import { Themes } from "../../core/service/Themes";
import { UserState } from "../../core/service/UserState";

export default function LoginPage() {
  const [theme] = Settings.use("theme");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const turnstileInstance = useRef<TurnstileInstance>(null);

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
      await UserState.setToken((await resp.json()).token);
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
    turnstileInstance.current?.reset();
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
        ref={turnstileInstance}
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
