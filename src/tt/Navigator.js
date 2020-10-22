import React, { useEffect, useState } from 'react';

import { Breadcrumbs, Icon, Message } from './uis';
import { arrayCompare, modulo, resolveBoolean, resolveUiType } from './utils';

const SPLIT_CLASSES = ['', 'ttTwoThrid', 'ttOneThrid'];

export function Navigator(props) {
  const { ttdefs, startName, value, data, action, mode, title, cx } = props;
  const options = props.options || {};

  console.log('Navigator render');

  const [currentSplit, setCurrentSplit] = useState(0);
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [footerInfo, setFooterInfo] = useState('-');

  useEffect(() => {
    console.log('Navigator useEffect...');
    setBreadcrumbs([
      {
        ttdef: ttdefs[startName],
        value: value,
        data: data
      }
    ]);
  }, [props]);

  const showTitle = resolveBoolean(options, 'showTitle', cx, true);

  let currentBreadcrumbsIndex = breadcrumbs.length - 1;
  let currentBreadcrumbs = breadcrumbs[currentBreadcrumbsIndex];

  return (
    <div className={'Navigator ' + SPLIT_CLASSES[currentSplit]}>
      {/*TOOLBAR*/}
      {options.hideToolbar ? (
        <div />
      ) : (
        <div className="ttToolbar">
          <Breadcrumbs breadcrumbs={breadcrumbs} action={navigatonAction} />
          <div className="ttTitle">{showTitle ? (title ? title : '') : ''}</div>
          <div>
            {mode === 'multiScreen' ? (
              <Icon onClick={() => setCurrentSplit(modulo(currentSplit + 1, 3))}>toggleSplit</Icon>
            ) : (
              ''
            )}
            {typeof action === 'function' ? <Icon onClick={leave}>leave</Icon> : ''}
          </div>
        </div>
      )}
      {/*CENTER*/}
      <div className="ttCenter">
        <div className="ttPaper">
          {
            !currentBreadcrumbs ? (
              <div>...</div>
            ) : (
              // breadcrumbs.length === 1 || mode === 'singleScreen' ?
              <div className="ttBoth">
                {topDispatch(currentBreadcrumbs, (cmd, e) => navigatonAction(currentBreadcrumbsIndex, cmd, e))}
              </div>
            )
            // <>
            //   <div className="ttLeft">
            //     {topDispatch(breadcrumbs[breadcrumbs.length - 2], (cmd, value) =>
            //       navigatonAction(breadcrumbs.length - 2, cmd, value)
            //     )}
            //   </div>
            //   <div className="ttRight">
            //     {topDispatch(breadcrumbs[breadcrumbs.length - 1], (cmd, value) =>
            //       navigatonAction(breadcrumbs.length - 1, cmd, value)
            //     )}
            //   </div>
            // </>
          }
        </div>
      </div>

      {/*FOOTER*/}
      <div className="ttFooter">{footerInfo}</div>
    </div>
  );

  function navigatonAction(index, cmd, event) {
    switch (cmd) {
      case 'forward': {
        forward(index, event);
        break;
      }
      case 'exit':
        action('exit', event);
        break;
      case 'home':
        action('done');
        break;
      case 'close':
      case 'cancel': {
        const c = breadcrumbs.filter((cb, i) => i < index);
        // if (c.length > 0 && cmd === 'close') c[c.length - 1].version = versionCounter++;
        arrayCompare(c, breadcrumbs);
        if (c.length === 0) {
          leave();
          return;
        }
        setBreadcrumbs(c);
        break;
      }
      case 'breadcrumb': {
        const c = breadcrumbs.filter((cb, i) => i <= index);
        // c[c.length - 1].version = versionCounter++;
        setBreadcrumbs(c);
        break;
      }
      case 'refresh': {
        // let c = breadcrumbs.map(bc => ({...bc}));
        const c = [...breadcrumbs];
        if (event.value) {
          c[index].value = { ...c[index].value, ...event.value };
        }
        c[index] = { ...c[index] };
        setBreadcrumbs(c);
        break;
      }
      case 'footerInfo': {
        setFooterInfo(event);
        break;
      }
      default: {
        //
      }
    }

    function forward(index, event) {
      const ttdef = event && event.action ? ttdefs[event.action.forward] : null;
      if (!ttdef) {
        console.error('No ttdef found for event: ', JSON.stringify(event || '-empty-'));
        return;
      }

      const newEntry = {
        ttdef: ttdef,
        value: event.value,
        data: event.data
      };

      const newBreadcrumbs = [...breadcrumbs];

      if (index < newBreadcrumbs.length - 1) {
        newBreadcrumbs.splice(index + 1, newBreadcrumbs.length - (index + 1));
      }
      newBreadcrumbs.push(newEntry);
      setBreadcrumbs(newBreadcrumbs);
      console.log('newBreadcrumbs', newBreadcrumbs);
    }
  }

  function leave() {
    action('exit');
  }

  function topDispatch(bc, action) {
    const { name, ttdef } = bc;

    if (!ttdef) {
      return <Message type="error" onClose={() => action('cancel')} title={`No TT definition found for  ${name}`} />;
    }
    if (!ttdef.uiType) {
      return (
        <Message
          type="error"
          title={`No uiType defined for TT definition ${ttdef.name}`}
          onClose={() => action('cancel')}
        />
      );
    }
    const uiFun = resolveUiType(ttdef.uiType);
    bc.action = action;

    if (typeof uiFun !== 'function') {
      return (
        <Message
          severity="error"
          message={`Unknown uiType for TT definition ${ttdef.name} with uiType=${ttdef.uiType}`}
          onClose={() => action('cancel')}
        />
      );
    }
    return React.createElement(uiFun, bc, null);
  }
}
