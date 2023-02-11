// 1.
// let element =
//   React.createElement(
//     // The first argument is the element's `type`
//     'a',

//     // The second argument is the element's `props`
//     { href: 'https://xkcd.com/222/' },

//     // Any further arguments, if given, are merged into to
//     // `props` under the name `children`.
//     React.createElement(
//       'img',
//       {
//         src: "https://imgs.xkcd.com/comics/random_number.png",
//         alt: "RFC 1149.5 specifies 4 as the standard IEEE-vetted random number.",
//       }
//     ),
//     React.createElement(
//       'span',
//       null,
//       'By Randall Munroe',
//     )
//   )

// // Try logging different parts of the `element` object
// console.log(element.props.children[0].type)
// console.log(element.props.children[1].props.children)

// ReactDOM.render(
//   element,
//   document.getElementById('root')
// )


// 2. Octokit (FAILED)
// const { Octokit } = require("@octokit/rest");
// const fs = require("fs");

// async function uploadFile(owner, repo, path, content) {
//   const octokit = new Octokit({
//     auth: "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"
//   });

//   const base64Content = Buffer.from(content).toString("base64");

//   const response = await octokit.repos.createOrUpdateFileContents({
//     owner,
//     repo,
//     path,
//     message: "Uploading a file using Octokit",
//     content: base64Content,
//     branch: "main"
//   });

//   console.log(response.data);
// }

// const content = fs.readFileSync("/Users/qiyuanli/Documents/ScribeAR/React/JoniLee.txt", "utf-8");
// uploadFile("JoniLi99", "DomainWordExtractor", "JoniLee.txt", content);
// console.log(content);



// // 3.
// const { Octokit } = require("@octokit/rest");
// const fs = require("fs");

// async function uploadFile(owner, repo, path, content) {
//   const octokit = new Octokit({
//     auth: "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"
//   });

//   // First, get the file's current SHA
//   const { data: fileData } = await octokit.repos.getContent({
//     owner,
//     repo,
//     path,
//     ref: "main"
//   });
//   const sha = fileData.sha;

//   // Update the file's contents
//   const base64Content = Buffer.from(content).toString("base64");
//   const response = await octokit.repos.createOrUpdateFileContents({
//     owner,
//     repo,
//     path,
//     message: "Uploading a file using Octokit",
//     content: base64Content,
//     sha,
//     branch: "main"
//   });

//   console.log(response.data);
// }

// const content = fs.readFileSync("DraftOfText_4.txt", "utf-8");
// uploadFile("JoniLi99", "DomainWordExtractor", "DraftOfText_4.txt", content);



// const { Octokit } = require("@octokit/rest");
// const fs = require("fs");

// async function uploadFile(owner, repo, path, content) {
//   const octokit = new Octokit({
//     auth: "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"
//   });

//   const response = await octokit.repos.createOrUpdateFileContents({
//     owner,
//     repo,
//     path,
//     message: "Uploading a file using Octokit",
//     content: content,
//     branch: "main"
//   });

//   console.log(response.data);
// }

// const uploadButton = document.getElementById("upload-button");

// uploadButton.addEventListener("click", () => {
//   fs.readFile("/Users/qiyuanli/Documents/ScribeAR/React/biology_index.pdf", "base64", (err, content) => {
//     if (err) {
//       console.error(err);
//       return;
//     }

//     uploadFile("JoniLi99", "DomainWordExtractor", "Joni.txt", content);
//   });
// });



// const axios = require('axios');

// async function getFileContent(repo, path) {
//   try {
//     const response = await axios.get(`https://api.github.com/repos/${repo}/contents/${path}`);
//     const content = Buffer.from(response.data.content, 'base64').toString();
//     console.log(content);
//   } catch (error) {
//     console.error(error);
//   }
// }

// getFileContent('JoniLi99/DomainWordExtractor', 'Joni.txt');



// CORRECT SOLUTION !!!!!
const axios = require("axios");
const fs = require("fs");

