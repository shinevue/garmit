/**
 * Copyright 2017 DENSO Solutions
 * 
 * 計測値種別選択フォーム Reactコンポーネント
 *  
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Row, Col, FormGroup, Radio } from 'react-bootstrap';
import ToggleSwitch from 'Common/Widget/ToggleSwitch';
import Button from 'Common/Widget/Button';
import Icon from 'Common/Widget/Icon';

export default class MeasuredDataTypeSelectForm extends Component {

    constructor(props) {
        super(props)
        this.state = {
        }
    }   

    //#region イベントハンドラ
    /**
     * 計測値種別変更イベント
     */
    handleChangeMDataType(value) {
        if (this.props.onChangeMDataType) {
            this.props.onChangeMDataType(value);
        }
    }

    //#endregion

    /**
     * render
     */
    render() {
        const { measuredDataType, mDataTypeOptions } = this.props;

        return (
            <Row>
                <Col md={12} className="mb-1">
                    <ToggleSwitch
                        value={measuredDataType}
                        bsSize="sm"
                        name="updateInterval"
                        swichValues={[
                            { value: mDataTypeOptions.realTime, text: 'リアルタイム' },
                            { value: mDataTypeOptions.summary, text: 'ダイジェスト' }
                        ]}
                        onChange={(val) => this.handleChangeMDataType(val)}
                    />
                </Col>
            </Row>
        )
    }

}

MeasuredDataTypeSelectForm.propTypes = {
    mesuredDataType: PropTypes.oneOf(['RealTime', 'Summary']),
    mDataTypeOptions:PropTypes.object,
    onChangeMDataType:PropTypes.func
}