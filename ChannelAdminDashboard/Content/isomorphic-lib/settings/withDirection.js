import React from 'react';

const rtl = typeof document !== 'undefined' ? document.getElementsByTagName('html')[0].getAttribute('dir') : 'ltr';
const withDirection = Component => props => {
  return <Component {...props} data-rtl={rtl} />;
};

export default withDirection;
export { rtl };
