import React from 'react';
import { label, resolveBoolean } from '../utils';

let counter = 0;

const directTypes = ['password', 'text', 'date', 'month', 'time', 'datetime-local', 'color'];

export default function InputUi({ def, value, cx, action, validate }) {
  let id = 'InputUi' + counter++;

  let currentValue = value || def.defaultValue || '';
  let emptyClassName = currentValue ? '' : 'empty';
  let validationResult = processValidation();
  let validationClassName = 'ttValidation' + (validationResult ? ' ' + validationResult[0] : ' hide');
  let validationMessage = validationResult ? validationResult[1] : '';

  let type = def.inputType || 'text';
  //
  let editable = resolveBoolean(def, 'editable', cx, true);
  let editableClassName = editable ? '' : 'disabled';

  console.log('currentValue', currentValue);
  return (
    <div className={['InputUi', emptyClassName, validationClassName, editableClassName].join(' ')}>
      {def.noLabel ? (
        ''
      ) : (
        <label htmlFor={id}>
          {label(def)}
          {def.mandatory ? '*' : ''}
        </label>
      )}
      <input
        autoComplete={'off'}
        id={id}
        type={directTypes.includes(type) ? type : 'text'}
        value={currentValue}
        onChange={(e) => action('value', { [def.name]: e.target.value })}
        onBlur={() => action('blur', { [def.name]: value })}
        disabled={!editable}
      />
      <div className={validationClassName}>{validationMessage}</div>
    </div>
  );

  function processValidation() {
    if (typeof validate === 'function') {
      return validate(currentValue, cx);
    }
    if (def.inputType === 'number' && isNaN(+currentValue)) {
      return [false, 'Please_provide_a_number'];
    }
  }
}
