/**
 * Copyright 2017 DENSO Solutions
 * 
 * ポイント選択モーダル Reactコンポーネント
 *  
 */

import React, { Component } from 'react';

import { Modal, Grid, Row, Col, Checkbox } from 'react-bootstrap';

import Button from 'Common/Widget/Button';
import Icon from 'Common/Widget/Icon';

import TextForm from 'Common/Form/TextForm';


import { sendData, EnumHttpMethod } from 'http-request';

/**
 * PointSelectModal
 * @param {bool} showModal モーダルを表示するか
 * @param {bool} multiSelect 複数選択可かどうか
 * @param {object} lookUp マスターデータ
 * @param {func} onSubmit 適用ボタンクリック時に呼ぶ関数
 * @param {func} onCancel キャンセルボタンクリック時に呼ぶ関数
 */
export default class DefaultApplyModal extends Component {

    constructor(props) {
        super(props)
        this.state = {
            checked: {
                upperError: true,
                upperAlarm: true,
                lowerAlarm: true,
                lowerError: true,
                errorOccurBlindTime: true,
                alarmOccurBlindTime: true,
                errorRecoverBlindTime: true,
                alarmRecoverBlindTime: true
            }
        }
    }

    componentDidMount() {

    }

    /**
     * 新しいpropsを受け取ると実行される
     * @param {any} nextProps
     */
    componentWillReceiveProps(nextProps) {

    }

    /**
     * チェックボックスがクリックされたとき
     * @param {any} key
     */
    onCheckChange(key) {
        const checked = Object.assign({}, this.state.checked);
        checked[key] = !checked[key];
        this.setState({ checked: checked });
    }

    onApply() {
        const { datatype } = this.props.point;
        const { checked } = this.state;

        const changeValues = [];
        
        if (checked.upperError) {
            changeValues.push({ value: datatype.defaultUpperError, key: 'upperError' });
            changeValues.push({ value: null, key: 'upperErrorPercentage' });
        }
        if (checked.upperAlarm) {
            changeValues.push({ value: datatype.defaultUpperAlarm, key: 'upperAlarm' });
            changeValues.push({ value: null, key: 'upperAlarmPercentage' });
        }
        if (checked.lowerAlarm) {
            changeValues.push({ value: datatype.defaultLowerAlarm, key: 'lowerAlarm' });
            changeValues.push({ value: null, key: 'lowerAlarmPercentage' });
        }
        if (checked.lowerError) {
            changeValues.push({ value: datatype.defaultLowerError, key: 'lowerError' });
            changeValues.push({ value: null, key: 'lowerErrorPercentage' });
        }
        if (checked.errorOccurBlindTime) {
            changeValues.push({ value: datatype.defaultErrorOcBlindTime, key: 'errorOccurBlindTime' });
        }
        if (checked.alarmOccurBlindTime) {
            changeValues.push({ value: datatype.defaultAlarmOcBlindTime, key: 'alarmOccurBlindTime' });
        }
        if (checked.errorRecoverBlindTime) {
            changeValues.push({ value: datatype.defaultErrorRcBlindTime, key: 'errorRecoverBlindTime' });
        }
        if (checked.alarmRecoverBlindTime) {
            changeValues.push({ value: datatype.defaultAlarmRcBlindTime, key: 'alarmRecoverBlindTime' });
        }
        this.props.onApply(changeValues);
        this.props.onHide();
    }

