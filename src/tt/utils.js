import React from 'react';
import InputUi from './widgets/InputUi';

const WIDGET_MAP = {};
const FUNCTION_MAP = {};

export function toList(data) {
  return !data
    ? []
    : Array.isArray(data)
    ? data
    : !data.table
    ? []
    : data.table.map((row) => {
        var nrow = {};
        row.map((e, index) => (nrow[data.header[index]] = e));
        return nrow;
      });
}

export function toFirst(data) {
  return toList(data)[0];
}

export function modulo(number, divisor) {
  return number % divisor;
}

export function resolveBoolean(def, propertyName, cx, defaultValue) {
  if (!def || !propertyName) {
    return defaultValue;
  }
  const a = def[propertyName];
  if (typeof a === 'boolean') {
    return a;
  }
  if (a === 'true') {
    return true;
  }
  if (a === 'false') {
    return false;
  }
  if (typeof a === 'function') {
    return !!a(cx);
  }
  return defaultValue;
}

export function resolveFunction(arg0, default0) {
  let r;
  if (typeof arg0 === 'function') {
    r = arg0;
  } else if (typeof arg0 === 'string') {
    r = FUNCTION_MAP[arg0];
  }
  return r || default0;
}

export function registerFunction(name, fun) {
  FUNCTION_MAP[name] = fun;
}

let _labelFun;

export function label() {
  if (typeof _labelFun === 'function') {
    return _labelFun.apply(null, arguments);
  } else {
    return ttLabel.apply(null, arguments);
  }
}

export function registerLabel(fun) {
  _labelFun = fun;
}

export function ttLabel(arg, value, ttdef) {
  let template;
  if (arg === undefined) {
    return '<nolabel>';
  }
  if (typeof arg === 'string') {
    template = arg;
  } else {
    if (typeof arg.label === 'function') {
      return arg.label({ value, ttdef });
    }
    template = arg.label || arg.name || '<nolabel>';
  }
  return texting(template, value);
}

export function texting(templateString, parameters) {
  parameters = parameters || {};
  for (const [key, value] of Object.entries(parameters)) {
    if (value !== undefined) {
      const r = new RegExp('\\:' + key, 'g');
      templateString = templateString.replace(r, value);
    }
  }
  return templateString;
}

export const noop = () => undefined;

export function arrayCompare(arr1, arr2) {
  const min = Math.min(arr1.length, arr2.length);
  let m = 'arr equal: ';
  for (let i = 0; i < min; i++) {
    m += Object.is(arr1[i], arr2[i]);
  }
  console.log(m);
}

export function registerUiType(uiType, uiFun) {
  if (typeof uiType === 'object') {
    Object.entries(uiType).forEach(([uiType, uiFun]) => (WIDGET_MAP[uiType] = uiFun));
  } else {
    WIDGET_MAP[uiType] = uiFun;
  }
  return WIDGET_MAP;
}

export function resolveUiType(uiType) {
  return WIDGET_MAP[uiType];
}

export function renderWidget({ def, value, action, cx }) {
  const uiTypeFun = WIDGET_MAP[def.uiType];

  return typeof uiTypeFun === 'function' ? (
    <div>{React.createElement(uiTypeFun, { def, value, action, cx }, null)}</div>
  ) : (
    <div>
      <InputUi def={def} value={value} action={action} cx={cx} />
    </div>
  );
}

export function randomName() {
  return 'name' + Math.floor(Math.random() * 100000);
}
