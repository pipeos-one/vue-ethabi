export function pfunctionColorClass(gapi) {
  let colorClass = '';
  if (gapi.type === 'event') {
    colorClass = 'event';
  } else if (gapi.payable) {
    colorClass = 'payable';
  } else if (!gapi.constant) {
    colorClass = 'nonconstant';
  }
  return colorClass;
}

export const JsonArrayToString = function (json) {
  let functionArgs = JSON.stringify(json);
  functionArgs = functionArgs.substring(
    1,
    functionArgs.length - 1,
  ).replace(/\\"/g, '"');
  return functionArgs;
};

export const inputTypes = {
  int: 'number',
  bool: 'checkbox',
  address: 'text',
  bytes: 'text',
};

export const getInputType = (type) => {
  const valueType = Object.keys(inputTypes).find((maintype) => {
    if (type.includes(maintype)) return maintype;
  });
  if (!valueType) return 'text';
  return inputTypes[valueType];
};

export const validateArg = (value, type, name, components=[]) => {
  const errorMessages = [];

  if (type.indexOf('int') > -1) {
    value = parseInt(value);
    if (!value && value !== 0) {
      errorMessages.push(`${name} requires a value of type "${type}"`);
    }
  } else if (type === 'tuple') {
    components.forEach((comp) => {
      if (value[comp.name] === undefined) {
        errorMessages.push(`${name} missing field: ${comp.name}`);
      }
    });
    try {
      JSON.stringify(value);
    } catch (e) {
      errorMessages.push(`${name} does not have a valid JSON format`);
    }
  } else {
    if (!value) {
      errorMessages.push(`${name} requires a value`);
    }
  }

  return {value, errorMessages};
};
