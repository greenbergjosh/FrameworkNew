import React from 'react';
import { Link } from 'react-router-dom';
import { siteConfig } from '../../settings';

export default ({ collapsed }) => {
  return (
    <div className="isoLogoWrapper">
      {collapsed ? (
        <div>
          <h3>
            <a to="/dashboard">
              <i className={siteConfig.siteIcon} />
            </a>
          </h3>
        </div>
      ) : (
        <h3>
          <a to="/dashboard">{siteConfig.siteName}</a>
        </h3>
      )}
    </div>
  );
};
