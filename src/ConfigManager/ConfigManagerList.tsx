import { Icon, List, useNavigation } from "@raycast/api";
import { Action, ActionPanel, Color, showToast, Toast } from "@raycast/api";
import { AddConfigForm } from "./AddConfigForm";
import { ConfigSet } from "../types";
import { saveLocalConfig } from "../utils";
import { useConfigSet, useSelectedConfigSet, usePreferences } from "../hooks";

export function ConfigManagerItem({
  configSet,
  onSelect,
  onDelete,
  selected,
}: {
  configSet: ConfigSet;
  onSelect: () => void;
  onDelete?: () => void;
  selected?: boolean;
}) {
  return (
    <List.Item
      subtitle={`${configSet.path ? configSet.path : "~"}`}
      title={configSet.key.toLocaleUpperCase()}
      keywords={[configSet.key, configSet.key.toLocaleUpperCase(), configSet.path]}
      icon={selected ? { tintColor: Color.Green, source: Icon.Checkmark } : undefined}
      actions={
        <ActionPanel>
          <Action title="Select" onAction={onSelect} icon={{ tintColor: Color.Green, source: Icon.Checkmark }} />
          {onDelete && <Action style={Action.Style.Destructive} title="Delete" onAction={onDelete} icon={Icon.Trash} />}
        </ActionPanel>
      }
    />
  );
}

export const ConfigManagerList = () => {
  const navigation = useNavigation();
  const [configSets, setConfigSets] = useConfigSet();
  const [selectedConfigSet, setSelectedConfigSet] = useSelectedConfigSet();
  const { configPath } = usePreferences();

  const onRemoveConfigSets = async (configSet?: ConfigSet) => {
    let configSetList: ConfigSet[] = [];
    if (!configSet) {
      setConfigSets(configSetList);
    } else {
      configSetList = configSets.filter((l) => l.key !== configSet.key);
      setConfigSets(configSetList);
    }
    await saveLocalConfig(configSetList, configPath);
    showToast(Toast.Style.Success, "config sets were removed!");
  };

  return (
    <List
      actions={
        <ActionPanel>
          <Action title="Remove All" onAction={() => onRemoveConfigSets()} />
        </ActionPanel>
      }
    >
      <List.Item
        icon={{ source: Icon.Plus }}
        title="Add new config set..."
        actions={
          <ActionPanel>
            <Action.Push
              title="Add New Config Set…"
              target={
                <AddConfigForm
                  onAddConfig={async (configSet) => {
                    setConfigSets([...configSets, configSet]);
                    await saveLocalConfig([...configSets, configSet], configPath);
                    navigation.pop();
                    showToast(Toast.Style.Success, "Config set was saved!", `${configSet.key.toLocaleUpperCase()}`);
                  }}
                />
              }
            />
          </ActionPanel>
        }
      />
      {configSets.map((configSet) => (
        <ConfigManagerItem
          key={configSet.key}
          selected={configSet.key === selectedConfigSet.key}
          configSet={configSet}
          onSelect={() => {
            setSelectedConfigSet(configSet);
            navigation.pop();
          }}
          onDelete={() => {
            onRemoveConfigSets(configSet);
          }}
        />
      ))}
    </List>
  );
};
