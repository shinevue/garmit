'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';

import PropTypes from 'prop-types';

import { ButtonToolbar, Grid, Row, Col } from 'react-bootstrap';

import { VALIDATE_STATE } from 'inputCheck';
import { checkValidation } from 'pointUtility';

import BoxGroup from 'Common/Layout/BoxGroup';
import Button from 'Common/Widget/Button';
import Icon from 'Common/Widget/Icon';

import PointInfoBox from 'Point/PointInfoBox';
import MeasurementInfoBox from 'Point/MeasurementInfoBox';
import AlarmSettingBox from 'Point/AlarmSettingBox';
import ConversionInfoBox from 'Point/ConversionInfoBox';
import DisplayInfoBox from 'Point/DisplayInfoBox';
import EditExpressionModal from 'Point/CalcPointSetting/EditExpressionModal';

export default class PointEditForm extends Component {

    constructor(props) {
        super(props);
        this.state = {
            point: null,
            inputCheck: {
                // 入力チェックする項目
                pointName: {},
                dispName: {},
                datatype: {},
                calcPoint: {},
                locations: {},
                tags: {},
                enterpriseMail: {},
                comment: {},
                datagate: {},
                subGateId: {},
                address: {},
                database: {},
                useFlg: {},
                recordInterval: {},
                detectedFlg: {},
                maintMode: {},
                format: {},
                scale: {},
                unit: {},
                upperError: {},
                upperErrorPercentage: {},
                upperAlarm: {},
                upperAlarmPercentage: {},
                lowerAlarm: {},
                lowerAlarmPercentage: {},
                lowerError: {},
                lowerErrorPercentage: {},
                errorOccurBlindTime: {},
                alarmOccurBlindTime: {},
                errorRecoverBlindTime: {},
                alarmRecoverBlindTime: {},
                onMessage: {},
                offMessage: {},
                onValue: {},
                offValue: {},
                convertCoefficients: {},
                convertFormat: {},
                convertUnit: {},
                loopMaxValue: {},
                pointType: {},
                bufferScale: {}
            },
            showCalcModal:false     //演算ポイント編集モーダルを表示するか
        };
    }

    /**
     * コンポーネントがマウントされるときに呼び出されます。
     */
    componentWillMount() {
        if (this.props.point) {
            this.setEditedPoint(this.props.point);
        }
    }

    /**
     * 編集するポイントをセットします
     * @param {any} point
     */
    setEditedPoint(point) {
        const formattedPoint = Object.assign({}, point);
        formattedPoint.convertCoefficients = formattedPoint.convertCoefficients ? this.sortConvertCoefficients(formattedPoint.convertCoefficients) : [];

        this.setState({ point: formattedPoint }, () => {
            this.setValidation();
        });
    }

    /**
     * 換算係数をインデックスの昇順でソートする
     * @param {any} convertCoefficients
     */
    sortConvertCoefficients(convertCoefficients) {
        const coefficients = convertCoefficients.slice();
        coefficients.sort((a, b) => {
            if (a.index > b.index) return 1;
            if (a.index < b.index) return -1;
            return 0;
        });
        return coefficients;
    }

    /**
     * ポイント情報が変更された時
     */
    handleEdit(keyValues) {
        let point = Object.assign({}, this.state.point);
        let inputCheck = Object.assign({}, this.state.inputCheck);

        keyValues.forEach((item) => {
            point[item.key] = item.value;
            if (item.key in inputCheck) {
                if (['upperError', 'upperAlarm', 'lowerAlarm', 'lowerError'].indexOf(item.key) >= 0) {
                    inputCheck.upperError = checkValidation(point.upperError, 'upperError', point);
                    inputCheck.upperAlarm = checkValidation(point.upperAlarm, 'upperAlarm', point);
                    inputCheck.lowerAlarm = checkValidation(point.lowerAlarm, 'lowerAlarm', point);
                    inputCheck.lowerError = checkValidation(point.lowerError, 'lowerError', point);
                } 
                else {
                    inputCheck[item.key] = checkValidation(item.value, item.key, point);

                    // 追加でチェックしたいものをここに追加
                    if (item.key === 'calcPoint') {
                        inputCheck.recordInterval = checkValidation(point.recordInterval, 'recordInterval', point);
                    }
                    if (item.key === 'datatype') {
                        inputCheck.onValue = checkValidation(point.onValue, 'onValue', point);
                        inputCheck.offValue = checkValidation(point.offValue, 'offValue', point);
                    }
                }
            }
        })

        this.setState({ point: point, inputCheck: inputCheck });
    }

