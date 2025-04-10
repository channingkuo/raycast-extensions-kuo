import { ActionPanel, List, Icon, Action } from "@raycast/api";
import React from "react";
import { useState, useEffect } from "react";
import fs from "fs";
import path from "path";

type Props = {
  suggestion: Record<string, string>;
};

export default function CKDetails({ suggestion }: Props) {
  const [files, setFiles] = useState<Record<string, string>[]>([]);
  const { name, folder } = suggestion;

  const isDirectory = folder === "1";

  useEffect(() => {
    if (name.length === 0) {
      setFiles([]);
      return;
    }

    try {
      if (isDirectory) {
        const files = fs.readdirSync(suggestion.path);
        const matchedFiles = files
          .filter((file) => file !== ".DS_Store")
          .map((file) => {
            return {
              name: file,
              path: path.join(suggestion.path, file),
              folder: fs.statSync(path.join(suggestion.path, file)).isDirectory() ? "1" : "0",
              markdown: "" + file,
            };
          });
        setFiles(matchedFiles);
      } else {
        setFiles([
          {
            name: name,
            path: suggestion.path,
            folder: "0",
            markdown: "" + name,
          },
        ]);
      }
    } catch (error) {
      setFiles([]);
    }
  }, [path]);

  return (
    <List isShowingDetail>
      {files.map((fileInfo) => (
        <List.Item
          key={fileInfo.name}
          icon={fileInfo.folder === "1" ? Icon.Folder : Icon.Document}
          title={fileInfo.name}
          detail={<FileDetail filePath={fileInfo.path} />}
          actions={
            <ActionPanel>
              <Action.ShowInFinder path={suggestion.path} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}

function FileDetail({ filePath }: { filePath: string }) {
  const [detail, setDetail] = useState<React.ReactElement | null>(null);

  useEffect(() => {
    const ext = path.extname(filePath).toLowerCase();
    console.log("File extension:", ext);
    console.log("File path:", filePath);

    if ([".txt", ".md", ".js", ".ts", ".jsx", ".tsx", ".json", ".log", ".html", ".css"].includes(ext)) {
      fs.promises.readFile(filePath, "utf-8").then((content) => {
        setDetail(<List.Item.Detail markdown={`\`\`\`\n${content}\n\`\`\``} />);
      }).catch(() => {
        setDetail(<List.Item.Detail markdown="读取失败" />);
      });

    } else if ([".png", ".jpg", ".jpeg", ".gif", ".bmp", ".webp"].includes(ext)) {
      const imageMarkdown = `![image](${filePath})`;
      setDetail(<List.Item.Detail markdown={imageMarkdown} />);
    } else {
      // 其他类型文件：展示图标或提示
      const icon = {
        tooltip: "Unsupported File",
        source: {
          light: "path/to/icon-light.png", // 替换为你自己打包的 icon 路径
          dark: "path/to/icon-dark.png",
        },
      };
      setDetail(<List.Item.Detail markdown="无法预览此文件类型" />);
    }
  }, [filePath]);

  return detail;
}