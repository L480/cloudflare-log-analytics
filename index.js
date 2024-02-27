export default {
    async tail(events, env, ctx) {
        const tokenEndpoint = 'https://login.microsoftonline.com/' + env.ARM_TENANT_ID + '/oauth2/v2.0/token';
        const tokenBody = 'client_id=' + env.ARM_CLIENT_ID + '&scope=https://monitor.azure.com/.default&client_secret=' + env.ARM_CLIENT_SECRET + '&grant_type=client_credentials';
        const ingestEndpoint = env.DCE_URL;

        /**
         * gatherResponse awaits and returns a response body as a string.
         * Use await gatherResponse(..) in an async function to get the response body
         * @param {Response} response
         */
        async function gatherResponse(response) {
            const { headers } = response;
            const contentType = headers.get('content-type') || '';
            if (contentType.includes('application/json')) {
                return await response.json();
            }
            return response.text();
        }

        // Get access token from service principal (client credentials flow)
        const tokenRequest = await fetch(tokenEndpoint, {
            body: tokenBody,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        });
        const tokenResponse = await gatherResponse(tokenRequest);
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
        const ingestResponse = await gatherResponse(ingestRequest);
        if (ingestRequest.status == 200) {
            console.log('Ingested:', JSON.stringify(events));
        } else {
            console.error(ingestResponse);
        }
    },
};