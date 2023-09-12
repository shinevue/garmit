'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';

import PropTypes from 'prop-types';

import { ButtonToolbar, Grid, Row, Col } from 'react-bootstrap';

import { VALIDATE_STATE } from 'inputCheck';
import { checkValidation } from 'pointUtility';
import { LAVEL_TYPE } from 'authentication';

import BoxGroup from 'Common/Layout/BoxGroup';
import Button from 'Common/Widget/Button';
import Icon from 'Common/Widget/Icon';

import PointInfoBox from 'Point/PointInfoBox';
import MeasurementInfoBox from 'Point/MeasurementInfoBox';
import AlarmSettingBox from 'Point/AlarmSettingBox';
import ConversionInfoBox from 'Point/ConversionInfoBox';
import DisplayInfoBox from 'Point/DisplayInfoBox';

export default class PointBulkEditForm extends Component {

    constructor(props) {
        super(props);
        this.state = {
            point: {
                tags: [],
                enterpriseMail: -1,
                comment: '',
                useFlg: -1,
                recordInterval: null,
                maintMode: -1,
                format: '',
                scale: null,
                unit: '',
                loopMaxValue: null,
                bufferScale: null,
                onMessage: null,
                offMessage: null,
                onValue: null,
                offValue: null,
                upperError: null,
                upperAlarm: null,
                lowerAlarm: null,
                lowerError: null,
                errorOccurBlindTime: null,
                alarmOccurBlindTime: null,
                errorRecoverBlindTime: null,
                alarmRecoverBlindTime: null,
                convertCoefficients: [],
                convertFormat: '',
                convertUnit: ''
            },
            enableSave: false,
            tagOverwriting: false
        };
    }

    /**
     * コンポーネントがマウントされるときに呼び出されます。
     */
    componentWillMount() {
        this.setState({ inputCheck: this.getDefaultInputCheck(), checked: this.getDefaultChecked() });
    }

    /**
     * デフォルトの入力チェックを返す
     */
    getDefaultInputCheck() {
        const inputCheck = {};
        for (let key of Object.keys(this.state.point)) {
            inputCheck[key] = {};
        }
        return inputCheck;
    }

    /**
     * デフォルトのチェック状態を返す
     */
    getDefaultChecked() {
        const checked = {};
        for (let key of Object.keys(this.state.point)) {
            checked[key] = false;
        }
        return checked;
    }

    /**
     * 全てのポイントが同じデータ型か 
     */
    isAllPointsSameDatatype(points) {
        const datatype = points[0].datatype;
        return !points.some((point) => point.datatype.dtType !== datatype.dtType);
    }

