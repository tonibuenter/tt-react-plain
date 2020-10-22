import React from 'react';

export default function DebugUi({ def, cx }) {
    return (
        <div>
            <h4>cx.value</h4>
            <div>
                {Object.keys(cx.value).map((k, index) => (
                    <div key={index}>{k + ' : ' + cx.value[k]}</div>
                ))}
            </div>

            <h4>def</h4>
            <div>
                <pre>{JSON.stringify(def, null, 2)}</pre>
            </div>

            <h4>cx.ttdef</h4>
            <div>
                <pre>{JSON.stringify(cx.ttdef, null, 2)}</pre>
            </div>
        </div>
    );
}
