import { Action, ActionPanel, Toast, Form, showToast } from "@raycast/api";
import { ConfigSet } from "../types";

export const AddConfigForm = ({ onAddConfig }: { onAddConfig: (data: ConfigSet) => void }) => {
  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title="Add Config Set"
            onSubmit={(values: ConfigSet) => {
              if (!values.key) {
                showToast({
                  style: Toast.Style.Failure,
                  title: "Key is required",
                  message: "Please input a key for the config set",
                });
                return;
              }
              if (!values.path || values.path.length === 0) {
                showToast({
                  style: Toast.Style.Failure,
                  title: "Path is required",
                  message: "Please input the path for the config set",
                });
                return;
              }
              onAddConfig({
                key: values.key.toLocaleLowerCase(),
                path: values.path[0],
              });
            }}
          />
        </ActionPanel>
      }
    >
      <Form.TextField id="key" autoFocus title="Key" />
      <Form.FilePicker
        id="path"
        title="Path"
        allowMultipleSelection={false}
        canChooseDirectories
        canChooseFiles={false}
      />
    </Form>
  );
};
