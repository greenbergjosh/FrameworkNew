import React, { Component } from "react";
//import MonacoEditor, { MonacoDiffEditor } from "react-monaco-editor";
import asyncComponent from '../../../isomorphic-lib/helpers/AsyncFunc';
const MonacoEditor = asyncComponent(() => import('react-monaco-editor'))

class AdminMonacoEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      code: "// type your code...\nfunction f()\n{  console.info('hi');\n}\n",
      originalCode: "function f()\n{  console.info('hi');\n}\n"
    };
  }

  editorDidMount = (editor, monaco) => {
    console.log("editorDidMount", editor);
    editor.focus();
  };

  onChange = (newValue, e) => {
    console.log("onChange", newValue, e);
  };
  
  render() {
    const { code, originalCode } = this.state;
    const options = {
      selectOnLineNumbers: true
    };
    const divStyle = {
      border: '1px solid #ccc',
      margin: '5px',
      height: 400,
      width: 600
    };

    return (
      <div>
        {/* <MonacoDiffEditor
          height="600"
          language="javascript"
          value={code}
          original={originalCode}
          options={options}
          onChange={this.onChange}
          editorDidMount={this.editorDidMount}
        /> */}
        
        <div style={divStyle}>
        <MonacoEditor 
          height="400"
          width="600"
          language="javascript"
          theme="vs-light"
          value={code}
          options={options}
          onChange={this.onChange}
          editorDidMount={this.editorDidMount}
        />
        </div>
      </div>
    );
  }
};

export default AdminMonacoEditor;
