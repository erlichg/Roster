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

  /**
     * Them main function that validates the form and fills in the error messages.
     * @returns bool Returns a boolean showing if the form is valid for submission or not.
     **/
  validate = () => {
    //this.formEl is a reference in the component to the form DOM element.
    const formEl = ReactDOM.findDOMNode(this.formEl);
    const formLength = formEl.length;

    /*
      * The checkValidity() method on a form runs the
      * html5 form validation of its elements and returns the result as a boolean.
      * It returns 'false' if at least one of the form elements does not qualify,
      * and 'true', if all form elements are filled with valid values.
      */
    if (formEl.checkValidity() === false) {
      for (let i = 0; i < formLength; i++) {
        //the i-th child of the form corresponds to the forms i-th input element
        const elem = formEl[i];
        if (elem.nodeName === "BUTTON") {
          continue;
        }
        const field = this.findAncestor(elem, "field");
        if (!elem.validity.valid) {
          field
            .classList
            .add("error");
        } else {
          field
            .classList
            .remove("error");
        }
      }

      // Return 'false', as the formEl.checkValidity() method said there are some
      // invalid form inputs.
      this.setState({isValidated: true});
      return false;
    } else {
      //The form is valid, so we clear all the error messages
      for (let i = 0; i < formLength; i++) {
        const elem = formEl[i];
        if (elem.nodeName === "BUTTON") {
          continue;
        }
        const field = this.findAncestor(elem, "field");
        field
          .classList
          .remove("error");
      }

      //Return 'true', as the form is valid for submission
      this.setState({isValidated: true});
      return true;
    }
  };

  /**
    * This is the method that is called on form submit.
    * It stops the default form submission process and proceeds with custom validation.
    **/
  submitHandler = event => {
    if (event) event.preventDefault();

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
  submit: PropTypes.func.isRequired
};

export default Form;
