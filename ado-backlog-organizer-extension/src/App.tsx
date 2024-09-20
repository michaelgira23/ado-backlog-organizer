import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  Button,
  Divider,
  Dropdown,
  Field,
  InfoLabel,
  Input,
  LabelProps,
  Link,
  makeStyles,
  MessageBar,
  MessageBarBody,
  MessageBarTitle,
  Option,
  Spinner,
  Text,
  Textarea,
  Title2,
  Title3,
} from "@fluentui/react-components";
import { useEffect, useState } from "react";

// Production
const apiUrl =
  "https://adobacklogorganizerhackathon-a0gye4a5bbbte8fj.canadacentral-01.azurewebsites.net";

// Development
// const apiUrl = "http://localhost:8080";

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
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  formRow: {
    display: "flex",
    flexDirection: "row",
    gap: "4px",
  },
  accordion: {
    margin: 0,
    padding: 0,
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  lastFormField: {
    marginBottom: "16px",
  },
  search: {
    width: "100%",
  },
  resultsContainer: {
    marginTop: "20px",
    display: "flex",
    flexDirection: "column",
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

interface WorkItem {
  id: number;
  rev: number;
  fields: {
    "System.State": string;
    "System.Title": string;
  };
  linkUrl: string;
}

type Results =
  | {
      success: true;
      results: WorkItem[];
      totalItems: number;
    }
  | {
      success: false;
      error?: string;
    };

function App() {
  const styles = useStyles();

  // Form state
  const [workItemTitle, setWorkItemTitle] = useState("");
  const [workItemDescription, setWorkItemDescription] = useState("");
  // Display is used for the string that is displayed when dropdown is closed
  const [selectedWorkItemTypesDisplay, setSelectedWorkItemTypesDisplay] =
    useState("");
  const [selectedWorkItemTypes, setSelectedWorkItemTypes] = useState<string[]>(
    []
  );
  const [organizationName, setOrganizationName] = useState("");
  const [projectName, setProjectName] = useState("");
  const [areaPathName, setAreaPathName] = useState("");
  const [pat, setPat] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<Results | null>(null);

  function ResultItem({ result }: { result: any }) {
    return (
      <li>
        <div className={styles.resultsItem}>
          <span className={styles.resultId}>
            <Link href={result.linkUrl} target="_blank">
              {result.id}
            </Link>
          </span>
          <span className={styles.resultName}>
            {result.fields["System.Title"]}
          </span>
        </div>
        <Divider />
      </li>
    );
  }

  // Restore the state from local storage upon init
  useEffect(() => {
    try {
      const storedStateStr = localStorage.getItem("ADO-BACKLOG-ORGANIZER");
      if (storedStateStr) {
        const storedState = JSON.parse(storedStateStr);
        setWorkItemTitle(storedState.workItemTitle);
        setWorkItemDescription(storedState.workItemDescription);
        setSelectedWorkItemTypes(storedState.selectedWorkItemTypes);
        setSelectedWorkItemTypesDisplay(
          storedState.selectedWorkItemTypes.join(", ")
        );
        setOrganizationName(storedState.organizationName);
        setProjectName(storedState.projectName);
        setAreaPathName(storedState.areaPathName);
        setPat(storedState.pat);
      }

      const storedResultsStr = localStorage.getItem(
        "ADO-BACKLOG-ORGANIZER-RESULTS"
      );
      if (storedResultsStr) {
        const storedResults = JSON.parse(storedResultsStr);
        setResults(storedResults);
      }
    } catch (err) {
      console.error("Error loading state from local storage:", err);
    }
  }, []);

  // Save the state to local storage
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
        if (response.organization) {
          setOrganizationName(response.organization);
        }
        if (response.project) {
          setProjectName(response.project);
        }
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

    fetch(`${apiUrl}/suggestions`, {
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
    })
      .then((response) => response.json())
      .then((results) => {
        console.log("Results:", results);
        setResults(results);
        setIsLoading(false);
        localStorage.setItem(
          "ADO-BACKLOG-ORGANIZER-RESULTS",
          JSON.stringify(results)
        );
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setIsLoading(false);
        setError(`Error fetching data. Please try again later. (${error})`);
      });
  };

  const displayError =
    error || (results && !results.success ? results.error : undefined);

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
        <Field label="Parent Type">
          <Dropdown
            multiselect={true}
            value={selectedWorkItemTypesDisplay}
            selectedOptions={selectedWorkItemTypes}
            onOptionSelect={(event, data) => {
              setSelectedWorkItemTypes([...data.selectedOptions] as any);
              setSelectedWorkItemTypesDisplay(data.selectedOptions.join(", "));
            }}
            placeholder="Select work item type(s)"
          >
            {workItemTypes.map((option) => (
              <Option key={option}>{option}</Option>
            ))}
          </Dropdown>
        </Field>
        <Accordion collapsible>
          <AccordionItem value="">
            <AccordionHeader>Advanced Settings</AccordionHeader>
            <AccordionPanel className={styles.accordion}>
              <div className={styles.formRow}>
                <Field label="Organization Name">
                  <Input
                    placeholder="Organization Name (ex: msazure)"
                    value={organizationName}
                    onChange={(event) =>
                      setOrganizationName(event.target.value)
                    }
                  />
                </Field>
                <Field label="Project Name">
                  <Input
                    placeholder="Project Name (ex: One)"
                    value={projectName}
                    onChange={(event) => setProjectName(event.target.value)}
                  />
                </Field>
              </div>
              <Field label="Area Path">
                <Input
                  placeholder="Area Path (ex: One\Compute\CloudConsoles)"
                  value={areaPathName}
                  onChange={(event) => setAreaPathName(event.target.value)}
                />
              </Field>
              <Field
                label={
                  {
                    children: (_: unknown, props: LabelProps) => (
                      <InfoLabel
                        {...props}
                        info={
                          <>
                            A PAT is required to use this.{" "}
                            <Link
                              href="https://learn.microsoft.com/en-us/azure/devops/organizations/accounts/use-personal-access-tokens-to-authenticate?view=azure-devops&tabs=Windows "
                              target="_blank"
                            >
                              Learn how to generate one
                            </Link>
                          </>
                        }
                      >
                        Personal Access Token
                      </InfoLabel>
                    ),
                  } as any
                }
              >
                <Input
                  type="password"
                  value={pat}
                  onChange={(event) => setPat(event.target.value)}
                  className={styles.lastFormField}
                />
              </Field>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
        <Button
          appearance="primary"
          size="large"
          className={styles.search}
          onClick={search}
          disabled={isLoading}
          icon={isLoading ? <Spinner size="tiny" /> : undefined}
        >
          {isLoading ? "Combing the Backlog..." : "Search"}
        </Button>
      </form>

      {displayError && (
        <MessageBar intent="error">
          <MessageBarBody>
            <MessageBarTitle>Whoops!</MessageBarTitle>
            {displayError}
          </MessageBarBody>
        </MessageBar>
      )}

      {results && results.success && (
        <div className={styles.resultsContainer}>
          <Title3>Suggested Parents</Title3>
          <Text>
            Looked through <Text weight="bold">{results.totalItems}</Text> work
            items
          </Text>
          {results.results.length > 0 && (
            <ul className={styles.resultsList}>
              {results &&
                results.results.map((result: any) => (
                  <ResultItem result={result} />
                ))}
            </ul>
          )}
          {results.results.length === 0 && <Text>No results found</Text>}
        </div>
      )}
    </div>
  );
}

export default App;
