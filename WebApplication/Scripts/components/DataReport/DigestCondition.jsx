/**
 * Copyright 2017 DENSO Solutions
 * 
 * ダイジェスト検索条件フォーム Reactコンポーネント
 *  
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Row, Col } from 'react-bootstrap';
import SelectForm from 'Common/Form/SelectForm';

export default class DigestCondition extends Component {

    constructor(props) {
        super(props)
        this.state = {
        }
    }   

    //#region イベントハンドラ
    /**
     * 積算種別変更イベント
     */
    handleChangeSummaryType(type) {
        if (this.props.onChangeSummaryType) {
            this.props.onChangeSummaryType(type);
        }
    }
    //#endregion

    /**
     * render
     */
    render() {
        const { summaryType, summaryTypeOptions } = this.props;

        return (
            <Row>
                <Col md={3} sm={4}>
                    <SelectForm
                        label="積算種別"
                        isRequired={true}
                        value={summaryType}
                        options={summaryTypeOptions}
                        onChange={(type) => this.handleChangeSummaryType(type)}
                    />
                </Col>
            </Row>
        )
    }
}

DigestCondition.propTypes = {
    summaryType: PropTypes.oneOf(['max', 'min', 'average', 'snap', 'diff']),
    summaryTypeOptions: PropTypes.arrayOf(
        PropTypes.shape({
            value: PropTypes.string,
            name: PropTypes.string
        })
    ),
    onChangeSummaryType:PropTypes.func
}