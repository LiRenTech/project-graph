import { useAtom } from "jotai";
import { FileQuestion, Keyboard } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Field, FieldGroup } from "../../../components/Field";
import KeyBind from "../../../components/KeyBind";
import { shortcutKeysGroups } from "../../../core/service/controlService/shortcutKeysEngine/shortcutKeysGroup";
import { activeProjectAtom } from "../../../state";

export default function KeyBindsPage() {
  const [activeProject] = useAtom(activeProjectAtom);

  /**
   * 获取未加入分组的快捷键
   * @returns
   */
  const getUnGroupedKeys = () => {
    return [...(activeProject?.keyBinds.registered ?? [])].filter(
      (item) => !shortcutKeysGroups.some((group) => group.keys.includes(item[0])),
    );
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
                  defaultValue={[...(activeProject?.keyBinds.registered ?? [])].find((item) => item[0] === id)?.[1]}
                  onChange={(value) => {
                    activeProject?.keyBinds.set(id, value);
                  }}
                />
              </Field>
            ))}
          </FieldGroup>
        );
      })}
      <FieldGroup title={t2.t(`otherKeys.title`)} description={t2.t(`otherKeys.description`)} icon={<FileQuestion />}>
        {getUnGroupedKeys().map((id) => (
          <Field
            key={id}
            icon={<Keyboard />}
            title={t(`${id}.title`, { defaultValue: id })}
            description={t(`${id}.description`, { defaultValue: "" })}
          >
            <KeyBind
              defaultValue={[...(activeProject?.keyBinds.registered ?? [])].find((item) => item[0] === id)?.[1]}
              onChange={(value) => {
                activeProject?.keyBinds.set(id, value);
              }}
            />
          </Field>
        ))}
      </FieldGroup>
    </>
  );
}
