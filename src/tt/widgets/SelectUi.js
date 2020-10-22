import React, { useEffect, useState } from 'react';
import { label, resolveBoolean, toList } from '../utils';
import { Progress } from '../uis';
import { processService } from '../api';

let counter = 0;

export default function SelectUi(props) {
  let { def, value, cx, action } = props;

  const [values, setValues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentValue, setCurrentValue] = useState('');

  useEffect(() => {
    if (Array.isArray(def.values)) {
      setValues(def.values);
    } else {
      let { serviceId, parameters } = def;
      if (serviceId) {
        console.log('SelectUi processService:', serviceId);
        setLoading(true);
        processService({ serviceId, parameters }, (data) => {
          setValues(toList(data));
          setLoading(false);
        });
      }
    }
  }, [def]);

  useEffect(() => setCurrentValue(value || def.defaultValue || ''), [def, value]);

  let id = counter++;
  let emptyClassName = currentValue ? '' : 'empty';
  //
  let editable = resolveBoolean(def, 'editable', cx, true);
  let editableClassName = editable ? '' : 'disabled';

  return render();

  function render() {
    console.log('currentValue:', currentValue);
    return (
      <div className={['SelectUi', emptyClassName, editableClassName].join(' ')}>
        <label htmlFor={id}>{label(def)}</label>

        {loading ? (
          <Progress message={'loading'} />
        ) : (
          <select
            id={id}
            value={currentValue}
            onChange={(e) => {
              action('value', { [def.name]: e.target.value });
            }}
            onBlur={(e) => action('blur', { [def.name]: value })}
            // disabled={!editable}
          >
            {values.map((e, index) => {
              debugger;
              let value = e.code || e.value;
              let label = e.label || e.code || e.value;
              return (
                <option key={value} value={value}>
                  {label}
                </option>
              );
            })}
          </select>
        )}
      </div>
    );
  }
}
//selected={e.code === value}
