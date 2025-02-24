// index.js
// requires Node.js built-in fetch (Node 18+). Otherwise, uncomment the next line and install node-fetch:
// const fetch = require('node-fetch');
const fs = require('fs');

// use GitHub token from environment variables or put token in place of 'secure' if running locally
const organisation = 'jbrun001';
const token = process.env.GITHUB_TOKEN || 'secure';

const headers = {
  "Authorization": `Bearer ${token}`,
  "Content-Type": "application/json"
};

const query = `
query {
  user(login: "${organisation}") {
    projectsV2(first: 10) {
      edges {
        node {
          title
          items(first: 100) {
            edges {
              node {
                id
                content {
                  ... on Issue {
                    id
                    title
                    state
                    assignees(first: 5) {
                      nodes {
                        login
                      }
                    }
                  }
                }
                fieldValues(first: 10) {
                  edges {
                    node {
                      __typename
                      ... on ProjectV2ItemFieldDateValue {
                        date
                      }
                      ... on ProjectV2ItemFieldSingleSelectValue {
                        name
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}`;

const body = JSON.stringify({ query });

async function main() {
  try {
    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: headers,
      body: body
    });

    if (!response.ok) {
      console.error("GraphQL query failed:", response.statusText);
      process.exit(1);
    }

    const jsonResponse = await response.json();

    // write the full JSON response to "testissues.json" for debugging
    fs.writeFileSync("testissues.json", JSON.stringify(jsonResponse, null, 2));

    // process each project and create a Mermaid Gantt chart file
    const projectsEdges = jsonResponse.data.user.projectsV2.edges;
    projectsEdges.forEach(projectEdge => {
      const projectTitle = projectEdge.node.title;
      // Remove spaces from the project title for the filename
      const projectFilename = projectTitle.replace(/\s+/g, "") + ".md";

      // build the Mermaid Gantt chart header wrapped in a Markdown code indicator
      let chart = "```mermaid\ngantt\n    dateFormat  YYYY-MM-DD\n\n";

      projectEdge.node.items.edges.forEach(itemEdge => {
        const item = itemEdge.node;
        if (item.content) {
          const issue = item.content;
          const issueTitle = issue.title;
          const issueState = issue.state;
          // map issue state to Mermaid task status
          const status = (issueState === "CLOSED") ? "done" : "active";

          const fields = item.fieldValues.edges;
          if (fields.length >= 3) {
            // the last three fields are: Kanban column, start date, end date
            // (kanbanColumn is available if needed)
            const kanbanColumn = fields[fields.length - 3].node.name;
            let startDate = fields[fields.length - 2].node.date;
            let endDate = fields[fields.length - 1].node.date;

            // substitute todays date if a date is missing
            const today = new Date().toISOString().split('T')[0];
            if (!startDate) startDate = today;
            if (!endDate) endDate = today;

            // append the issue as a task line in the Mermaid chart
            chart += `    [${issueTitle}] : ${status}, ${startDate}, ${endDate}\n`;
          }
        }
      });

      // Close the Mermaid code block
      chart += "```";

      // write the chart to a file named after the project with spaces removed
      fs.writeFileSync(projectFilename, chart);
      console.log(`Mermaid Gantt chart for project '${projectTitle}' exported to ${projectFilename}`);
    });
  } catch (error) {
    console.error("Error during GraphQL query:", error);
  }
}

main();
