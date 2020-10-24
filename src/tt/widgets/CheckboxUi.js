import React, { useEffect, useState } from 'react';
import { label, resolveBoolean } from '../utils';

let counter = 0;

export default function CheckboxUi(props) {
  let { def, value, cx, action } = props;

  const [currentValue, setCurrentValue] = useState('');

  useEffect(() => setCurrentValue(value || def.defaultValue || ''), [def, value]);

  let id = 'CheckboxUi' + counter++;
  let name = 'CheckboxUi-name-' + counter++;
  let emptyClassName = currentValue ? '' : 'empty';
  //
  let editable = resolveBoolean(def, 'editable', cx, true);
  let editableClassName = editable ? '' : 'disabled';

  let onValue = def.onValue || 'true';
  let offValue = def.offValue || 'false';

  return render();

  function render() {
    console.log('currentValue:', currentValue);
    return (
      <div className={['CheckboxUi', emptyClassName, editableClassName].join(' ')}>
        {def.noLabel ? (
          ''
        ) : (
          <label htmlFor={id}>
            {label(def)}
            {def.mandatory ? '*' : ''}
          </label>
        )}

        <input
          disabled={!editable}
          type="checkbox"
          name={name}
          checked={value === onValue}
          onBlur={() => action('blur', { [def.name]: value })}
          onChange={(e) => {
            debugger;
            action('value', { [def.name]: e.target.checked ? onValue : offValue });
          }}
          className="form-check-input"
        />
      </div>
    );
  }
}
