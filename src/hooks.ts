import { getPreferenceValues } from "@raycast/api";
import { useCachedState } from "@raycast/utils";
import { Preferences, ConfigSet } from "./types";
import { loadLocalConfig } from "./utils";
import React from "react";
import { useEffect } from "react";

export const usePreferences = () => {
  return React.useMemo(() => getPreferenceValues<Preferences>(), []);
};

export const useConfigSet = () => {
  const { configPath } = usePreferences();
  const [configSets, setConfigSets] = useCachedState<ConfigSet[]>("configSets", []);
  useEffect(() => {
    async function fetchConfigData() {
      const localConfigSets = await loadLocalConfig(configPath);
      setConfigSets(localConfigSets);
    }
    fetchConfigData();
  }, []);

  return [configSets, setConfigSets] as const;
};

export const useSelectedConfigSet = () => {
  const { configPath } = usePreferences();
  let defaultConfigSet: ConfigSet = {
    key: "Default",
    path: "",
  };
  const [selectedConfigSet, setSelectedConfigSet] = useCachedState<ConfigSet>("selectedConfigSet", defaultConfigSet);
  useEffect(() => {
    async function fetchConfigData() {
      if (selectedConfigSet && selectedConfigSet.key !== "Default") return;

      const localConfigSets = await loadLocalConfig(configPath);
      if (localConfigSets.length > 0) {
        defaultConfigSet = localConfigSets[0];
      }
      setSelectedConfigSet(defaultConfigSet);
    }
    fetchConfigData();
  }, []);

  return [selectedConfigSet, setSelectedConfigSet] as const;
};
