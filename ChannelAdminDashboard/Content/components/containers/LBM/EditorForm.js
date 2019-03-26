import React from 'react';

import { Col, Row } from 'antd';

import Input, {
  InputSearch,
  InputGroup,
  Textarea
} from '../../components/uielements/input';
import Button, { ButtonGroup } from '../../components/uielements/button';

class EditorForm extends React.Component {
  renderError({ error, touched }) {
    if (touched && error) {
      return (
        <div className="ui error message">
          <div className="header">{error}</div>
        </div>
      );
    }
  }


  render() {
const {onSubmit} = this.props;
    return (
      <form
        onSubmit={onSubmit}
        className="ui form error"
      >
		<div style={{width: '80%'}}>
        	<InputGroup compact size="large" style={{ margin: '15px', width: '90%' }}>
           	 <Input compact placeholder="Title" />
          	  <Textarea rows={8} style={{height: 'inherit'}} placeholder="Description" />
       		</InputGroup>
            <Button type="primary" icon="save">
				Save
            </Button>
		</div>
      </form>
    );
  }
}

const validate = formValues => {
  const errors = {};

  if (!formValues.title) {
    errors.title = 'You must enter a title';
  }

  if (!formValues.description) {
    errors.description = 'You must enter a description';
  }

  return errors;
};

//export default reduxForm({
//  form: 'streamForm',
//  validate
//})(StreamForm);

export default EditorForm