    /**
     * render
     */
    render() {
        const { showModal, onHide, point } = this.props;
        const { checked } = this.state;
        const { datatype } = point;

        return (
            <Modal show={showModal} onHide={() => onHide()} backdrop="static">
                <Modal.Header closeButton>
                    <Modal.Title>デフォルト値適用</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {datatype &&
                        <Grid fluid>
                            <Row>
                                <Col sm={5}>
                                    <Checkbox
                                        checked={checked.upperError}
                                        onClick={() => this.onCheckChange('upperError')}
                                    >
                                        閾値（上限異常）
                                </Checkbox>
                                </Col>
                                <Col sm={3}><TextForm value={point.upperError} unit={point.unit || ''} /></Col>
                                <Col sm={1}><div className="pa-t-1">⇒</div></Col>
                                <Col sm={3}><TextForm value={datatype.defaultUpperError} unit={point.unit || ''} /></Col>
                            </Row>
                            <Row>
                                <Col sm={5}>
                                    <Checkbox
                                        checked={checked.upperAlarm}
                                        onClick={() => this.onCheckChange('upperAlarm')}
                                    >
                                        閾値（上限注意）
                                </Checkbox>
                                </Col>
                                <Col sm={3}><TextForm value={point.upperAlarm} unit={point.unit || ''} /></Col>
                                <Col sm={1}><div className="pa-t-1">⇒</div></Col>
                                <Col sm={3}><TextForm value={datatype.defaultUpperAlarm} unit={point.unit || ''} /></Col>
                            </Row>
                            <Row>
                                <Col sm={5}>
                                    <Checkbox
                                        checked={checked.lowerAlarm}
                                        onClick={() => this.onCheckChange('lowerAlarm')}
                                    >
                                        閾値（下限注意）
                                </Checkbox>
                                </Col>
                                <Col sm={3}><TextForm value={point.lowerAlarm} unit={point.unit || ''} /></Col>
                                <Col sm={1}><div className="pa-t-1">⇒</div></Col>
                                <Col sm={3}><TextForm value={datatype.defaultLowerAlarm} unit={point.unit || ''} /></Col>
                            </Row>
                            <Row>
                                <Col sm={5}>
                                    <Checkbox
                                        checked={checked.lowerError}
                                        onClick={() => this.onCheckChange('lowerError')}
                                    >
                                        閾値（下限異常）
                                </Checkbox>
                                </Col>
                                <Col sm={3}><TextForm value={point.lowerError} unit={point.unit || ''} /></Col>
                                <Col sm={1}><div className="pa-t-1">⇒</div></Col>
                                <Col sm={3}><TextForm value={datatype.defaultLowerError} unit={point.unit || ''} /></Col>
                            </Row>
                            <Row>
                                <Col sm={5}>
                                    <Checkbox
                                        checked={checked.errorOccurBlindTime}
                                        onClick={() => this.onCheckChange('errorOccurBlindTime')}
                                    >
                                        不感時間（異常発生）
                                </Checkbox>
                                </Col>
                                <Col sm={3}><TextForm value={point.errorOccurBlindTime} unit="秒" /></Col>
                                <Col sm={1}><div className="pa-t-1">⇒</div></Col>
                                <Col sm={3}><TextForm value={datatype.defaultErrorOcBlindTime} unit="秒" /></Col>
                            </Row>
                            <Row>
                                <Col sm={5}>
                                    <Checkbox
                                        checked={checked.alarmOccurBlindTime}
                                        onClick={() => this.onCheckChange('alarmOccurBlindTime')}
                                    >
                                        不感時間（注意発生）
                                </Checkbox>
                                </Col>
                                <Col sm={3}><TextForm value={point.alarmOccurBlindTime} unit="秒" /></Col>
                                <Col sm={1}><div className="pa-t-1">⇒</div></Col>
                                <Col sm={3}><TextForm value={datatype.defaultAlarmOcBlindTime} unit="秒" /></Col>
                            </Row>
                            <Row>
                                <Col sm={5}>
                                    <Checkbox
                                        checked={checked.errorRecoverBlindTime}
                                        onClick={() => this.onCheckChange('errorRecoverBlindTime')}
                                    >
                                        不感時間（異常復旧）
                                </Checkbox>
                                </Col>
                                <Col sm={3}><TextForm value={point.errorRecoverBlindTime} unit="秒" /></Col>
                                <Col sm={1}><div className="pa-t-1">⇒</div></Col>
                                <Col sm={3}><TextForm value={datatype.defaultErrorRcBlindTime} unit="秒" /></Col>
                            </Row>
                            <Row>
                                <Col sm={5}>
                                    <Checkbox
                                        checked={checked.alarmRecoverBlindTime}
                                        onClick={() => this.onCheckChange('alarmRecoverBlindTime')}
                                    >
                                        不感時間（注意復旧）
                                </Checkbox>
                                </Col>
                                <Col sm={3}><TextForm value={point.alarmRecoverBlindTime} unit="秒" /></Col>
                                <Col sm={1}><div className="pa-t-1">⇒</div></Col>
                                <Col sm={3}><TextForm value={datatype.defaultAlarmRcBlindTime} unit="秒" /></Col>
                            </Row>
                        </Grid>
                    }
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        bsStyle="primary"
                        onClick={() => this.onApply()}
                    >
                        <Icon className="fal fa-circle mr-05" />
                        <span>適用</span>
                    </Button>
                    <Button
                        iconId="uncheck"
                        bsStyle="lightgray"
                        onClick={() => onHide()}
                    >
                        <span>キャンセル</span>
                    </Button>
                </Modal.Footer>
            </Modal>
        )
    }
}