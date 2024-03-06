export default {
    async tail(events, env, ctx) {
        const tokenEndpoint = 'https://login.microsoftonline.com/' + env.ARM_TENANT_ID + '/oauth2/v2.0/token';
        const tokenBody = 'client_id=' + env.ARM_CLIENT_ID + '&scope=https://monitor.azure.com/.default&client_secret=' + env.ARM_CLIENT_SECRET + '&grant_type=client_credentials';
        const ingestEndpoint = env.DCE_URL;

        // Get access token from service principal (client credentials flow)
        const tokenRequest = await fetch(tokenEndpoint, {
            body: tokenBody,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        });
        const tokenResponse = await tokenRequest.json();
        if (tokenRequest.status != 200) {
            console.error(tokenResponse);
        }

        // Ingest logs
        const ingestRequest = await fetch(ingestEndpoint, {
            body: JSON.stringify(events),
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + tokenResponse.access_token,
                'Content-Type': 'application/json',
            }
        });
        const ingestResponse = await ingestRequest.json();
        if (ingestRequest.status == 200) {
            console.log('Ingested:', JSON.stringify(events));
        } else {
            console.error(ingestResponse);
        }
    },
};
