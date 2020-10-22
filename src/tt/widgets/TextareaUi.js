import React from 'react';
import { label, resolveBoolean } from '../utils';

let counter = 0;

export default function TextareaUi({ def, value, cx, action }) {
    let id = counter++;
    let emptyClassName = value ? '' : 'empty';

    let currentValue = value || def.defaultValue || '';
    let currentRows = Array.from(currentValue).filter((c) => c === '\n').length + 1;
    //
    let editable = resolveBoolean(def, 'editable', cx, true);
    let editableClassName = editable ? '' : 'disabled';

    return (
        <div className={['TextareaUi', emptyClassName, editableClassName].join(' ')}>
            <label htmlFor={id}>{label(def)}</label>
            <textarea
                autoComplete={'off'}
                id={id}
                value={currentValue}
                onChange={(e) => action('value', { [def.name]: e.target.value })}
                onBlur={(e) => action('blur', { [def.name]: value })}
                readOnly={!editable}
                rows={Math.min(Math.max(currentRows, +def.rows || 5), +def.maxRows || 1000)}
            >
                {currentValue}
            </textarea>
        </div>
    );
}
