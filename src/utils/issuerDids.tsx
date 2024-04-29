// TODO: This map cannot be hardcoded, it should be fetched from the DID db
const issuerDids = [
    {
        did: 'did:key:z6MkpM3yxNHfzRi9Ew4jsuNMqvtt3wzwPa91uLXzSWH73cG9',
        jwk:  {
            "kty": "OKP",
            "d": "QHew5n38fdxHCREcEQ9n8P-qVSni7rc2OsOJvhIhNKI",
            "crv": "Ed25519",
            "kid": "HAbI4fbhU4v2qjB8LOXFF5yNlalkXmj2yu-0X6GcGCQ",
            "x": "kv2-ve0SCubNAdQw75AtEQ_oikElpaWkE1m5PDSV2Mo"
          },
        name: 'InfoCert'
    },
]

const getIssuerDid = (name: string) => {
    const issuer = issuerDids.find((issuer) => issuer.name === name);
    // if issuer is not found, return empty string
    return issuer?.did || '';
}

const getIssuerJwk = (name: string) => {
    const issuer = issuerDids.find((issuer) => issuer.name === name);
    // if issuer is not found, return empty string
    return issuer?.jwk || {};
};

export { getIssuerDid, getIssuerJwk };