import React from 'react';
import { label } from '../utils';

export default function TTMenuUi(props) {
  const { ttdef, data, action, value } = props;

  return (
    <div className={'TTMenuUi'}>
      <div className="ttTitle">{label(ttdef)}</div>
      <div className={'ttMenuItems'}>
        {ttdef.menuItems.map((menuItem, index) => {
          return ttdef ? (
            <button className="ttMenuItem" key={index} onClick={() => processMenuItem(menuItem)}>
              {label(menuItem)}
            </button>
          ) : (
            ''
          );
        })}
      </div>
    </div>
  );

  function processMenuItem(menuItem) {
    action('forward', { action: { name: 'menu', forward: menuItem }, value, data });
  }
}
