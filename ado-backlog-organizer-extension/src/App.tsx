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
  search: {
    marginTop: "20px",
  },
});

function App() {
  const styles = useStyles();

  return (
    <div className={styles.root}>
      <Title2>Azure DevOps Parent Finder</Title2>
      <Field label="Work Item Title">
        <Input />
      </Field>
      <Field label="Work Item Description">
        <Textarea placeholder="Optional" />
      </Field>
      <Field label="Work Item Type">
        <Dropdown multiselect={true} placeholder="Select a work item type">
          {workItemTypes.map((option) => (
            <Option key={option}>{option}</Option>
          ))}
        </Dropdown>
      </Field>
      <Button appearance="primary" className={styles.search}>
        Search
      </Button>
    </div>
  );
}

export default App;
