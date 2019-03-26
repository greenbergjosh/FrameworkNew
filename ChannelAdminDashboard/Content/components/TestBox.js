import React, { Component } from 'react';



import PageHeader from '../isomorphic-lib/components/utility/pageHeader';
import Box from '../isomorphic-lib/components/utility/box';
import LayoutWrapper from '../isomorphic-lib/components/utility/layoutWrapper.js';
import ContentHolder from '../isomorphic-lib/components/utility/contentHolder';
import IntlMessages from '../isomorphic-lib/components/utility/intlMessages';



export default class extends Component {
  render() {

    return (
      <LayoutWrapper>
        <PageHeader>Page Header !!{/*<IntlMessages id="forms.editor.header" />*/}</PageHeader>
        <Box>
          <ContentHolder>
			Test Message 1
            <textarea />
          </ContentHolder>
        </Box>
      </LayoutWrapper>
    );
  }
}


/*
import styled from 'styled-components';

const BlueTitle = styled.h1`
    color: #222;
    font-family: Helvetica, 'sans-serif';
    text-shadow: 0 0 5px lightgray;
    line-height: 2;

    a {
        transition: color 0.2s ease;
        color: palevioletred;
        text-decoration: none;

        &:hover {
            color: #888;
        }
    }
`;

export default function StyledComponentsDemo() {
    return (
        <BlueTitle>
            Hello from{' '}
            <a href="https://github.com/styled-components/styled-components">
                styled-components
            </a>
            !
        </BlueTitle>
    );
}
*/

/*
import styled from 'styled-components';
import { palette } from 'styled-theme';
import WithDirection from '../isomorphic-lib/settings/withDirection';

const ComponentTitleWrapper = styled.h1`
  font-size: 19px;
  font-weight: 500;
  color: ${palette('secondary', 2)};
  width: 100%;
  margin-right: 17px;
  margin-bottom: 30px;
  display: flex;
  align-items: center;
  white-space: nowrap;

  @media only screen and (max-width: 767px) {
    margin: 0 10px;
    margin-bottom: 30px;
  }

  &:before {
    content: '';
    width: 5px;
    height: 40px;
    background-color: ${palette('secondary', 3)};
    display: flex;
    margin: ${props =>
      props['data-rtl'] === 'rtl' ? '0 0 0 15px' : '0 15px 0 0'};
  }

  &:after {
    content: '';
    width: 100%;
    height: 1px;
    background-color: ${palette('secondary', 3)};
    display: flex;
    margin: ${props =>
      props['data-rtl'] === 'rtl' ? '0 15px 0 0' : '0 0 0 15px'};
  }
`;

export default ComponentTitleWrapper;
*/