import { getApiBaseUrl } from "./uriUtils";

export interface IntegrationExample {
  curl: string;
  homeAssistant: string;
}

export const getCurlExample = (apiToken: string): string => {
  const baseUrl = getApiBaseUrl();
  return `curl -X POST ${baseUrl}/api/ext-data/grid-power \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${apiToken}" \\
  -d '{
    "grid_power": {
      "state": true
    }
  }'`;
};


export const getCurlExampleOneLine = (apiToken: string): string => {
  const baseUrl = getApiBaseUrl();
  return `curl -X POST ${baseUrl}/api/ext-data/grid-power -H "Content-Type: application/json" -H "Authorization: Bearer ${apiToken}" -d '{"grid_power": {"state": true}}'`;
};


export const getHomeAssistantExample = (apiToken: string): string => {
  const baseUrl = getApiBaseUrl();
  return `# Automation to push grid power state to external API
automation:
  - alias: "Push Grid Power State to API"
    description: "Send grid power availability to external monitoring system"
    trigger:
      - platform: state
        entity_id: binary_sensor.grid_power  # Replace with your grid sensor
    action:
      - service: rest_command.update_grid_power
        data:
          state: "{{ states('binary_sensor.grid_power') }}"

# REST command configuration (add to configuration.yaml)
rest_command:
  update_grid_power:
    url: "${baseUrl}/api/ext-data/grid-power"
    method: POST
    headers:
      Authorization: "Bearer ${apiToken}"
      Content-Type: "application/json"
    payload: >
      {
        "grid_power": {
          "state": {{ state | bool }}
        }
      }`;
};


export const integrationNotes = {
  curl: {
    description: 'Use this cURL command to send grid power state to the API:',
    note: 'Set "state" to true when grid is available, false when grid is down.',
  },
  homeAssistant: {
    description: 'Add this automation to your Home Assistant configuration.yaml or automations.yaml:',
    note: 'Replace binary_sensor.grid_power with your actual grid power sensor entity ID.',
  },
};

