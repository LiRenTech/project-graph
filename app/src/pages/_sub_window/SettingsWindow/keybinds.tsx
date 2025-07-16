import { useAtom } from "jotai";
import { FileQuestion, Keyboard } from "lucide-react";
import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Field, FieldGroup } from "../../../components/Field";
import KeyBind from "../../../components/KeyBind";
import { shortcutKeysGroups } from "../../../core/service/controlService/shortcutKeysEngine/shortcutKeysGroup";
import { activeProjectAtom } from "../../../state";

export default function KeyBindsPage() {
  const [keyBinds, setKeyBinds] = React.useState<[string, string][]>([]);
  const [activeProject] = useAtom(activeProjectAtom);

  React.useEffect(() => {
    activeProject?.keyBinds.entries().then((entries) => {
      setKeyBinds(entries);
    });
  }, [activeProject]);

  const getKeybindObjectById = useCallback(
    (id: string) => {
      return keyBinds.find((item) => item[0] === id)?.[1];
    },
    [keyBinds],
  );

  /**
   * 获取未加入分组的快捷键
   * @returns
   */
  const getUnGroupedKeys = () => {
    return keyBinds.filter((item) => !shortcutKeysGroups.some((group) => group.keys.includes(item[0])));
  };

  const { t } = useTranslation("keyBinds");
  const t2 = useTranslation("keyBindsGroup");

  return (
    <>
      {shortcutKeysGroups.map((group, i) => {
        return (
          <FieldGroup
            icon={group.icon}
            title={t2.t(`${group.title}.title`)}
            description={t2.t(`${group.title}.description`)}
            key={i}
          >
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
                    activeProject?.keyBinds.set(id, value);
                    setKeyBinds((prev) => prev.map((item) => (item[0] === id ? [item[0], value] : item)));
                  }}
                />
              </Field>
            ))}
          </FieldGroup>
        );
      })}
      <FieldGroup title={t2.t(`otherKeys.title`)} description={t2.t(`otherKeys.description`)} icon={<FileQuestion />}>
        {getUnGroupedKeys().map(([id, bind]) => (
          <Field
            key={id}
            icon={<Keyboard />}
            title={t(`${id}.title`, { defaultValue: id })}
            description={t(`${id}.description`, { defaultValue: "" })}
          >
            <KeyBind
              value={bind}
              onChange={(value) => {
                activeProject?.keyBinds.set(id, value);
                setKeyBinds((prev) => prev.map((item) => (item[0] === id ? [item[0], value] : item)));
              }}
            />
          </Field>
        ))}
      </FieldGroup>
    </>
  );
}
