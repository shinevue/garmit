/**
 * Copyright 2017 DENSO Solutions
 * 
 * GraphSettingModal Reactコンポーネント
 *  
 */

'use strict';

import React, { Component } from 'react';
import { Modal, Panel, FormControl, FormGroup, ControlLabel, Checkbox, Grid, Row, Col } from 'react-bootstrap';

import Button from 'Common/Widget/Button';
import Icon from 'Common/Widget/Icon';
import ColorForm from 'Common/Form/ColorForm';
import LabelForm from 'Common/Form/LabelForm';
import TextForm from 'Common/Form/TextForm';
import ToggleSwitch from 'Common/Widget/ToggleSwitch';
import InputTable from 'Common/Form/InputTable';


import { VALIDATE_STATE, successResult, validateInteger, validateReal, errorResult } from 'inputCheck';

export default class GraphSettingModal extends Component {

    constructor(props) {
        super(props)
        this.state = {
            trendGraphSet: props.trendGraphSet,
            autoScale: props.autoScale,
            inputCheck: this.getInitialInputCheck(props.trendGraphSet)
        }
    }

    /**
     * コンポーネントが新しいpropsを受け取ったとき
     * @param {any} nextProps
     */
    componentWillReceiveProps(nextProps) {
        // モーダルが開くとき
        if (nextProps.showModal != this.props.showModal && nextProps.showModal) {
            this.setState({ autoScale: nextProps.autoScale, trendGraphSet: nextProps.trendGraphSet, inputCheck: this.getInitialInputCheck(nextProps.trendGraphSet) });
        }
    }

    /**
     * 選択中の色が変更されたとき
     * @param {any} val
     * @param {any} pointNo
     */
    onColorChange(val, pointNo) {
        const trendGraphSet = Object.assign({}, this.state.trendGraphSet);
        const newGraphPoints = trendGraphSet.graphPoints.slice();

        for (let i = 0; i < newGraphPoints.length; i++) {
            if (newGraphPoints[i].pointNo === pointNo) {
                const points = Object.assign({}, newGraphPoints[i]);
                points.graphColor = val;
                newGraphPoints[i] = points;
                break;
            }
        }
        trendGraphSet.graphPoints = newGraphPoints;
        this.setState({ trendGraphSet: trendGraphSet });
    }

    /**
     * 軸の値が変更された時
     * @param {any} val 値
     * @param {any} key キー (yAxisMin, yAxisMax, yAxisInterval)
     * @param {any} dataType データ種別
     */
    onAxisValueChange(val, key, dataType) {
        const trendGraphSet = Object.assign({}, this.state.trendGraphSet);
        const newDataTypes = trendGraphSet.dataTypes.slice();
        const inputCheck = this.state.inputCheck.slice();

        for (let i = 0; i < newDataTypes.length; i++) {
            if (newDataTypes[i].dtType === dataType.dtType) {
                const dataType = Object.assign({}, newDataTypes[i]);
                dataType[key] = val;
                newDataTypes[i] = dataType;

                const obj = Object.assign({}, inputCheck[dataType.dtType]);
                obj.yAxisMin = validateReal(dataType.yAxisMin, -9999, 9999, true, 1);
                obj.yAxisMax = validateReal(dataType.yAxisMax, -9999, 9999, true, 1);
                obj.yAxisInterval = validateReal(dataType.yAxisInterval, 0.1, 9999, true, 1);

                if (parseFloat(dataType.yAxisMin) >= parseFloat(dataType.yAxisMax)) {
                    obj.yAxisMin = errorResult('最大より小さい値を入力してください');
                    obj.yAxisMax = errorResult('最小より大きい値を入力してください');
                } else if ((parseFloat(dataType.yAxisMax) - parseFloat(dataType.yAxisMin)) < dataType.yAxisInterval) {
                    obj.yAxisInterval = errorResult('最大と最小の差分以下の値を入力してください');
                }

                inputCheck[dataType.dtType] = obj;

                break;
            }
        }
        trendGraphSet.dataTypes = newDataTypes;
        this.setState({ trendGraphSet: trendGraphSet, inputCheck: inputCheck });
    }

    /**
     * カラーフォームを作成する
     */
    makeColorForms() {
        const { trendGraphSet } = this.state;

        return (
            <InputTable
                headerInfo={[
                    { columnSize: 2, label: 'ポイント' },
                    { columnSize: 1, label: '色' }
                ]}
                inputComponentList={[LabelForm, ColorForm]}
                data={
                    trendGraphSet && trendGraphSet.graphPoints && trendGraphSet.graphPoints.map((point, i) => {
                        return {
                            id: i,
                            columnInfo: [
                                { value: point.pointName },
                                {
                                    color: point.graphColor,
                                    onChange: (val) => this.onColorChange(val, point.pointNo)
                                }
                            ]
                        };
                    })
                }
            />    
            
        );
    }

