/**
 * Copyright 2017 DENSO Solutions
 * 
 * 削除ボタン付き入力フォームコンポーネント Reactコンポーネント
 *  
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Form, FormGroup, HelpBlock, Row, Col } from 'react-bootstrap';
import Button from 'Common/Widget/Button';

const DeletableInputForm = ({ validationState, isReadOnly, onClickDelete:handleClickDelete, children }) => {

    return (
        <FormGroup validationState={validationState ? validationState.state : null}>
            <Row className="mr-0 ml-0">
                <Col xs={10}>
                    {children}
                </Col>
                <Col xs={2} className="pa-0">
                    <Button className="btn-circle btn-garmit-erase" disabled={isReadOnly} onClick={() => handleClickDelete && handleClickDelete()}></Button>
                </Col>
            </Row>
            <HelpBlock>{validationState ? validationState.helpText : null}</HelpBlock>
        </FormGroup>
    );
}
export default DeletableInputForm;

DeletableInputForm.propTypes = {
    validationState: PropTypes.shape({
        state: PropTypes.oneOf(['success', 'error']),
        helpText:PropTypes.string
    }),
    isReadOnly:PropTypes.bool, 
    onClickDelete: PropTypes.func
}