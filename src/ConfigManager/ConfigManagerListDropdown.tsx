import { Icon, List, useNavigation } from "@raycast/api";
import { ConfigManagerList } from "./ConfigManagerList";
import { ConfigSet } from "../types";
import { useConfigSet, useSelectedConfigSet } from "../hooks";

export function ConfigManagerListDropdown() {
  const navigation = useNavigation();
  const [configSets] = useConfigSet();
  const [selectedConfigSet, setSelectedConfigSet] = useSelectedConfigSet();

  return (
    <List.Dropdown
      value={JSON.stringify(selectedConfigSet)}
      tooltip="Config Set"
      onChange={(value) => {
        if (value === "manage") {
          navigation.push(<ConfigManagerList />);
        } else {
          const configSet: ConfigSet = JSON.parse(value);
          setSelectedConfigSet(configSet);
        }
      }}
    >
      <List.Dropdown.Item icon={Icon.Pencil} title="Manage Config sets..." value="manage" />
      <List.Dropdown.Item title="Default" value="{}" />
      {configSets.map((configSet) => (
        <List.Dropdown.Item
          key={configSet.key}
          title={configSet.key.toLocaleUpperCase()}
          value={JSON.stringify(configSet)}
        />
      ))}
    </List.Dropdown>
  );
}
