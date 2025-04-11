import { Toast, showToast, closeMainWindow } from "@raycast/api";
import { showFailureToast } from "@raycast/utils";
import { ConfigSet, Preferences } from "./types";
import { setTimeout } from "timers/promises";
import { exec } from "child_process";
import fs from "fs";
import path from "path";

export const loadLocalConfig = async (configPath?: string) => {
  const localConfigSet: ConfigSet[] = [];
  try {
    if (!configPath) {
      showToast({ title: "Error", message: "Config path is not set" });
      return localConfigSet;
    }
    const content = await fs.promises.readFile(configPath, "utf-8");
    return JSON.parse(content) as ConfigSet[];
  } catch (error) {
    showFailureToast(error, { title: "Failed to read config file" });
    return localConfigSet;
  }
};

export const saveLocalConfig = async (configSets: ConfigSet[], configPath?: string) => {
  try {
    if (!configPath) {
      showToast({ title: "Error", message: "Config path is not set" });
      return;
    }
    const content = JSON.stringify(configSets, null, 2);
    await fs.promises.writeFile(configPath, content, "utf-8");
    showToast({ title: "Success", message: "Config file saved successfully" });
  } catch (error) {
    showFailureToast(error, { title: "Failed to save config file" });
  }
};

export const openInEmacs = async (item: Record<string, string>, preferences: Preferences) => {
  const { emacsPath, cdAlias, emacsAlias } = preferences;
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
              set newWindow to (do script "${cdAlias ? cdAlias : "cd"} \\"${item.path}\\" && ${emacsPath ? emacsPath + " -nw" : emacsAlias ? emacsAlias : "emacs -nw"} .")
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
            do script "${emacsAlias ? emacsAlias : "emacs -nw"} \\"${item.path}\\""
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

export const locateInTerminal = async (item: Record<string, string>, preferences: Preferences) => {
  const { cdAlias } = preferences;
  try {
    const { name, folder } = item;
    const prePath = path.dirname(item.path);
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
                  set newWindow to (do script "${cdAlias ? cdAlias : "cd"} \\"${item.path}\\"")
                end if
              end tell'
            `;
      exec(command);
    } else {
      const command = `
              osascript -e 'tell application "Terminal"
                activate
                do script "${cdAlias ? cdAlias : "cd"} \\"${prePath}\\" && echo \\"${name}\\""
              end tell'
            `;
      exec(command);
    }
    await showToast({ style: Toast.Style.Success, title: "Located in Terminal", message: name });
  } catch (error) {
    await showToast({ style: Toast.Style.Failure, title: "Failed", message: String(error) });
  } finally {
    await setTimeout(3000);
    closeMainWindow();
  }
};
