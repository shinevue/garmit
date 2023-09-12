'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';

import { FormControl, FormGroup, ControlLabel, Button, Form, Checkbox, Grid, Row, Col } from 'react-bootstrap'

import SelectForm from 'Common/Form/SelectForm';

import DateTimePicker from 'Common/Widget/DateTimePicker'

import { SUMMARY_TYPE_OPTION } from 'constant';

export default class SummaryOption extends Component {

    constructor() {
        super();
        this.state = {
            
        }
    }

    render() {
        const { value, onChange } = this.props

        return (
            <Grid fluid>
                <Row><Col md={12}><strong>積算種別:</strong></Col></Row>
                <Row>
                    <Col md={12}>
                        <Form inline className="pa-1">
                            <FormControl
                                componentClass='select'
                                value={value}
                                onChange={(e) => onChange(parseInt(e.target.value))}
                            >
                                {SUMMARY_TYPE_OPTION.map((option, i) =>
                                    <option value={option.value}>{option.name}</option>
                                )}
                            </FormControl>
                        </Form>
                    </Col>
                </Row>
            </Grid>  
        );
    }
}