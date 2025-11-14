import { Completion, CompletionContext, CompletionResult } from "@codemirror/autocomplete";

const variables: Record<string, Array<string>> = {
  "station": ["current", "previous", "name", "battery_capacity",
    "grid_interconnection_type", "connection_status"],
  "stations": ["current", "previous", "name", "battery_capacity",
    "grid_interconnection_type", "connection_status"],
  "current": ["station_id", "battery_power", "battery_soc", "charge_power", 
    "code", "consumption_power", "discharge_power", "generation_power", 
    "grid_power", "irradiate_intensity", "last_update_time", "msg", 
    "purchase_power", "request_id", "wire_power", "name", 
    "grid_interconnection_type", "connection_status"],
  "previous": ["station_id", "battery_power", "battery_soc", "charge_power",
    "code", "consumption_power", "discharge_power", "generation_power",
    "grid_power", "irradiate_intensity", "last_update_time", "msg",
    "purchase_power", "request_id", "wire_power"],
};

export function jinja2Autocomplete(context: CompletionContext): CompletionResult | null {
  const word = context.matchBefore(/\w*/);
  if (!word || (word.from === word.to && !context.explicit)) {
    return null;
  }

  const suggestions: Completion[] = [];

  Object.keys(variables).forEach((variable) => {
    suggestions.push({
      label: variable,
      type: "variable",
    });
  });

  const line = context.state.doc.lineAt(context.pos).text;

  const matchArray = line.match(/(\w+)\.(\w*)$/);
  if (matchArray) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, variable, partialMember] = matchArray;
    if (variables[variable]) {
      variables[variable].forEach((member) => {
        if (member.startsWith(partialMember)) {
          suggestions.push({
            label: `${member}`,
            type: "property",
          });
        }
      });
    }
  }

  const matchLoop = line.match(/for\s+(\w+)\s+in\s+(\w+)/);
  if (matchLoop) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, loopVar, arrayVar] = matchLoop;
    if (variables[arrayVar]) {
      variables[arrayVar].forEach((member) => {
        suggestions.push({
          label: `${loopVar}.${member}`,
          type: "property",
        });
      });
    }
  }

  return {
    from: word.from,
    options: suggestions,
  };
}
