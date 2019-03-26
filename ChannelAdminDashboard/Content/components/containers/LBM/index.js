
import React from 'react';
//import './app-styles.css'

import AdminMonacoEditor from '../../components/editor/AdminMonacoEditor'
//import MonacoEditor from "react-monaco-editor";
//import * as monaco from 'monaco-editor'

import PageHeader from '../../../isomorphic-lib/components/utility/pageHeader.js';
import Box from '../../../isomorphic-lib/components/utility/box.js';
import LayoutWrapper from '../../../isomorphic-lib/components/utility/layoutWrapper.js';
import ContentHolder from '../../../isomorphic-lib/components/utility/contentHolder.js';

import EditorForm from './EditorForm'

export default class extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      editorState: null,
      loading: false,
      iconLoading: false
    };
  }

	render() {
    const onEditorStateChange = editorState => {
      this.setState({ editorState });
    };
    const editorOptions = {
      style: { width: '90%', height: '70%' },
    };

    return (
      <LayoutWrapper>
        <PageHeader>LBM Editor</PageHeader>
        <Box>
          <ContentHolder>
			<AdminMonacoEditor {...editorOptions} />
			<EditorForm onSubmit={values => console.log('EditorForm.onSubmit', values)}/>
          </ContentHolder>
        </Box>
      </LayoutWrapper>
    );
  }
}
