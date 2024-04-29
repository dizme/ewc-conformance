import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { AvailableCredential } from '@/types/credentials';
import { getIssuerDid, getIssuerJwk } from './issuerDids';

const getOfferUrl = async (c: AvailableCredential) => {
  const public_vc_repo = process.env.VC_REPO_URL;
  const public_issuer = process.env.ISSUER_URL;

  // Enhanced error handling with try-catch
  try {
    const offer = { ...c.offer, id: uuidv4() };

    // Use async/await directly for fetching mapping
    let mapping;
    try {
      const response = await fetch(`${public_vc_repo}/api/mapping/${c.id}`);
      mapping = await response.json();
    } catch (error) {
      console.error('Failed to fetch mapping:', error);
      // Optionally handle or throw error
      throw new Error('Failed to fetch mapping');
    }

    const issuerDid = getIssuerDid(c.issuer.name);
    if (!issuerDid) throw new Error('Issuer DID not found');

    const issuanceKey = getIssuerJwk(c.issuer.name);
    if (!issuanceKey) throw new Error('Issuance key not found');

    // console.log('issuerDid', issuerDid);
    // console.log('issuanceKey', issuanceKey);
    // console.log('issuanceKey', JSON.stringify(issuanceKey));
    // console.log('mapping', mapping);

    // console.log('offer', offer);

    let payload = {
      'issuerDid': issuerDid,
      'issuanceKey': { "type": "local", "jwk": JSON.stringify(issuanceKey) },
      vc: offer,
      ...(mapping && {mapping}),
    };

    if (c.selectedFormat === "SD-JWT + VCDM") {
      payload['selectiveDisclosure'] = {
        "fields": {
          "credentialSubject": {
            sd: false,
            children: {
              fields: {}
            }
          }
        }
      };
      for (const key in offer.credentialSubject) {
        if (typeof offer.credentialSubject[key] === 'string') {
          payload.selectiveDisclosure.fields.credentialSubject.children.fields[key] = {
            sd: true
          };
        }
      }
    }

    const issueUrl = `${public_issuer}/openid4vc/${c.selectedFormat === "SD-JWT + VCDM" ? "sdjwt" : "jwt"}/issue`;
    return axios.post(issueUrl, payload);
  } catch (error) {
    console.error('Error generating offer URL:', error);
    throw error; // Rethrow or handle as needed
  }
};

export { getOfferUrl };