    /**
     * 全てのポイントが接点かどうか
     */
    isAllPointsContact(points) {
        return !points.some((point) => !point.datatype.isContact);
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
                    inputCheck.upperError = checkValidation(point.upperError, 'upperError', point, true);
                    inputCheck.upperAlarm = checkValidation(point.upperAlarm, 'upperAlarm', point, true);
                    inputCheck.lowerAlarm = checkValidation(point.lowerAlarm, 'lowerAlarm', point, true);
                    inputCheck.lowerError = checkValidation(point.lowerError, 'lowerError', point, true);
                }
                else {
                    inputCheck[item.key] = checkValidation(item.value, item.key, point, true);
                }
            }
        })

        this.setState({ point: point, inputCheck: inputCheck }, () => {
            this.setEnableSave();
        })
    }

    /**
     * チェックボックスのチェック状態が変更された時
     * @param {any} keyValues
     */
    onCheckChange(keyValues) {
        const checked = Object.assign({}, this.state.checked);
        const point = Object.assign({}, this.state.point);

        keyValues.forEach((item) => {
            checked[item.key] = item.value;
            if (['upperError', 'upperAlarm', 'lowerAlarm', 'lowerError'].indexOf(item.key) >= 0) {
                point[item.key] = null; 
            }
        });

        this.setState({ point: point, checked: checked }, () => {
            this.setValidation();
        });
    }

    /**
     * 入力チェック状態をセットする
     * @param {func} callback
     */
    setValidation(callback) {
        const { point, checked } = this.state
        let inputCheck = Object.assign({}, this.state.inputCheck)

        for (let key of Object.keys(inputCheck)) {
            inputCheck[key] = checked[key] ? checkValidation(point[key], key, point, true) : { state: '', helpText: '' };
        }

        this.setState({ inputCheck: inputCheck }, () => {
            this.setEnableSave(callback);
        });
    }

    /**
     * 保存ボタン使用可否をセットする
     * @param {func} callback
     */
    setEnableSave(callback) {
        const { inputCheck, point } = this.state;
        const thresholdKeys = ['upperError', 'upperAlarm', 'lowerAlarm', 'lowerError'];
        const thresholdPercentageKeys = ['upperErrorPercentage', 'upperAlarmPercentage', 'lowerAlarmPercentage', 'lowerErrorPercentage'];

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

        this.setState({ enableSave: enableSave }, callback);
    }

    /**
     * 適用ボタンクリック
     */
    onSubmit() {
        if (this.props.onSubmit) {
            const { point, checked } = this.state;
            const points = this.props.points.slice();

            for (let i = 0; i < points.length; i++) {
                const obj = Object.assign({}, points[i]);
                // 一括編集したキーの値を置き換える
                for (let key of Object.keys(point)) {
                    if (checked[key]) {
                        // チェックされている場合のみ置き換える
                        if (key == 'tags' && !this.state.tagOverwriting) {
                            // タグの追加モードの時
                            const tags = obj.tags ? obj.tags.slice() : [];
                            point.tags.forEach((tag) => {
                                if (!tags.some((t) => t.tagId == tag.tagId)) {
                                    tags.push(tag);
                                }
                            });
                            obj.tags = tags;
                        } else {
                            obj[key] = point[key];  
                        }
                    }
                }
                points[i] = obj;
            }

            this.props.onSubmit(points);
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
     * render
     */
    render() {
        const { points, lookUp, onSubmit, onCancel, level } = this.props;
        const { enableSave, point, inputCheck, checked, tagOverwriting } = this.state;

        const sameDatatype = this.isAllPointsSameDatatype(points);
        const allContact = this.isAllPointsContact(points);

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
                            >キャンセル</Button>
                        </ButtonToolbar>
                    </Row>
                </Grid>
                <BoxGroup>
                    <PointInfoBox bulk
                        level={level}
                        point={point}
                        lookUp={lookUp}
                        inputCheck={inputCheck}
                        checked={checked}
                        onEdit={(val) => this.handleEdit(val)}
                        onCheckChange={(val) => this.onCheckChange(val)}
                        tagOverwriting={tagOverwriting}
                        onTagModeChange={(val) => this.setState({tagOverwriting: val })}
                    />
                    {level !== LAVEL_TYPE.normal &&
                        <MeasurementInfoBox bulk
                            level={level}
                            point={point}
                            lookUp={lookUp}
                            inputCheck={inputCheck}
                            checked={checked}
                            onEdit={(val) => this.handleEdit(val)}
                            onCheckChange={(val) => this.onCheckChange(val)}
                        />
                    }
                    {(level === LAVEL_TYPE.administrator || level === LAVEL_TYPE.manager) &&
                        <BoxGroup>
                            {sameDatatype &&
                                <AlarmSettingBox bulk
                                    point={point}
                                    lookUp={lookUp}
                                    inputCheck={inputCheck}
                                    checked={checked}
                                    onEdit={(val) => this.handleEdit(val)}
                                    onCheckChange={(val) => this.onCheckChange(val)}
                                />
                            }
                            {allContact &&
                                <DisplayInfoBox bulk
                                    point={point}
                                    lookUp={lookUp}
                                    inputCheck={inputCheck}
                                    checked={checked}
                                    onEdit={(val) => this.handleEdit(val)}
                                    onCheckChange={(val) => this.onCheckChange(val)}
                                />
                            }
                            {sameDatatype &&
                                <ConversionInfoBox bulk
                                    point={point}
                                    lookUp={lookUp}
                                    inputCheck={inputCheck}
                                    checked={checked}
                                    onEdit={(val) => this.handleEdit(val)}
                                    onCheckChange={(val) => this.onCheckChange(val)}
                                />
                            }
                        </BoxGroup>
                    }
                </BoxGroup>
            </div>
        );
    }
}