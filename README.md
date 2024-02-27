# cloudflare-log-analytics

Ingests Cloudflare Logs to Azure Log Analytics Workspaces.

![Azure Portal](/images/azure-portal.png "Azure Portal")

This is a [Cloudflare Tail Worker](https://developers.cloudflare.com/workers/observability/logging/tail-workers/) that sends Cloudflare Workers logs to [Azure Log Analytics Workspaces/Azure Monitor Logs](https://learn.microsoft.com/en-us/azure/azure-monitor/logs/log-analytics-workspace-overview) through the [Logs Ingestion API in Azure Monitor](https://learn.microsoft.com/en-us/azure/azure-monitor/logs/logs-ingestion-api-overview).

## Prerequisites

- [Cloudflare Workers Paid Plan](https://developers.cloudflare.com/workers/platform/pricing/)
- Azure Subscription

## Setup

### Azure

- [Create a Microsoft Entra application](https://learn.microsoft.com/en-us/azure/azure-monitor/logs/tutorial-logs-ingestion-portal#create-azure-ad-application) to authenticate against the API.
- [Create a data collection endpoint (DCE)](https://learn.microsoft.com/en-us/azure/azure-monitor/logs/tutorial-logs-ingestion-portal#create-data-collection-endpoint) to receive data.
- [Create a custom table in a Log Analytics workspace](https://learn.microsoft.com/en-us/azure/azure-monitor/logs/tutorial-logs-ingestion-portal#create-new-table-in-log-analytics-workspace). This is the table you'll be sending data to. As part of this process, you will create a data collection rule (DCR) to direct the data to the target table.
- [Give the AD application access to the DCR](https://learn.microsoft.com/en-us/azure/azure-monitor/logs/tutorial-logs-ingestion-portal#assign-permissions-to-the-dcr).

### Cloudflare

- Set up a Worker in Cloudflare and add the [below](#environment-variables) `ARM_CLIENT_SECRET` environment variable as secret.
- Modify the rest of the [environment variables](#environment-variables) in [wrangler.toml](./wrangler.toml) and [deploy it to Cloudflare](https://developers.cloudflare.com/workers/wrangler/commands/#deploy).
- Add the following to the wrangler.toml file of the producer Worker:

    ```toml
    tail_consumers = [{service = "law-ingestion"}]
    ```

## Environment Variables

| Variable name     | Description                              | Example                                                                                                                                                                                                                                                                                                                                                                   |
| ----------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ARM_TENANT_ID     | Azure tenant ID                          | `40a009eb-76f8-4d32-bca3-893aaebd0f41`                                                                                                                                                                                                                                                                                                                                    |
| ARM_CLIENT_ID     | Client ID of Azure service principal     | `cd96fd2a-8b49-4df0-bd0c-8d396d97c259`                                                                                                                                                                                                                                                                                                                                    |
| ARM_CLIENT_SECRET | Client secret of Azure service principal | `fII8Q~FO.qbSmcpxpyZqfsbv.7nz46X4_4HutaHw`                                                                                                                                                                                                                                                                                                                                |
| DCE_URL           | Data Collection Endpoint URL             | `https://cloudflare-logging-asu8.westeurope-1.ingest.monitor.azure.com/dataCollectionRules/dcr-1e5cc3ed115842ecb647b43f4d8bafef/streams/Custom-CfLogging_CL?api-version=2023-01-01`<br> [*DCR immutable ID is only visible in JSON view!*](https://learn.microsoft.com/en-us/azure/azure-monitor/logs/tutorial-logs-ingestion-portal#collect-information-from-the-dcr) |