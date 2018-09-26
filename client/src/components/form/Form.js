import React from "react";
import ReactDOM from 'react-dom';
import PropTypes from "prop-types";
import {Form as F} from "semantic-ui-react";

class Form extends React.Component {
  state = {
    isValidated: false
  };

  findAncestor = (el, cls) => {
    while ((el = el.parentNode) && el !== null && el.className.indexOf(cls) < 0) 
    ;
    return el;
  }

  validate = () => {
    const formEl = ReactDOM.findDOMNode(this.formEl);
    const fields = formEl.querySelectorAll('.field');
    const valid = this.props.validate ? this.props.validate() : true;
    const formLength = fields.length;
    for (let i = 0; i < formLength; i++) {
      const field = fields[i];
      const elem = field.querySelector('[validate="true"]');
      if (elem && !valid) {
        field
          .classList
          .add("error");
      } else {
        field
          .classList
          .remove("error");
      }
    }
    this.setState({isValidated: true});
    return valid;
  };

  /**
    * This is the method that is called on form submit.
    * It stops the default form submission process and proceeds with custom validation.
    **/
  submitHandler = event => {
    if (event) 
      event.preventDefault();
    
    // If the call of the validate method was successful, we can proceed with form
    // submission. Otherwise we do nothing.
    if (this.validate()) {
      this
        .props
        .submit();
    }

    this.setState({isValidated: true});
  };

  /**
    * Render the component as a regular form element with appended children from props.
    **/
  render() {
    const props = [...this.props];

    // Add bootstrap's 'was-validated' class to the forms classes to support its
    // styling
    let classNames = [];
    if (props.className) {
      classNames = [...props.className];
      delete props.className;
    }

    if (this.state.isValidated) {
      classNames.push("was-validated");
    }

    // The form will have a refference in the component and a submit handler set to
    // the component's submitHandler
    return (
      <F
        {...props}
        noValidate
        ref={form => (this.formEl = form)}
        onSubmit={this.submitHandler}>
        {this.props.children}
      </F>
    );
  }
}

Form.propTypes = {
  submit: PropTypes.func.isRequired,
  validate: PropTypes.func
};

export default Form;