    /**
     * 入力チェック状態をセットする
     * @param {func} callback
     */
    setValidation(callback) {
        const { point } = this.state
        let inputCheck = Object.assign({}, this.state.inputCheck)

        for (let key of Object.keys(inputCheck)) {
            inputCheck[key] = checkValidation(point[key], key, point);
        }

        this.setState({ inputCheck: inputCheck }, callback);
    }

    /**
     * 保存ボタン使用可否をセットする
     * @param {func} callback
     */
    isEnableSave(callback) {
        const { inputCheck, point } = this.state;
        const thresholdKeys = ["upperError", "upperAlarm", "lowerAlarm", "lowerError"];
        const thresholdPercentageKeys = ["upperErrorPercentage", "upperAlarmPercentage", "lowerAlarmPercentage", "lowerErrorPercentage"];

        let enableSave = true;

        for (let k of Object.keys(inputCheck)) {
            if (inputCheck[k].state == VALIDATE_STATE.error) {
                if (thresholdKeys.indexOf(k) >= 0) {
                    if (point[k] != null && point[`${k}Percentage`] == null) {
                        enableSave = false;
                        break;
                    }
                } else if (thresholdPercentageKeys.indexOf(k) >= 0) {
                    if (point[k] != null) {
                        enableSave = false;
                        break;
                    }
                } else {
                    enableSave = false;
                    break;
                }
            }
        }

        return enableSave;
    }

    /**
     * 適用ボタンクリック
     */
    onSubmit() {
        if (this.props.onSubmit) {
            this.props.onSubmit(this.state.point);
        }
    }

    /**
     * キャンセルボタンクリック
     */
    onCancel() {
        if (this.props.onCancel) {
            this.props.onCancel();
        }
    }

    /**
     * 演算ポイント保存イベント
     */
    handleSaveCalcInfo(editInfo){
        this.setState({showCalcModal:false});
        this.handleEdit([{ key:"calcPointSet", value:editInfo }]);
    }

    /**
     * render
     */
    render() {
        const { lookUp, onSubmit, onCancel, level, maintenanceSchedules } = this.props;
        const { point, inputCheck, showCalcModal } = this.state;

        const enableSave = this.isEnableSave();

        return (
            <div>
                <Grid fluid className="mb-05">
                    <Row>
                        <ButtonToolbar className="pull-right">
                            <Button
                                bsStyle="success"
                                onClick={() => this.onSubmit()}
                                disabled={!enableSave}
                            >
                                <Icon className="fal fa-save mr-05" />
                                <span>保存</span>
                            </Button>
                            <Button
                                iconId="uncheck"
                                bsStyle="lightgray"
                                onClick={() => this.onCancel()}
                            >
                                <span>キャンセル</span>
                            </Button>
                        </ButtonToolbar>

                    </Row>
                </Grid>
                <BoxGroup>
                    <PointInfoBox
                        level={level}
                        point={point}
                        lookUp={lookUp}
                        inputCheck={inputCheck}
                        onEdit={(val) => this.handleEdit(val)}
                        onClickCalcEdit={()=>this.setState({showCalcModal:true})}
                    />
                    <MeasurementInfoBox
                        level={level}
                        point={point}
                        lookUp={lookUp}
                        inputCheck={inputCheck}
                        maintenanceSchedules={maintenanceSchedules}
                        onEdit={(val) => this.handleEdit(val)}
                    />
                    <AlarmSettingBox
                        level={level}
                        point={point}
                        lookUp={lookUp}
                        inputCheck={inputCheck}
                        onEdit={(val) => this.handleEdit(val)}
                    />
                    <DisplayInfoBox
                        level={level}
                        point={point}
                        lookUp={lookUp}
                        inputCheck={inputCheck}
                        onEdit={(val) => this.handleEdit(val)}
                    />
                    <ConversionInfoBox
                        level={level}
                        point={point}
                        lookUp={lookUp}
                        inputCheck={inputCheck}
                        onEdit={(val) => this.handleEdit(val)}
                    />
                    <EditExpressionModal
                        editingPointNo={point.pointNo}
                        calcPointSet={point.calcPointSet}
                        lookUp={lookUp}
                        show={showCalcModal}
                        isReadOnly={false}
                        onClose={() => this.setState({ showCalcModal: false })}
                        onSave={(editInfo) => this.handleSaveCalcInfo(editInfo)}
                    />
                </BoxGroup>
            </div>
        );
    }
}