import React, { useState } from 'react';
import { Navigator } from './Navigator';
import { label } from './utils';

export function TTMenu({ ttdefs, startNames, title }) {
  const [startName, setStartName] = useState('');

  return startName ? (
    <Navigator ttdefs={ttdefs} startName={startName} action={menuAction} mode={'singleScreen'} />
  ) : (
    <div className="TTMenu">
      <div className="ttTitle">{title}</div>
      <div className={'ttList'}>
        {startNames.map((startName, index) => {
          let ttdef = ttdefs[startName];
          return ttdef ? (
            <button className="ttMenuItem" key={index} onClick={() => setStartName(startName)}>
              {label(ttdef)}
            </button>
          ) : (
            ''
          );
        })}
      </div>
    </div>
  );

  function menuAction(cmd) {
    switch (cmd) {
      case 'done':
        setStartName('');
        break;
      default:
        console.log(`menuAction: unknown cmd ${cmd}`);
    }
  }
}
