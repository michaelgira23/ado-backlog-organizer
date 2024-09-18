import {
  Button,
  Dropdown,
  Field,
  Input,
  makeStyles,
  Option,
  Textarea,
  Title2,
  Title3
} from "@fluentui/react-components";
import { useState } from "react";

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
    padding: "16px"
  },
  form: {
    gap: "2px"
  },
  search: {
    marginTop: "20px"
  }
});

function App() {
  const styles = useStyles();
  const [workItemTitle, setWorkItemTitle] = useState("");
  const [workItemDescription, setWorkItemDescription] = useState("");
  const [selectedWorkItemTypes, setSelectedWorkItemTypes] = useState([]);
  const [organizationName, setOrganizationName] = useState("");
  const [projectName, setProjectName] = useState("");
  const [areaPathName, setAreaPathName] = useState("");

  const search = () => {
    console.log("Form submitted");
    console.log("Work Item Title:", workItemTitle);
    console.log("Work Item Description:", workItemDescription);
    console.log("Selected Work Item Types:", workItemTypes);
    console.log("Organization Name:", organizationName);
    console.log("Project Name:", projectName);
    console.log("Area Path Name:", areaPathName);
  };

  return (
    <div className={styles.root}>
      <Title2>Azure DevOps Parent Finder</Title2>
      <form className={styles.form} onSubmit={search}>
        <Field label="Work Item Title">
          <Input
            placeholder="Title"
            value={workItemTitle}
            onChange={(event) => setWorkItemTitle(event.target.value)}
          />
        </Field>
        <Field label="Work Item Description">
          <Input
            placeholder="Optional Description"
            value={workItemDescription}
            onChange={(event) => setWorkItemDescription(event.target.value)}
          />
        </Field>
        <Field label="Work Item Type">
          <Dropdown
            multiselect={true}
            placeholder="Select work item type(s)"
          >
            
            <Option key="all">All Types</Option>
            {workItemTypes.map((option) => (
              <Option key={option}>{option}</Option>
            ))}
          </Dropdown>
        </Field>
        <Field label="Organization Name">
          <Input
            placeholder="Organization Name (ex: msazure)"
            value={organizationName}
            onChange={(event) => setOrganizationName(event.target.value)}
          />
        </Field>
        <Field label="Project Name">
          <Input
            placeholder="Project Name (ex: One)"
            value={organizationName}
            onChange={(event) => setProjectName(event.target.value)}
          />
        </Field>
        <Field label="Area Path">
          <Input
            placeholder="Area Path (ex: One\Compute\CloudConsoles)"
            value={areaPathName}
            onChange={(event) => setAreaPathName(event.target.value)}
          />
        </Field>
        <Button appearance="primary" className={styles.search} onClick={search}>
          Search
        </Button>
      </form>

      <div className="resultsSection">
        <Title3>Suggested Parents</Title3>
      </div>

    </div>
  );
}

export default App;
