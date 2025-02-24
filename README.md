# roadmap2mermaid
convert github project roadmap to a mermaid.md gantt diagram with github actions - github actions learning
> https://devopsjournal.io/blog/2022/11/28/github-graphql-queries

get cli
https://cli.github.com/

```
gh auth login --scopes "project"

> ? Where do you use GitHub? GitHub.com

> ? What is your preferred protocol for Git operations on this host? HTTPS

> ? Authenticate Git with your GitHub credentials? No

> ? How would you like to authenticate GitHub CLI? Paste an authentication token

> Tip: you can generate a Personal Access Token here https://github.com/settings/tokens

> The minimum required scopes are 'repo', 'read:org'.

> ? Paste your authentication token: - gh config set -h github.com git_protocol https

> ✓ Configured git protocol

> ✓ Logged in as ************
```

$query="query { organization(login: ""$organizationName"") { projectsV2(first: 100) { edges { node { id } } } } }"