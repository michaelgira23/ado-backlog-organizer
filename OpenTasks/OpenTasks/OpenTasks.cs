using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;

using Microsoft.TeamFoundation.WorkItemTracking.WebApi;
using Microsoft.TeamFoundation.WorkItemTracking.WebApi.Models;
using Microsoft.VisualStudio.Services.Common;
using Newtonsoft.Json;
using System.Text;

namespace OpenTasks
{
    public class OpenTasks
    {
        private readonly ILogger<OpenTasks> _logger;
        private Uri uri;

        public OpenTasks(ILogger<OpenTasks> logger)
        {
            _logger = logger;
        }

        [Function("OpenTasks")]
        public async Task<IActionResult> RunAsync([HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "openTasks")] HttpRequest req)
        {
            _logger.LogInformation("C# HTTP trigger function processed a request.");
            try
            {
                string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
                RequestModel requestModel = JsonConvert.DeserializeObject<RequestModel>(requestBody);
                var workItems = await this.QueryOpenBugs(requestModel).ConfigureAwait(false);
                return new OkObjectResult(workItems);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message, ex);
                return new ObjectResult(new { ErrorCode = ex.HResult, ErrorMessage = ex.Message })
                {
                    StatusCode = 500
                };

            }
        }


        public async Task<IList<WorkItem>> QueryOpenBugs(RequestModel requestModel)
        {
            var credentials = new VssBasicCredential(string.Empty, requestModel.AccessToken);
            string[] adoItemsDictionary = { "Bug", "Epic", "Feature", "Impediment", "Product Backlog Item", "Task", "Test Case", "User Story" };

            // [Bug, Epic, Feature, Impediment, Product Backlog Item, Task, Test Case, User Story]
            // [0,0,1,0,0,0,0,1]

            StringBuilder selectedADOitems = null;

            if (requestModel.items == null || requestModel.items.Count == 0)
            {
                selectedADOitems = new StringBuilder("('Feature', 'User Story', 'Epic', 'Task', 'Bug')");
            }
            else
            {
                selectedADOitems = new StringBuilder("(");
                for (int i = 0; i < requestModel.items.Count; i++)
                {
                    if (Convert.ToInt32(requestModel.items[i]) == 1) { 
                    selectedADOitems.Append("'").Append(adoItemsDictionary[i]).Append("'");

                        if (i < requestModel.items.Count-1)
                        {
                            selectedADOitems.Append(",");
                        }
                    }
                  
                }
                
                if (selectedADOitems.ToString()[selectedADOitems.Length-1] == ',')
                {
                    selectedADOitems.Remove(selectedADOitems.Length - 1, 1);
                }

                selectedADOitems.ToString().TrimEnd(',');
                selectedADOitems.Append(")");
            }

            // create a wiql object and build our query
            var wiql = new Wiql()
            {
                // NOTE: Even if other columns are specified, only the ID & URL are available in the WorkItemReference
                Query = "Select [Id] " +
                        "From WorkItems " +
                        "Where [Work Item Type] IN " +  selectedADOitems.ToString() + 
                        "And [System.TeamProject] = '" + requestModel.OrganizationName + "' " +
                        "And [System.State] <> 'Closed' " +
                        "Order By [State] Asc, [Changed Date] Desc",
            };

            this.uri = new Uri("https://dev.azure.com/" + requestModel.ProjectName);


            // create instance of work item tracking http client
            using (var httpClient = new WorkItemTrackingHttpClient(this.uri, credentials))
            {
                // execute the query to get the list of work items in the results
                var result = await httpClient.QueryByWiqlAsync(wiql).ConfigureAwait(false);
                var ids = result.WorkItems.Select(item => item.Id).ToArray();

                // some error handling
                if (ids.Length == 0)
                {
                    return Array.Empty<WorkItem>();
                }

                // build a list of the fields we want to see
                var fields = new[] { "System.Id", "System.Title", "System.State" };

                // get work items for the ids found in query
                return await httpClient.GetWorkItemsAsync(ids, fields, result.AsOf).ConfigureAwait(false);
            }
        }
    }
}

