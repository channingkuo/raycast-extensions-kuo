import { List, Icon, Action, ActionPanel } from "@raycast/api";
import { useState, useEffect } from "react";
import { useSelectedConfigSet, usePreferences } from "./hooks";
import { CKDetails } from "./ck.details";
import { ConfigManagerListDropdown } from "./ConfigManager/index";
import { openInEmacs, locateInTerminal } from "./utils";
import fs from "fs";
import os from "os";
import path from "path";

export default function CKList() {
  const preferences = usePreferences();
  const [query, setQuery] = useState("");
  const [selectedConfigSet] = useSelectedConfigSet();
  const [suggestions, setSuggestions] = useState<Record<string, string>[]>([]);

  const onSelection = (item: Record<string, string>) => {
    let fullPath = selectedConfigSet.path ? selectedConfigSet.path : os.homedir();
    if (fullPath.endsWith(path.sep)) {
      setQuery(item.path.replace(fullPath, ""));
    } else {
      setQuery(item.path.replace(fullPath + path.sep, ""));
    }
  };

  useEffect(() => {
    if (query.length === 0) {
      setSuggestions([]);
      return;
    }

    let fullPath = selectedConfigSet.path ? selectedConfigSet.path : os.homedir();
    let filteredQuery = query;

    const possiblePath = path.join(fullPath, query);
    if (fs.existsSync(possiblePath) && query.indexOf(path.sep) >= 0) {
      fullPath = possiblePath;

      const index = query.lastIndexOf(path.sep);
      if (index !== query.length - 1) {
        filteredQuery = "";
      } else if (index >= 0) {
        filteredQuery = query.substring(index + 1, query.length - 1);
      }
    } else if (!selectedConfigSet.path && fs.existsSync(possiblePath) && query.indexOf(path.sep) < 0) {
      fullPath = possiblePath;
      filteredQuery = "";
    } else {
      const index = query.lastIndexOf(path.sep);
      if (index >= 0) {
        const beforeSlash = query.substring(0, index);
        fullPath = path.join(fullPath, beforeSlash);
        filteredQuery = query.substring(index + 1, query.length);
      }
    }
    if (filteredQuery === path.sep) {
      filteredQuery = "";
    }

    try {
      const files = fs.readdirSync(fullPath);
      const matchedFiles = files
        .filter((file) => file.startsWith(filteredQuery) && file !== ".DS_Store")
        .map((file) => {
          return {
            name: file,
            path: path.join(fullPath, file),
            folder: fs.statSync(path.join(fullPath, file)).isDirectory() ? "1" : "0",
          };
        });
      setSuggestions(matchedFiles);
    } catch (error) {
      setSuggestions([]);
    }
  }, [selectedConfigSet.path, query]);

  return (
    <List
      filtering={false}
      onSearchTextChange={setQuery}
      searchText={query}
      navigationTitle="CK"
      searchBarPlaceholder="Enter the folder path or folder name"
      throttle
      searchBarAccessory={<ConfigManagerListDropdown />}
    >
      {suggestions.map((suggestion) => (
        <List.Item
          key={suggestion.name}
          icon={suggestion.folder === "1" ? Icon.Folder : Icon.Document}
          title={suggestion.name}
          subtitle={suggestion.path}
          actions={
            <ActionPanel>
              <Action title="Open in Emacs" icon={Icon.Terminal} onAction={() => openInEmacs(suggestion, preferences)} />
              <Action title="Locate in Terminal" icon={Icon.Terminal} onAction={() => locateInTerminal(suggestion, preferences)} />
              <Action.Push
                title="Show Details"
                icon={Icon.Eye}
                target={<CKDetails suggestion={suggestion} />}
                shortcut={{ modifiers: ["shift", "cmd"], key: "enter" }}
              />
              <Action
                title="Path Completion"
                icon={Icon.AirplaneTakeoff}
                shortcut={{ modifiers: [], key: "tab" }}
                onAction={() => onSelection(suggestion)}
              />
              <Action.ShowInFinder path={suggestion.path} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}
