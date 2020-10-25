import React, { Fragment, useEffect, useMemo, useRef, useState } from 'react';

import { Icon, Message, Progress, RenderAction } from '../uis';
import { label, randomName, renderWidget, resolveFunction, toList, forwardValue } from '../utils';
import { processService } from '../api';

export default function TopListUi(props) {
  const { ttdef, action, value } = props;
  console.log('TopListUi render, value:', value);

  const renderCounter = useRef();

  if (renderCounter.current === undefined) renderCounter.current = 0;
  renderCounter.current = renderCounter.current ? renderCounter.current + 1 : 1;
  console.log('TopListUi renderCounter.current', renderCounter.current);

  const [currentList, setCurrentList] = useState([]);
  const [dirty, setDirty] = useState([]);

  const [exception, setException] = useState(null);

  const [filterRow, setFilterRow] = useState({});
  const [showFilters, setShowFilters] = useState(false);

  const [actionRunning, setActionRunning] = useState(null);

  // Prepare actions...

  let actions = ttdef.actions || [];

  const refreshAction = actions.filter((actionDef) => actionDef.type === 'refresh')[0];
  const toolbarActions = actions.filter((actionDef) => actionDef.source === 'toolbar');
  const rowSelectAction = actions.filter((actionDef) => actionDef.source === 'rowSelect')[0];
  const rowActions = actions.filter((actionDef) => actionDef.source === 'row');

  useEffect(() => {
    console.log('TopListUi use-effect');
    processAction(refreshAction);
  }, [props]);

  // Prepare attributes...

  let attributes = ttdef.attributes || [];
  const cellWidths = useMemo(() => {
    let sum = attributes.reduce((a, e) => a + (+e.width || 1), 0);
    return attributes.map((att) => {
      let p = (100 / sum) * (+att.width || 1);
      return p + '%';
    });
  }, [attributes]);

  let hasFilter = attributes.reduce((a, e) => e.filter || a, false);

  const topCx = { value, ttdef };

  return (
    <div className={'TopListUi'}>
      <div className={'ttToolbar'}>
        <div key="toolbarTitle" className="ttTitle">
          {label(ttdef, value)}
        </div>
        <div key="systemActions" className={'ttActions'}>
          {hasFilter ? (
            <Icon selected={showFilters} onClick={() => setShowFilters((b) => !b)}>
              filter
            </Icon>
          ) : (
            ''
          )}
        </div>
        <div key="topActions" className="ttActions">
          {toolbarActions.map((actionDef, index) => (
            <RenderAction key={index} def={actionDef} action={processAction} cx={topCx} />
          ))}
        </div>
      </div>
      <div>{actionRunning ? <Progress message={`Action processing ${actionRunning.name}`} /> : ''}</div>
      <div>
        {exception ? <Message type="error" title={exception} onClose={() => setException('')} /> : renderDataTable()}
      </div>
    </div>
  );

  function renderDataTable() {
    let message = currentList.length === 0 ? 'No Data' : '';
    let gridTemplateColumns = cellWidths.join(' ');
    return (
      <div className="ttDataTable">
        {message ? (
          <div>{message}</div>
        ) : currentList.length > 0 ? (
          <div className="ttTable">
            {/*HEADER*/}
            <div className="ttTableHead" key={'header'}>
              <div className="ttTableRow" style={{ gridTemplateColumns }}>
                {attributes.map((attr, index) => (
                  <div className="ttTableCell" key={index}>
                    {attr.noColumnLabel ? '' : label(attr)}
                  </div>
                ))}
              </div>
            </div>

            {/*FILTER*/}
            {hasFilter && showFilters ? (
              <div className="ttTableHead " key={'filter'}>
                <div className="ttTableRow ttFilter" style={{ gridTemplateColumns }}>
                  {attributes.map((attr, index) => (
                    <div className="ttTableCell" key={index}>
                      {attr.filter ? (
                        <Fragment>
                          <input
                            autoComplete={'off'}
                            name={randomName()}
                            value={filterRow[attr.name] || ''}
                            onChange={(e) =>
                              setFilterRow({
                                ...filterRow,
                                [attr.name]: e.target.value
                              })
                            }
                          />
                          <Icon
                            className={'ttClean'}
                            onClick={() =>
                              setFilterRow({
                                ...filterRow,
                                [attr.name]: ''
                              })
                            }
                          >
                            delete
                          </Icon>
                        </Fragment>
                      ) : (
                        ''
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              ''
            )}

            {/*BODY*/}
            {
              <div className={'ttTableBody'} key={'body'}>
                {currentList.map((row, rowIndex) =>
                  filterOut(row) ? (
                    ''
                  ) : (
                    <div
                      key={rowIndex}
                      className={
                        'ttTableRow' +
                        (rowSelectAction ? ' ttPointer' : '') +
                        (dirty.includes(rowIndex) ? ' ttDirty' : '')
                      }
                      style={{ gridTemplateColumns }}
                      onClick={(e) => {
                        e.stopPropagation();
                        processAction(rowSelectAction, row);
                      }}
                    >
                      {attributes.map((attr, index) => (
                        <div className={(attr.className ? attr.className : '') + ' ttTableCell'} key={index}>
                          {attr.uiType ? cellUiType(attr, row, rowIndex) : cellValue(attr, row)}
                        </div>
                      ))}
                      {actionsOverlay(row)}
                    </div>
                  )
                )}
              </div>
            }
          </div>
        ) : (
          <Message type={'info'} style={{ margin: '10%' }} text={label('No_data_found')} />
        )}
      </div>
    );
  }

  function filterOut(row) {
    let filterOk = Object.keys(filterRow).reduce((a, key) => {
      let filterValue = filterRow[key] || '';
      let rowValue = '' + row[key] || '';
      let ok = rowValue.includes(filterValue);
      return a && ok;
    }, true);
    return !filterOk;
  }

  function cellValue(attr, row) {
    let fun = resolveFunction(attr.formatter, (v) => v);
    return fun(row[attr.name], { attr, row, ttdef });
  }

  /**
   * FUTURE USE ... could probably replace the actionsOverlay...
   * @param attDef
   * @param value
   * @returns {*}
   */
  function cellUiType(attDef, value, index) {
    attDef = { ...attDef, noLabel: true };
    return renderWidget({
      def: attDef,
      value: value[attDef.name],
      cx: { value, ttdef, attDef, dirty: dirty.includes(index) },
      action: processRowActionFun(index)
    });
  }

  function processRowActionFun(rowIndex) {
    return function (arg0, arg1) {
      if (typeof arg0 === 'object') {
        processAction(arg0, currentList[rowIndex]);
      } else if (arg0 === 'value') {
        let newCurrentList = [...currentList];
        newCurrentList[rowIndex] = { ...newCurrentList[rowIndex], ...arg1 };
        setCurrentList(newCurrentList);
        if (!dirty.includes(rowIndex)) {
          let newDirty = [...dirty];
          newDirty.push(rowIndex);
          setDirty(newDirty);
        }
      }
    };
  }

  function actionsOverlay(row) {
    return (
      <div key="action-overlay" className="ttActions ttRowOverlay">
        {rowActions.map((actionDef, index) => {
          let cx = { value: row, ttdef };
          return <RenderAction key={index} def={actionDef} action={() => processAction(actionDef, row)} cx={cx} />;
        })}
      </div>
    );
  }

  function processAction(actionDef, row) {
    if (!actionDef) {
      return;
    }
    const parameters = { ...actionDef.parameters, ...value, ...row };
    const newAction = { ...actionDef, parameters };
    setActionRunning(newAction);

    processService(newAction, processResult);

    function processResult(data) {
      const value = { ...parameters };
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
        let newValue = forwardValue(actionDef, { value, data });
        action('forward', { action: actionDef, value: newValue, data });
        return;
      }

      if (actionDef.type === 'refresh' || actionDef.type === 'update') {
        const list = toList(data);
        setCurrentList(list);
        setDirty([]);
        action('footerInfo', `found ${list.length} records`);
      }
    }
  }
}
