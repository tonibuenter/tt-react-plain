import React, { useState } from 'react';
import { label, resolveBoolean } from './utils';

let iconNameMap = {
  leave: 'icon-log-out',
  close: 'icon-x',
  delete: 'icon-x',
  edit: 'icon-edit-3',
  home: 'icon-home',
  refresh: 'icon-refresh-cw',
  toggleSplit: 'icon-monitor',
  new2: 'icon-plus-circle',
  new: 'icon-plus',
  filter: 'icon-filter',
  menu: 'icon-menu'
};

let defaultIcon = 'icon-x';

let k = 1;

export function newKey() {
  return k++;
}

export function Icon(props) {
  return (
    <div
      onClick={props.onClick}
      className={
        'ttIcon ' +
        (props.onClick ? 'ttPointer ' : '') +
        (props.disabled ? 'ttDisabled ' : '') +
        (props.selected ? 'ttSelected ' : '') +
        (props.className || '')
      }
    >
      <i className={iconNameMap[props.children] || defaultIcon} title={iconLabel(props)} />
    </div>
  );

  function iconLabel(p) {
    return p.children;
  }
}

export function Message({ type, title, text, onClose }) {
  return (
    <div className={'ttMessage ' + type}>
      <div className={'ttTitle'}>{title}</div>
      <div className={'ttText'}>{text}</div>
      <div className={'ttButtons'}>
        {onClose ? (
          <button className={'ttButton'} onClick={onClose}>
            {'ok'}
          </button>
        ) : (
          ''
        )}
      </div>
    </div>
  );
}

export function Progress(props) {
  return <div className={'ttProgress '}>{props.message || 'Loading...'}</div>;
}

export function RenderActionList({ def, action, cx }) {
  return (
    <div>
      {def.actionList.map((e, index) => (
        <RenderAction key={index} def={e} action={action} cx={cx} />
      ))}
    </div>
  );
}

export function RenderAction({ def, action, cx }) {
  const [confirmationOn, setConfirmationOn] = useState(false);

  let visible = resolveBoolean(def, 'visible', cx, true);

  if (!visible) {
    return '';
  }

  let disabled = false;
  if (def.enabled === 'onDirty' && !cx.dirty) {
    disabled = true;
  }

  log('RenderAction ', { visible, disabled }, def);

  return render();

  function render() {
    if (confirmationOn) {
      return (
        <Confirmation
          yes={() => {
            action(def);
            setConfirmationOn(false);
          }}
          no={() => setConfirmationOn(false)}
        >
          {def.confirmation}
        </Confirmation>
      );
    }
    return def.icon ? (
      <Icon disabled={disabled} onClick={processAction}>
        {def.icon}
      </Icon>
    ) : (
      <button disabled={disabled} className="ttButton" onClick={processAction}>
        {label(def)}
      </button>
    );
  }

  function processAction(e) {
    e.stopPropagation();
    if (disabled) {
      return;
    }
    if (def.confirmation) {
      setConfirmationOn(true);
    } else {
      log('RenderAction processAction', def);
      action(def);
    }
  }

  function log() {
    if (def.debug) {
      console.log.apply(this, arguments);
    }
  }
}

export function Confirmation(props) {
  return (
    <div className={'ttConfirmation '}>
      <div className={'ttBackground'} onClick={props.no}>
        &nbsp;
      </div>
      <div className={'ttContent'}>
        <div className={'ttQuestion'}>{props.children || label('Do_you_really_want')}</div>
        <div className={'ttActions'}>
          <button className="ttButton" key={'yes'} onClick={props.yes}>
            {label('yes')}
          </button>
          <button key={'no'} className="ttButton" onClick={props.no}>
            {label('no')}
          </button>
        </div>
      </div>
    </div>
  );
}

export function Breadcrumbs({ breadcrumbs, action }) {
  return (
    <div className={'ttBreadcrumbs'}>
      {breadcrumbs.map((bc, index) => renderBc(bc, index, index === breadcrumbs.length - 1))}
    </div>
  );

  function renderBc(bc, index, isLast) {
    const _label = label(bc.ttdef);
    const _icon = bc.ttdef.icon;
    if (isLast) {
      return _icon ? <Icon key={newKey()}>{_icon}</Icon> : <div key={newKey()}>{_label}</div>;
    } else {
      let onClick = () => action(index, 'breadcrumb');
      return _icon ? (
        <Icon key={newKey()} onClick={onClick}>
          {_icon}
        </Icon>
      ) : (
        <button key={newKey()} onClick={onClick}>
          {_label}
        </button>
      );
    }
  }
}
