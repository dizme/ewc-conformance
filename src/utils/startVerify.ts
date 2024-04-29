import axios from 'axios';

const startVerify = async (credentialType: String, baseUrl: String) => {
  const public_verifier = process.env.VERIFIER_URL;

  // Enhanced error handling with try-catch
  try {
    const response = await axios.post(
        `${public_verifier}/openid4vc/verify`,
        {
          "request_credentials": [
              credentialType
          ]
        },
        {
          headers: {
            "successRedirectUri": `${baseUrl}/verify/callback/success/$id`,
            "errorRedirectUri": `${baseUrl}/verify/callback/error/$id`,
          },
        }
      );
    return response
  } catch (error) {
    console.error('Error generating offer URL:', error);
    throw error; // Rethrow or handle as needed
  }
};

export { startVerify };
