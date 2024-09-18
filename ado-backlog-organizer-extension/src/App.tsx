import {
  Button,
  Dropdown,
  Field,
  Input,
  makeStyles,
  Option,
  Textarea,
  Title2,
} from "@fluentui/react-components";
import { useEffect, useState } from "react";

const workItemTypes = [
  "Bug",
  "Epic",
  "Feature",
  "Impediment",
  "Product Backlog Item",
  "Task",
  "Test Case",
  "User Story",
];

const useStyles = makeStyles({
  root: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    maxWidth: "400px",
    padding: "16px",
  },
  form: {
    gap: "2px",
  },
  search: {
    marginTop: "20px",
  },
});

function App() {
  const styles = useStyles();
  const [workItemTitle, setWorkItemTitle] = useState("");

  useEffect(() => {
    chrome.runtime.onMessage.addListener(
      (request: any, sender: any, sendResponse: any) => {
        console.log(
          sender.tab
            ? "from a content script:" + sender.tab.url
            : "from the extension"
        );
        console.log(request);
      }
    );
  }, []);

  const search = () => {
    console.log("Form submitted");
    console.log("Work Item Title:", workItemTitle);
  };

  return (
    <div className={styles.root}>
      <Title2>Azure DevOps Parent Finder</Title2>
      <form className={styles.form} onSubmit={search}>
        <Field label="Work Item Title">
          <Input
            value={workItemTitle}
            onChange={(event) => setWorkItemTitle(event.target.value)}
          />
        </Field>
        <Field label="Work Item Description">
          <Textarea placeholder="Optional" />
        </Field>
        <Field label="Work Item Type">
          <Dropdown multiselect={true} placeholder="Select a work item type">
            <Option key="all">Select All</Option>
            {workItemTypes.map((option) => (
              <Option key={option}>{option}</Option>
            ))}
          </Dropdown>
        </Field>
        <Button appearance="primary" className={styles.search} onClick={search}>
          Search
        </Button>
      </form>
    </div>
  );
}

export default App;
