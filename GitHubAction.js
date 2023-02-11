const { Octokit } = require("@octokit/rest");
const fs = require("fs");

async function uploadFile(owner, repo, path, content) {
  const octokit = new Octokit({
    auth: "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"
  });

  const base64Content = Buffer.from(content).toString("base64");

  const response = await octokit.repos.createOrUpdateFileContents({
    owner,
    repo,
    path,
    message: "Uploading a file using Octokit",
    content: base64Content,
    branch: "main"
  });

  console.log(response.data);
}

const content = fs.readFileSync("/biology_index.pdf", "utf-8");
uploadFile("JoniLi99", "DomainWordExtractor", "/biology_index.pdf", content);
console.log(content);