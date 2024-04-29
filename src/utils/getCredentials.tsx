
export async function getCredentials() {
  const credentialsUrl = `${process.env.VC_REPO_URL}/api/list`;
  const response = await fetch(credentialsUrl);
  // console.log("Response status:", response.status);
  const credentialsNames = await response.json();
  // console.log("Credentials name:", credentialsNames)
  const credentialsResponse = getAvailableCredentials(credentialsNames);
  return credentialsResponse;
}

async function getAvailableCredentials(credentialsNames: string[]) {
  const PUBLIC_VC_REPO = process.env.VC_REPO_URL; // Ensure this environment variable is correctly set

  try {
    const credentialsResponse = await Promise.all(credentialsNames.map(async (credential) => {
      const response = await fetch(`${PUBLIC_VC_REPO}/api/vc/${credential}`);
      const data = await response.json();
      return {
        id: credential,
        title: data.type[1], // Assuming the structure of 'data' matches what you expect
        issuer: {
          name: data.issuer.name,
        },
        selectedFormat: "SD-JWT + VCDM",
        offer: data, // Assuming you want to store the entire response object as 'offer'
      };
    }));

    // Now 'credentialsResponse' is an array of the constructed credential objects
    // console.log(credentialsResponse);
    return credentialsResponse; // Return or set state with these credentials as needed
  } catch (error) {
    console.error("Failed to fetch credentials:", error);
    return []; // Return an empty array or handle the error as appropriate
  }
}
