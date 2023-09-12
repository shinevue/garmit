/**
 * Copyright 2017 DENSO Solutions
 * 
 * リアルタイム検索条件フォーム Reactコンポーネント
 *  
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Row, Col } from 'react-bootstrap';
import SelectForm from 'Common/Form/SelectForm';


//#region 定数定義
//レポート間隔一覧
const EXPORT_SPAN_OPTIONS = [
    { value: "None", name: "指定なし" },
    { value: "OneMinute", name: "1分" },
    { value: "FimeMinutes", name: "5分" },
    { value: "TenMinutes", name: "10分" }
];
//#endregion

export default class RealTimeCondition extends Component {

    constructor(props) {
        super(props)
        this.state = {
        }
    }   

    //#region イベントハンドラ
   /**
     * レポート出力期間更イベント
     */
    handleChangeReportInterval(interval){
        if (this.props.onChangeReportInterval) {
            this.props.onChangeReportInterval(interval);
        }
    }

    //#endregion

    /**
     * render
     */
    render() {
        const { reportInterval, exportSpanOptions } = this.props;

        return (
            <Row className="flex-center-left">
                <Col md={3} sm={4}>
                    <SelectForm
                        label="出力間隔"
                        isRequired={true}
                        value={reportInterval}
                        options={exportSpanOptions}
                        onChange={(select) => this.handleChangeReportInterval(select)}
                    />
                </Col>
            </Row>
        )
    }
}

RealTimeCondition.propTypes = {
    reportInterval: PropTypes.oneOf(['None', 'OneMinute', 'FiveMinutes', 'TenMinutes']),
    exportSpanOptions: PropTypes.arrayOf(
        PropTypes.shape({
            value: PropTypes.string,
            name:PropTypes.string
        })
    ),
    isGroupingByRack: PropTypes.bool,
    onChangeGroupRack:PropTypes.func
}