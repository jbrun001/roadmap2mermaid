const fs = require('fs').promises; // Using promises for async file operations

// Helper to format a Date object into YYYY-MM-DD
function formatDateObj(date) {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Helper to format a date string into YYYY-MM-DD
function formatDate(dateString) {
  return formatDateObj(new Date(dateString));
}

// Get today's date in YYYY-MM-DD format
function getToday() {
  return formatDateObj(new Date());
}

async function generateDiagram() {
  try {
    // Read the exported issues JSON file
    const rawData = await fs.readFile('issues.json', 'utf-8');
    const issues = JSON.parse(rawData);

    // Ensure that issues is an array
    if (!Array.isArray(issues)) {
      throw new Error('issues.json must be an array of issue objects');
    }

    // Construct the Mermaid Gantt chart header
    let mermaid = '```mermaid\ngantt\n';
    mermaid += '    dateFormat  YYYY-MM-DD\n'
    mermaid += '    excludes    sunday\n'
    mermaid += '    title GitHub Project foodmanager Gantt Chart\n\n';

    // Process each issue using roadmap dates if available
    mermaid += '    section Roadmap Issues\n';
    issues.forEach(issue => {
      // Use roadmap fields if available; otherwise, fall back
      const startDate = issue.roadmap_start_date
        ? formatDate(issue.roadmap_start_date)
        : formatDate(issue.created_at);

      let endDate;
      if (issue.roadmap_end_date) {
        endDate = formatDate(issue.roadmap_end_date);
      } else if (issue.state === 'closed' && issue.closed_at) {
        endDate = formatDate(issue.closed_at);
      } else {
        endDate = getToday();
      }

      // Clean up the title to avoid syntax issues in Mermaid
      const title = issue.title.replace(/"/g, "'");
      mermaid += `    Issue #${issue.number} "${title}" : issue${issue.number}, ${startDate}, ${endDate}\n`;
    });

    mermaid += '\n```';

    // Write the Mermaid diagram to a file (e.g., diagram.md)
    await fs.writeFile('diagram.md', mermaid);
    console.log('Mermaid diagram generated in diagram.md');
  } catch (error) {
    console.error('Error generating Mermaid diagram:', error);
    process.exit(1);
  }
}

generateDiagram();
