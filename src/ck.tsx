import { List, Icon, Action, ActionPanel, Toast } from "@raycast/api";
import { getPreferenceValues, showToast, closeMainWindow } from "@raycast/api";
import { setTimeout } from "timers/promises";
import React from "react";
import { useState, useEffect } from "react";
import CKDetails from "./ck.details";
import { Preferences } from "./types";
import fs from "fs";
import os from "os";
import path from "path";
import { exec } from "child_process";

const usePreferences = () => {
  return React.useMemo(() => getPreferenceValues<Preferences>(), []);
};

export default function CKList() {
  const config = [
    {
      key: "Default",
      path: "",
    },
    {
      key: "YSW",
      path: "/Users/kuo/Documents/YSW/Source",
    },
    {
      key: "ATS",
      path: "/Users/kuo/Documents/ChanningKuo/projects/ats",
    },
  ];
  const [query, setQuery] = useState("");
  const [keyPath, setKeyPath] = useState(config[1].path);
  const [suggestions, setSuggestions] = useState<Record<string, string>[]>([]);

  const onSelection = (item: Record<string, string>) => {
    let fullPath = keyPath ? keyPath : os.homedir();
    if (fullPath.endsWith("/")) {
      setQuery(item.path.replace(fullPath, ""));
    } else {
      setQuery(item.path.replace(fullPath + "/", ""));
    }
  };

  const openInEmacs = async (item: Record<string, string>) => {
    try {
      const { name, folder } = item;
      const isDirectory = folder === "1";

      if (isDirectory) {
        const command = `
          osascript -e 'tell application "Terminal"
            if not running then
              activate
              delay 0.2
              set newWindow to front window
            else
              activate
              set newWindow to (do script "ck \\"${item.path}\\" && sk .")
            end if
            set number of columns of newWindow to 150
            set number of rows of newWindow to 46
          end tell'
        `;
        exec(command);
      } else {
        const command = `
          osascript -e 'tell application "Terminal"
            activate
            do script "ssk \\"${item.path}\\""
          end tell'
        `;
        exec(command);
      }
      await showToast({ style: Toast.Style.Success, title: "Opened in Emacs", message: name });
    } catch (error) {
      await showToast({ style: Toast.Style.Failure, title: "Failed", message: String(error) });
    } finally {
      await setTimeout(3000);
      closeMainWindow();
    }
    
  };

  useEffect(() => {
    if (query.length === 0) {
      setSuggestions([]);
      return;
    }

    let fullPath = keyPath ? keyPath : os.homedir();
    let filteredQuery = query;

    const possiblePath = path.join(fullPath, query);
    if (fs.existsSync(possiblePath) && query.indexOf("/") >= 0) {
      fullPath = possiblePath;

      const index = query.lastIndexOf("/");
      if (index !== query.length - 1) {
        filteredQuery = "";
      } else if (index >= 0) {
        filteredQuery = query.substring(index + 1, query.length - 1);
      }
    } else if (!keyPath && fs.existsSync(possiblePath) && query.indexOf("/") < 0) {
      fullPath = possiblePath;
      filteredQuery = "";
    } else {
      const index = query.lastIndexOf("/");
      if (index >= 0) {
        const beforeSlash = query.substring(0, index);
        fullPath = path.join(fullPath, beforeSlash);
        filteredQuery = query.substring(index + 1, query.length);
      }
    }
    if (filteredQuery === "/") {
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
  }, [keyPath, query]);

  return (
    <List
      filtering={false}
      onSearchTextChange={setQuery}
      searchText={query}
      navigationTitle="CK"
      searchBarPlaceholder="Enter the folder path or folder name"
      throttle
      searchBarAccessory={
        <List.Dropdown tooltip="Quick Access" onChange={setKeyPath} value={keyPath} storeValue placeholder="Search Key">
          {config.map((item) => (
            <List.Dropdown.Item key={item.key} title={item.key} value={item.path} />
          ))}
        </List.Dropdown>
      }
    >
      {suggestions.map((suggestion) => (
        <List.Item
          key={suggestion.name}
          icon={suggestion.folder === "1" ? Icon.Folder : Icon.Document}
          title={suggestion.name}
          subtitle={suggestion.path}
          actions={
            <ActionPanel>
              <Action title="Open in Emacs" onAction={() => openInEmacs(suggestion)} />
              <Action.Push title="Show Details" target={<CKDetails suggestion={suggestion} />} />
              <Action.ShowInFinder path={suggestion.path} />
              <Action
                title="Path Completion"
                shortcut={{ modifiers: ["shift"], key: "tab" }}
                onAction={() => onSelection(suggestion)}
              />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}
