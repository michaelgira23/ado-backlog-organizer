import {
  Button,
  Divider,
  Dropdown,
  Field,
  Input,
  Link,
  makeStyles,
  Option,
  Spinner,
  Textarea,
  Title2,
  Title3,
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

const exampleResults = [
  {
    id: 10000000,
    name: "Feature Title 1",
    link: "https://dev.azure.com/msazure/One/_workitems/edit/10000000/",
  },
  {
    id: 20000000,
    name: "Feature Title 2",
    link: "https://dev.azure.com/msazure/One/_workitems/edit/20000000/",
  },
  {
    id: 30000000,
    name: "Feature Title 3",
    link: "https://dev.azure.com/msazure/One/_workitems/edit/30000000/",
  },
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
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  search: {
    marginTop: "20px",
    width: "100%",
  },
  resultsList: {
    listStyleType: "none",
    margin: "0px",
    padding: "10px 0 0 0",
  },
  resultsItem: {
    margin: "10px 0 10px 0",
    fontSize: "16px",
  },
  resultId: {},
  resultName: {
    paddingLeft: "15px",
  },
});

function App() {
  const styles = useStyles();

  // Form state
  const [workItemTitle, setWorkItemTitle] = useState("");
  const [workItemDescription, setWorkItemDescription] = useState("");
  const [selectedWorkItemTypes, setSelectedWorkItemTypes] = useState<string[]>(
    []
  );
  const [organizationName, setOrganizationName] = useState("");
  const [projectName, setProjectName] = useState("");
  const [areaPathName, setAreaPathName] = useState("");
  const [pat, setPat] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<any[]>([]);

  function ResultItem({ result }: { result: any }) {
    return (
      <li>
        <div className={styles.resultsItem}>
          <span className={styles.resultId}>
            <Link href={result.linkUrl}>{result.id}</Link>
          </span>
          <span className={styles.resultName}>
            {result.fields["System.Title"]}
          </span>
        </div>
        <Divider />
      </li>
    );
  }

  useEffect(() => {
    try {
      const storedStateStr = localStorage.getItem("ADO-BACKLOG-ORGANIZER");
      if (storedStateStr) {
        const storedState = JSON.parse(storedStateStr);
        setWorkItemTitle(storedState.workItemTitle);
        setWorkItemDescription(storedState.workItemDescription);
        setSelectedWorkItemTypes(storedState.selectedWorkItemTypes);
        setOrganizationName(storedState.organizationName);
        setProjectName(storedState.projectName);
        setAreaPathName(storedState.areaPathName);
        setPat(storedState.pat);
      }
    } catch (err) {
      console.error("Error loading state from local storage:", err);
    }
  }, []);

  useEffect(() => {
    try {
      const state = {
        workItemTitle,
        workItemDescription,
        selectedWorkItemTypes,
        organizationName,
        projectName,
        areaPathName,
        pat,
      };
      localStorage.setItem("ADO-BACKLOG-ORGANIZER", JSON.stringify(state));
    } catch (err) {
      console.error("Error saving state to local storage:", err);
    }
  }, [
    workItemTitle,
    workItemDescription,
    selectedWorkItemTypes,
    organizationName,
    projectName,
    areaPathName,
    pat,
  ]);

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs: any) => {
      chrome.tabs.sendMessage(tabs[0].id, "get-params", (response: any) => {
        // do something with the response if you want.
        console.log(response);
        setOrganizationName(response.organization);
        setProjectName(response.project);
      });
    });
  }, []);

  const search = () => {
    console.log("Form submitted");
    console.log("Work Item Title:", workItemTitle);
    console.log("Work Item Description:", workItemDescription);
    console.log("Selected Work Item Types:", selectedWorkItemTypes);
    console.log("Organization Name:", organizationName);
    console.log("Project Name:", projectName);
    console.log("Area Path Name:", areaPathName);

    const workItemBitArray = workItemTypes.map((type) =>
      selectedWorkItemTypes.includes(type) ? 1 : 0
    );

    setIsLoading(true);
    setError(null);

    // Mock backend for now
    // setTimeout(() => {
    //   setResults(exampleResults);
    //   setIsLoading(false);
    // }, 5000);

    fetch(
      "https://adobacklogorganizerhackathon-a0gye4a5bbbte8fj.canadacentral-01.azurewebsites.net/suggestions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          AccessToken: pat,
          OrganizationName: organizationName,
          ProjectName: projectName,
          WorkItemTitle: workItemTitle,
          WorkItemDescription: workItemDescription,
          WorkItemTypes: workItemBitArray,
          AreaPath: areaPathName,
        }),
      }
    )
      .then((response) => response.json())
      .then(({ results }) => {
        if (Array.isArray(results)) {
          setResults(results);
        }
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setIsLoading(false);
        setError(`Error fetching data. Please try again later. (${error})`);
      });
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
        {/* <Field label="Work Item Description">
          <Textarea
            placeholder="Optional Description"
            value={workItemDescription}
            onChange={(event) => setWorkItemDescription(event.target.value)}
          />
        </Field> */}
        <Field label="Work Item Type">
          <Dropdown
            multiselect={true}
            selectedOptions={selectedWorkItemTypes}
            onOptionSelect={(event, data) =>
              setSelectedWorkItemTypes(data.selectedOptions as any)
            }
            placeholder="Select work item type(s)"
          >
            {/* <Option key="all">All Types</Option> */}
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
            value={projectName}
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
        <Field label="Personal Access Token">
          <Input
            type="password"
            value={pat}
            onChange={(event) => setPat(event.target.value)}
          />
        </Field>
        <Button
          appearance="primary"
          size="large"
          className={styles.search}
          onClick={search}
          disabled={isLoading}
        >
          {isLoading ? "Loading..." : "Search"}
        </Button>
      </form>

      {isLoading && <Spinner label="Good things come to those who wait..." />}

      {error && <div>Error: {error}</div>}

      {results && results.length > 0 && (
        <div>
          <Title3>Suggested Parents</Title3>
          <ul className={styles.resultsList}>
            {results &&
              results.map((result: any) => <ResultItem result={result} />)}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