async function uploadFile(filePath, repo, owner, branch, token) {
  // Read the contents of the file
  const content = fs.readFileSync(filePath, "utf-8");
  
  // Encode the contents of the file as a base64 string
  // const encodedContent = Buffer.from(content).toString("base64");

  // Get the SHA of the latest commit on the branch
  const latestCommitResponse = await axios.get(
    `https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${branch}`,
    { headers: { Authorization: `Token ${token}` } }
  );
  const latestCommitSha = latestCommitResponse.data.object.sha;

  // Create a new tree with the file
  const newTreeResponse = await axios.post(
    `https://api.github.com/repos/${owner}/${repo}/git/trees`,
    {
      base_tree: latestCommitSha,
      tree: [
        {
          path: filePath,
          mode: "100644",
          type: "blob",
          content: content
        }
      ]
    },
    { headers: { Authorization: `Token ${token}` } }
  );
  const newTreeSha = newTreeResponse.data.sha;

  // Create a new commit with the new tree
  const newCommitResponse = await axios.post(
    `https://api.github.com/repos/${owner}/${repo}/git/commits`,
    {
      message: "Add file",
      tree: newTreeSha,
      parents: [latestCommitSha]
    },
    { headers: { Authorization: `Token ${token}` } }
  );
  const newCommitSha = newCommitResponse.data.sha;

  // Update the branch to point to the new commit
  await axios.patch(
    `https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${branch}`,
    { sha: newCommitSha },
    { headers: { Authorization: `Token ${token}` } }
  );
}

uploadFile(
  "Joni.txt",
  "DomainWordExtractor",
  "JoniLi99",
  "main",
  "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"
);



// // const axios = require("axios");
// // const fs = require("fs");

// // The rest of the `uploadFile` function is the same as in your code

// // Get references to the file input and upload button elements
// const fileInput = document.getElementById("fileInput");
// const uploadButton = document.getElementById("uploadButton");

// // Add an event listener to the upload button that calls the `uploadFile` function
// uploadButton.addEventListener("click", async () => {
//   // Get the file path from the file input
//   const filePath = fileInput.files[0].name;

//   // Call the `uploadFile` function with the file path and other arguments
//   uploadFile(
//     filePath,
//     "DomainWordExtractor",
//     "JoniLi99",
//     "main",
//     "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"
//   );
// });



// const fileInput = document.getElementById("fileInput");
// const uploadButton = document.getElementById("uploadButton");

// // Add an event listener to the upload button that calls the `uploadFile` function
// uploadButton.addEventListener("click", async () => {
//   // Get the file from the file input
//   const file = fileInput.files[0];

//   // Encode the file as a base64 string
//   const reader = new FileReader();
//   reader.readAsDataURL(file);
//   reader.onload = function() {
//     const encodedFile = reader.result.split(',')[1];

//     // Send a POST request to the GitHub API to upload the file
//     const xhr = new XMLHttpRequest();
//     xhr.open("POST", `https://api.github.com/repos/JoniLi99/DomainWordExtractor/contents/${file.name}`, true);
//     xhr.setRequestHeader("Authorization", "Token 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");
//     xhr.setRequestHeader("Content-Type", "application/json");
//     xhr.onreadystatechange = function() {
//       if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 201) {
//         console.log("File uploaded successfully");
//       }
//     };
//     xhr.send(JSON.stringify({
//       message: "Upload file",
//       content: encodedFile,
//       branch: "main"
//     }));
//   };
// });




// const fileInput = document.getElementById("fileInput");
// const uploadButton = document.getElementById("uploadButton");

// // Add an event listener to the upload button that calls the `uploadFile` function
// uploadButton.addEventListener("click", async () => {
//   // Get the file from the file input
//   const file = fileInput.files[0];

//   // Encode the file as a base64 string
//   const reader = new FileReader();
//   reader.readAsDataURL(file);
//   reader.onload = function() {
//     const encodedFile = reader.result.split(',')[1];

//     // Send a POST request to the GitHub API to upload the file
//     fetch(`https://api.github.com/repos/JoniLi99/DomainWordExtractor/contents/${file.name}`, {
//       method: "POST",
//       headers: {
//         "Authorization": "Token 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",
//         "Content-Type": "application/json"
//       },
//       body: JSON.stringify({
//         message: "Upload file",
//         content: encodedFile,
//         branch: "main"
//       })
//     })
//     .then(response => {
//       if (response.status === 201) {
//         console.log("File uploaded successfully");
//       }
//     })
//     .catch(error => {
//       console.error(error);
//     });
//   };
// });