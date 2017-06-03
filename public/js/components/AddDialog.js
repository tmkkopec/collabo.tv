'use strict';

const React = require('react');
import PropsTypes from 'prop-types';
import {ModalContainer, ModalDialog} from 'react-modal-dialog';

class AddDialog extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isShowingModal: false,
            inputValue: ''
        };
        this.handleClick = this.handleClick.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleAdd = this.handleAdd.bind(this);
    }

    handleClick() {
        this.setState({isShowingModal: true});
    }

    handleClose() {
        this.setState({
            isShowingModal: false,
            inputValue: ''
        });
    }

    handleChange(event) {
        this.setState({inputValue: event.target.value})
    }

    handleAdd() {
        this.props.addRoom(this.state.inputValue);
        this.handleClose();
    }


    render() {
        return (
            <div className="addDialog">
                <button
                    className="addButton mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--fab mdl-button--colored"
                    onClick={this.handleClick}>
                    <i className="material-icons">add</i>
                </button>
                {
                    this.state.isShowingModal &&
                    <ModalContainer onClose={this.handleClose}>
                        <ModalDialog onClose={this.handleClose}>
                            <div className="modalDialog">
                                <p className="mdl-typography--headline">Enter room number</p>
                                <input className="mdl-textfield__input"
                                       type="text"
                                       value={this.state.inputValue}
                                       onChange={this.handleChange}/>
                                <div className="mdl-dialog__actions">
                                    <button className="mdl-button"
                                            onClick={this.handleAdd}>
                                        Join!
                                    </button>
                                </div>
                            </div>
                        </ModalDialog>
                    </ModalContainer>
                }
            </div>
        );
    }
}

AddDialog.propTypes = {
    addRoom: PropsTypes.func.isRequired
};

export default AddDialog;