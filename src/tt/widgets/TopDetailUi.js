import React, { useEffect, useState } from 'react';
import { Message, Progress, RenderAction } from '../uis';

import { label, renderWidget, resolveBoolean, toFirst } from '../utils';
import { processService } from '../api';

export default function TopDetailUi(props) {
  const { ttdef, action, value } = props;

  const [currentValue, setCurrentValue] = useState(value || {});
  const [exception, setException] = useState(null);
  const [message, setMessage] = useState(null);
  const [actionRunning, setActionRunning] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [emptyAttributes, setEmptyAttributes] = useState([]);

  const cx = { value: currentValue || {}, ttdef, dirty };

  console.log('TopDetailUi cx:', JSON.stringify(cx));
  useEffect(() => {
    setCurrentValue(value || {});
  }, [value]);

  const toolbarActions = ttdef.actions.filter((action) => action.source === 'toolbar');
  const detailActions = ttdef.actions.filter((action) => action.source !== 'toolbar');

  return render();

  function render() {
    if (message) {
      return <Message type="info" title={message} onClose={() => setMessage(null)} />;
    }
    if (exception) {
      return <Message type="error" title={exception} onClose={() => setException(null)} />;
    }
    if (actionRunning) {
      return <Progress message={`Action processing ${actionRunning.name}`} />;
    }

    return (
      <div className={dirty ? 'ttDirty' : ''}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 0fr'
          }}
          className={'ttToolbar'}
        >
          <div className={'ttTitle' + (dirty ? ' ttDirty' : '')}>
            {
              // <div>{JSON.stringify(currentValue || '-now value-')}</div>
            }
            {label(ttdef, currentValue)}
          </div>

          <div className={'ttActions'}>
            {toolbarActions.map((actionDef, index) => (
              <RenderAction key={index} def={actionDef} action={processAction} cx={cx} />
            ))}
          </div>
        </div>
        <div>{ttdef.attributes.map((attDef, index) => renderAttribute(attDef, index))}</div>
        {emptyAttributes.length === 0 ? (
          <div>
            {detailActions.map((actionDef, index) => (
              <RenderAction key={index} def={actionDef} action={processAction} cx={cx} />
            ))}
          </div>
        ) : (
          <div style={{ padding: '1em', border: 'dashed 1px red' }}>
            <div>{label('please_check_the_following_mandatory_fields')}</div>
            <ul>
              {emptyAttributes.map((att) => (
                <li>
                  <h4>{att.name}</h4>
                </li>
              ))}
            </ul>
            <div>
              <button className="ttButton" onClick={() => setEmptyAttributes([])}>
                {label('close')}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  function renderAttribute(attDef, index) {
    let visible = resolveBoolean(attDef, 'visible', cx, true);

    return visible ? (
      <div key={index} className={'ttAttribute'}>
        {renderWidget({
          def: attDef,
          value: currentValue[attDef.name],
          cx,
          action: widgetAction
        })}
      </div>
    ) : (
      ''
    );
  }

  function widgetAction(cmd, value) {
    switch (cmd) {
      case 'value': {
        const newValue = { ...currentValue, ...value };
        setCurrentValue(newValue);
        setDirty(true);
        action('dirty');
        break;
      }
      case 'dirty': {
        setDirty(true);
        break;
      }
      default:
        setCurrentValue(currentValue);
    }
  }

  function processAction(actionDef) {
    if (!actionDef) {
      return;
    }

    const parameters = { ...actionDef.parameters, ...currentValue };
    const newAction = { ...actionDef, parameters };

    if (newAction.check === 'mandatory') {
      let emptyAttributes = ttdef.attributes.filter((attDef, index) => attDef.mandatory && !parameters[attDef.name]);
      if (emptyAttributes.length > 0) {
        setEmptyAttributes(emptyAttributes);
        return;
      }
    }

    setActionRunning(newAction);
    processService(newAction, processResult);

    function processResult(data) {
      const value = { ...currentValue, ...toFirst(data) };
      setActionRunning(null);

      if (data && data.exception) {
        setException(data.exception);
        return;
      }

      if (actionDef.type === 'done') {
        action(actionDef.type, { action: actionDef, value, data });
        return;
      }

      if (actionDef.type === 'close' || actionDef.type === 'cancel') {
        action(actionDef.type, {});
        return;
      }

      if (actionDef.type === 'exit') {
        action(actionDef.type, { action: actionDef, value, data });
      }

      if (actionDef.forward) {
        action('forward', { action: actionDef, value, data });
        return;
      }

      if (actionDef.type === 'update') {
        action('refresh', { action: actionDef, value, data });
      }

      if (actionDef.type === 'message') {
        setMessage(actionDef.messagePattern);
      }
    }
  }
}
