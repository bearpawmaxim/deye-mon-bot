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
  return `# REST command configuration (add to configuration.yaml)
rest_command:
  update_grid_power:
    url: "${baseUrl}/api/ext-data/grid-power"
    method: POST
    headers:
      Authorization: "Bearer ${apiToken}"
      Content-Type: "application/json"
    payload: >
      {"grid_power": {"state": {{ power_state | bool | lower }}}}

# Automation to push grid power state to external API
# Replace sensor.inverter_work_state with your actual inverter/grid sensor entity ID.
# Adjust the state logic based on your sensor values (offgrid/bypass/etc).
automation:
  - alias: "Push Grid Power State to API"
    description: "Send grid power availability to external monitoring system"
    triggers:
      - entity_id: sensor.inverter_work_state  # Replace with your sensor
        trigger: state
    actions:
      - data:
          power_state: >
            {% if states('sensor.inverter_work_state') == 'offgrid' %}
              false
            {% elif states('sensor.inverter_work_state') == 'bypass' %}
              true
            {% else %}
              false
            {% endif %}
        action: rest_command.update_grid_power
    mode: single`;
};


export const integrationNotes = {
  curl: {
    description: 'Use this cURL command to send grid power state to the API:',
    note: 'Set "state" to true when grid is available, false when grid is down.',
  },
  homeAssistant: {
    description: 'Add this automation to your Home Assistant configuration.yaml or automations.yaml:',
    note: 'Replace sensor.inverter_work_state with your actual inverter/grid sensor entity ID. Adjust the state logic based on your sensor values (offgrid/bypass/etc).',
  },
};