    /**
     * 軸設定フォームを生成する
     */
    makeAxisValueForms() {
        const { trendGraphSet, inputCheck } = this.state;

        return (
            <InputTable
                headerInfo={[
                    { label: 'データ種別', columnSize: 1 },
                    { label: '最小値', columnSize: 1 },
                    { label: '最大値', columnSize: 1 },
                    { label: '目盛間隔', columnSize: 1 }
                ]}
                inputComponentList={[LabelForm, TextForm, TextForm, TextForm]}
                data={
                    trendGraphSet && trendGraphSet.dataTypes && trendGraphSet.dataTypes.map((datatype, i) => {
                        const validation = inputCheck[datatype.dtType];
                        return {
                            id: i,
                            columnInfo: [
                                { value: datatype.name },
                                {
                                    value: datatype.yAxisMin,
                                    onChange: (val) => this.onAxisValueChange(val, 'yAxisMin', datatype),
                                    validationState: validation && validation.yAxisMin && validation.yAxisMin.state,
                                    helpText: validation && validation.yAxisMin && validation.yAxisMin.helpText
                                },
                                {
                                    value: datatype.yAxisMax,
                                    onChange: (val) => this.onAxisValueChange(val, 'yAxisMax', datatype),
                                    validationState: validation && validation.yAxisMax && validation.yAxisMax.state,
                                    helpText: validation && validation.yAxisMax && validation.yAxisMax.helpText
                                },
                                {
                                    value: datatype.yAxisInterval,
                                    onChange: (val) => this.onAxisValueChange(val, 'yAxisInterval', datatype),
                                    validationState: validation && validation.yAxisInterval && validation.yAxisInterval.state,
                                    helpText: validation && validation.yAxisInterval && validation.yAxisInterval.helpText
                                }
                            ]
                        };
                    })
                }
            />
        );
    }

    /**
     * 入力エラーがあるか
     */
    hasInputError() {
        const { inputCheck } = this.state;
        for (let i = 0; i < inputCheck.length; i++) {
            if (inputCheck[i]) {
                for (let key of Object.keys(inputCheck[i])) {
                    if (inputCheck[i][key] && inputCheck[i][key].state === VALIDATE_STATE.error) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    /**
     * 初期入力チェックをセットする
     */
    getInitialInputCheck(trendGraphSet) {
        const inputCheck = [];

        trendGraphSet && trendGraphSet.dataTypes.forEach((dataType) => {
            inputCheck[dataType.dtType] = {
                yAxisMin: successResult,
                yAxisMax: successResult,
                yAxisInterval: successResult,
            };
        }); 

        return inputCheck;
    }

    /**
     * render
     */
    render() {
        const { showModal, onCancel, onSave } = this.props
        const { trendGraphSet, autoScale, inputCheck } = this.state

        return (
            <Modal show={this.props.showModal} onHide={() => onCancel()} bsSize="lg" backdrop="static">
                <Modal.Header closeButton>
                    <Modal.Title>グラフ設定</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Row>
                        <Col md={6}>
                            <Panel header="Y軸モード">
                                <ToggleSwitch
                                    bsSize="sm"
                                    value={autoScale ? 1 : 0}
                                    name="autoScale"
                                    swichValues={[{ value: 1, text: '自動' }, { value: 0, text: '手動' }]}
                                    onChange={() => this.setState({ autoScale: !autoScale })}
                                />
                            </Panel>
                            <Panel header="Y軸設定値（※手動時）">
                                <div style={{ maxHeight: 378, overflow: 'auto' }}>
                                    {this.makeAxisValueForms()}
                                </div>
                            </Panel>
                        </Col>
                        <Col md={6}>
                            <Panel header="グラフ色">
                                <div style={{ maxHeight: 500, overflow: 'auto' }}>
                                    {this.makeColorForms()}
                                </div>
                            </Panel>
                        </Col>
                    </Row>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        bsStyle="success"
                        onClick={() => onSave(trendGraphSet, autoScale)}
                        disabled={this.hasInputError()}
                    >
                        <Icon className="fal fa-save mr-05" />
                        <span>保存</span>
                    </Button>
                    <Button
                        iconId="uncheck"
                        bsStyle="lightgray"
                        onClick={() => onCancel()}
                    >
                        <span>キャンセル</span>
                    </Button>
                </Modal.Footer>
            </Modal>
        )
    }
}