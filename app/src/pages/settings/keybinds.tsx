import { Keyboard } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import KeyBind from "../../components/KeyBind";
import { KeyBinds } from "../../core/service/controlService/shortcutKeysEngine/KeyBinds";
import { Field, FieldGroup } from "./_field";
import { shortcutKeysGroups } from "../../core/service/controlService/shortcutKeysEngine/shortcutKeysGroup";

export default function KeyBindsPage() {
  const [keyBinds, setKeyBinds] = React.useState<[id: string, { key: string; modifiers: KeyBinds.KeyModifiers }][]>([]);

  React.useEffect(() => {
    KeyBinds.entries().then((entries) => {
      setKeyBinds(entries);
    });
  }, []);

  const getKeybindObjectById = (id: string) => {
    return keyBinds.find((item) => item[0] === id)?.[1];
  };

  /**
   * 获取未加入分组的快捷键
   * @returns
   */
  const getUnGroupedKeys = () => {
    return keyBinds.filter((item) => !shortcutKeysGroups.some((group) => group.keys.includes(item[0])));
  };

  const { t } = useTranslation("keyBinds");

  return (
    <>
      {shortcutKeysGroups.map((group, i) => {
        console.log(group);
        return (
          <FieldGroup title={t(group.title)} key={i}>
            {group.keys.map((id) => (
              <Field
                key={id}
                icon={<Keyboard />}
                title={t(`${id}.title`, { defaultValue: id })}
                description={t(`${id}.description`, { defaultValue: "" })}
              >
                <KeyBind
                  value={getKeybindObjectById(id)}
                  onChange={(value) => {
                    KeyBinds.set(id, value.key, value.modifiers);
                    setKeyBinds((prev) => prev.map((item) => (item[0] === id ? [item[0], value] : item)));
                  }}
                />
              </Field>
            ))}
          </FieldGroup>
        );
      })}
      <FieldGroup title={t("otherKeys")} description={"未分组的快捷键"}>
        {getUnGroupedKeys()
          .map(([id, bind]) => (
            <Field
              key={id}
              icon={<Keyboard />}
              title={t(`${id}.title`, { defaultValue: id })}
              description={t(`${id}.description`, { defaultValue: "" })}
            >
              <KeyBind
                value={bind}
                onChange={(value) => {
                  KeyBinds.set(id, value.key, value.modifiers);
                  setKeyBinds((prev) => prev.map((item) => (item[0] === id ? [item[0], value] : item)));
                }}
              />
            </Field>
          ))
          .sort((a, b) => {
            if (a.key === null && b.key === null) return 0; // 两者均为 null，相等
            if (a.key === null) return 1; // a.key 为 null，把它排到后面
            if (b.key === null) return -1; // b.key 为 null，把它排到后面
            return a.key.localeCompare(b.key); // 正常比较
          })}
      </FieldGroup>
      {/* <h1>{t("title")}</h1>
      {keyBinds
        .map(([id, bind]) => (
          <Field
            key={id}
            icon={<Keyboard />}
            title={t(`${id}.title`, { defaultValue: id })}
            description={t(`${id}.description`, { defaultValue: "" })}
          >
            <KeyBind
              value={bind}
              onChange={(value) => {
                KeyBinds.set(id, value.key, value.modifiers);
                setKeyBinds((prev) => prev.map((item) => (item[0] === id ? [item[0], value] : item)));
              }}
            />
          </Field>
        ))
        .sort((a, b) => {
          if (a.key === null && b.key === null) return 0; // 两者均为 null，相等
          if (a.key === null) return 1; // a.key 为 null，把它排到后面
          if (b.key === null) return -1; // b.key 为 null，把它排到后面
          return a.key.localeCompare(b.key); // 正常比较
        })} */}
    </>
  );
}
