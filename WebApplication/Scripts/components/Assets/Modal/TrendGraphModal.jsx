/**
 * Copyright 2017 DENSO Solutions
 * 
 * トレンドグラフモーダル Reactコンポーネント
 *  
 */

import React, { Component } from 'react';

import { Button, Modal, Form, FormControl, Grid, Row, Col } from 'react-bootstrap';

import TrendGraph from 'Common/Widget/TrendGraph';
import Box from 'Common/Layout/Box';
import CheckboxSwitch from 'Common/Widget/CheckboxSwitch';

import AutoUpdateButtonGroup from 'Assets/AutoUpdateButtonGroup';
import MoveButtonGroup from 'Assets/TrendGraph/MoveButtonGroup';
import AutoModeDisplaySpanForm from 'Assets/TrendGraph/AutoModeDisplaySpanForm';
import TimeSpanOption from 'Assets/TrendGraph/TimeSpanOption';
import MessageModal from 'Assets/Modal/MessageModal';
import NetworkAlert from 'Assets/NetworkAlert';

import { sendData, EnumHttpMethod, NETWORKERROR_MESSAGE } from 'http-request';
import { AUTO_UPDATE_VALUES, MEASURED_DATA_TYPE } from 'constant';
import { getTimeAxisTickInterval } from 'trendGraphUtility';
import { validateDate, VALIDATE_STATE, successResult, errorResult } from 'inputCheck';

const DATE_FORMAT = 'YYYY/MM/DD HH:mm';

/**
 * 簡易トレンドグラフモーダル
 * @param {bool} showModal モーダルを表示するか
 * @param {func} onHide モーダルを閉じる処理
 */
export default class TrendGraphModal extends Component {

    constructor(props) {
        super(props);
        const now = moment(moment().format(DATE_FORMAT.replace(/\//g, '-')));
        this.state = {
            updateInterval: props.updateInterval || AUTO_UPDATE_VALUES.none,
            startDate: props.startDate || moment(now).add(-1, 'hours'),
            endDate: props.endDate || moment(now),
            displaySpan: 60,
            inputCheck: {
                startDate: {},
                endDate: {}
            },
            showThreshold: true,
            message: {},
            showNetworkAlert: false
        };
    }

    /**
     * データを読み込む
     * @param {any} callback
     */
    loadData(callback, isUpdate) {
        if (!this.props.pointNos || this.props.pointNos.length === 0) {
            this.setState({ graphDatas: null });
            if (callback) {
                callback(null);
            }
            return;
        }
        const condition = this.createSearchCondition();
        this.setState({ isLoading: true }, () => {
            sendData(EnumHttpMethod.post, '../api/TrendGraph/getByPoint', { lookUp: condition, pointNos: this.props.pointNos }, (info, networkError) => {
                this.setState({ isLoading: false });
                if (info) {
                    this.setState({
                        xMin: condition.startDate,
                        xMax: condition.endDate,
                        graphDatas: info.graphDatas,
                        isLoading: false,
                        zoomed: false
                    });
                }
                if (isUpdate || !networkError) {
                    this.setState({ showNetworkAlert: networkError });
                } else {
                    this.showNetWorkErrorMessage();
                }
                if (callback) {
                    callback(info);
                }
            });
        });
    }

    /**
     * グラフデータを更新する
     * @param {any} interval
     */
    updateValue(interval) {
        if (interval === this.state.updateInterval && !this.state.zoomed) {
            this.loadData(() => this.setTimer(interval), true);
        } else {
            this.setTimer(interval);
        }
    }

    /**
     * タイマーをスタートする
     */
    startTimer() {
        this.setTimer(AUTO_UPDATE_VALUES.slow);
        this.setTimer(AUTO_UPDATE_VALUES.fast);
    }

    /**
     * タイマーを設定する
     * @param {any} interval
     */
    setTimer(interval) {
        if (interval === AUTO_UPDATE_VALUES.fast) {
            this.fastTimerId = setTimeout(() => this.updateValue(interval), interval);
        } else if (interval === AUTO_UPDATE_VALUES.slow) {
            this.slowTimerId = setTimeout(() => this.updateValue(interval), interval);
        }
    }

    /**
     * タイマーが動いている場合はクリアする
     */
    clearAllTimer() {
        if (this.fastTimerId) {
            clearTimeout(this.fastTimerId);
        }
        if (this.slowTimerId) {
            clearTimeout(this.slowTimerId);
        }
    }

    /**
     * 検索条件を生成する
     */
    createSearchCondition() {
        const condition = {};
        if (this.state.updateInterval === AUTO_UPDATE_VALUES.none) {
            condition.startDate = this.state.startDate;
            condition.endDate = this.state.endDate;
        } else {
            condition.endDate = moment(moment().format(DATE_FORMAT.replace(/\//g, '-')));
            condition.startDate = moment(condition.endDate).add(this.state.displaySpan * (-1), 'minutes');
        }
        return condition;
    }

    /**
     * 自動更新周期が変更された時
     * @param {any} newInterval
     */
    onUpdateIntervalChange(newInterval) {
        if (newInterval === AUTO_UPDATE_VALUES.none) {
            // 自動更新がOFFになった場合はタイマークリア
            this.clearAllTimer();
        }
        else if (this.state.updateInterval === AUTO_UPDATE_VALUES.none) {
            // 自動更新がONになった場合はタイマースタート
            this.startTimer();
        }
        this.setState({ updateInterval: newInterval });
    }

    /**
     * 自動更新時の表示期間が変更された時
     * @param {any} val
     */
    onDisplaySpanChange(val) {
        this.setState({ displaySpan: val }, () => {
            this.loadData();
        });
    }

    /**
     * 表示期間が変更された時
     * @param {any} from
     * @param {any} to
     */
    onTimeSpanChenged(from, to) {
        const inputCheck = Object.assign({}, this.state.inputCheck);
        inputCheck.from = validateDate(from, DATE_FORMAT, false);
        inputCheck.to = validateDate(to, DATE_FORMAT, false);
        if (inputCheck.from.state == VALIDATE_STATE.success && inputCheck.to.state == VALIDATE_STATE.success && !moment(to).isAfter(from)) {
            inputCheck.to = errorResult('終了日時は開始日時以降となるように設定してください');
        }

        this.setState({ startDate: from, endDate: to, inputCheck: inputCheck });
    }

    /**
     * 表示期間移動ボタンがクリックされた時
     * @param {any} isWhole
     * @param {any} isForward
     */
    onMoveClick(isWhole, isForward) {
        let moveSpan;
        const { xMin, xMax } = this.state;

        if (isWhole) {
            moveSpan = {
                amount: moment(xMax).diff(moment(xMin)),
                key: 'milliseconds'
            }
        } else {
            moveSpan = getTimeAxisTickInterval(xMin, xMax);
        }

        if (!isForward) {
            moveSpan.amount = moveSpan.amount * (-1);
        }

        const newFrom = moment(xMin).add(moveSpan.amount, moveSpan.key);
        const newTo = moment(xMax).add(moveSpan.amount, moveSpan.key);

        this.setState({ startDate: newFrom, endDate: newTo }, () => {
            this.loadData();
        });

    }

    /**
     * 入力されている日付にエラーがあるか
     */
    hasInputError() {
        const { inputCheck } = this.state;
        for (let key of Object.keys(inputCheck)) {
            if (inputCheck[key].state === VALIDATE_STATE.error) {
                return true;
            }
        }
        return false;
    }

    /**
     * 最初のレンダリング時にクライアントに一度だけ呼び出されます。
     * Componentがレンダリングされた直後に呼び出されるメソッドです。
     * ここでsetStateを行うと、renderがもう一度呼び出されるためあまり行わないほうがよいです。
     */
    componentDidMount() {
        this.loadData();
    }

    /**
     * 新しいpropsを受け取るときに呼び出されます。
     * propsによってstateを変更する場合はここでthis.setState()を行います。このsetStateでrenderを呼ぶことはありません。
     * @param {*} nextProps 新しいprops
     */
    componentWillReceiveProps(nextProps) {
        if (nextProps.showModal !== this.props.showModal) {
            if (nextProps.showModal) {
                // モーダルが開くとき
                const now = moment(moment().format(DATE_FORMAT.replace(/\//g, '-')));
                this.setState({
                    updateInterval: nextProps.updateInterval || AUTO_UPDATE_VALUES.none,
                    startDate: nextProps.startDate || moment(now).add(-1, 'hours'),
                    endDate: nextProps.endDate || moment(now),
                    inputCheck: {
                        from: successResult,
                        to: successResult
                    }
                });
            } else {
                // モーダルが閉じるとき
                this.clearAllTimer();
                this.setState({ graphDatas: null });
            }
        }

    }

    /**
     * コンポーネントが更新された時
     * @param {any} prevProps
     * @param {any} prevState
     */
    componentDidUpdate(prevProps, prevState) {
        if (JSON.stringify(prevProps) !== JSON.stringify(this.props)) {
            if (this.props.showModal) {
                this.loadData(() => {
                    if (prevProps.showModal !== this.props.showModal) {
                        if (this.state.updateInterval !== AUTO_UPDATE_VALUES.none) {
                            this.startTimer();
                        }
                    }
                });
            }
        }
    }

    /**
     * エラーメッセージを表示する
     * @param {any} message
     */
    showErrorMessage(message) {
        this.setState({
            message: {
                show: true,
                buttonStyle: 'message',
                title: 'エラー',
                message: message,
                onCancel: () => this.clearMessage()
            }
        });
    }

    /**
     * ネットワークエラーメッセージを表示する
     */
    showNetWorkErrorMessage() {
        this.showErrorMessage(NETWORKERROR_MESSAGE);
    }

    /**
     * メッセージをクリアする
     */
    clearMessage() {
        this.setState({ message: Object.assign({}, this.state.message, { show: false }) });
    }

    /**
     * render
     */
    render() {
        const { showModal, onHide } = this.props;
        const { graphDatas, xMin, xMax, updateInterval, displaySpan, startDate, endDate, inputCheck, isLoading, zoomed, showThreshold, message, showNetworkAlert } = this.state;
        return (
            <Modal show={this.props.showModal} onHide={() => onHide()} bsSize="lg">
                <Modal.Header closeButton>
                    <Modal.Title>トレンドグラフ</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <NetworkAlert show={showNetworkAlert} />
                    <Grid fluid>
                        <Row className="mb-1">
                            <TimeSpanOption
                                disabled={updateInterval !== AUTO_UPDATE_VALUES.none}
                                from={startDate}
                                to={endDate}
                                measuredDataType={MEASURED_DATA_TYPE.realTime}
                                format={DATE_FORMAT}
                                timeChanged={(from, to) => this.onTimeSpanChenged(from, to)}
                                validationFrom={inputCheck.from}
                                validationTo={inputCheck.to}
                            />
                        </Row>
                        <Row className="mb-1">
                            <Col sm={12}>
                                <Button
                                    bsStyle="primary"
                                    disabled={this.hasInputError() || updateInterval !== AUTO_UPDATE_VALUES.none}
                                    onClick={() => this.loadData()}
                                >
                                    <span>表示</span>
                                </Button>
                            </Col>
                        </Row>
                    </Grid>
                    <Box boxStyle='default' isLoading={isLoading} className="mb-0" style={{ border: 'none' }}>
                        <Box.Header>
                            <Box.Title>グラフデータ</Box.Title>
                        </Box.Header >
                        <Box.Body>
                            <Grid fluid>
                                <Row className="mb-1">
                                    <div className="pull-left">
                                        <CheckboxSwitch
                                            text="閾値表示"
                                            bsSize="xs"
                                            checked={showThreshold}
                                            onChange={(checked) => this.setState({ showThreshold: checked })}
                                        />
                                    </div>
                                    <div className="pull-right">
                                        <AutoUpdateButtonGroup
                                            value={updateInterval}
                                            onChange={(val) => this.onUpdateIntervalChange(val)}
                                            onManualUpdateClick={() => this.loadData(null, true)}
                                        />
                                        {zoomed && updateInterval !== AUTO_UPDATE_VALUES.none &&
                                            <div className="mtb-05 ta-r">※ズーム表示中は自動更新されません</div>
                                        }
                                    </div>
                                </Row>
                                <Row>
                                    {updateInterval !== AUTO_UPDATE_VALUES.none ?
                                        <AutoModeDisplaySpanForm
                                            className="ta-r"
                                            measuredDataType={MEASURED_DATA_TYPE.realTime}
                                            value={displaySpan}
                                            onChange={(value) => this.onDisplaySpanChange(value)}
                                        />
                                        :
                                        <MoveButtonGroup
                                            className="ta-c"
                                            onDoubleLeftClick={() => this.onMoveClick(true, false)}
                                            onLeftClick={() => this.onMoveClick(false, false)}
                                            onRightClick={() => this.onMoveClick(false, true)}
                                            onDoubleRightClick={() => this.onMoveClick(true, true)}
                                        />
                                    }
                                </Row>
                                <Row>
                                    <TrendGraph
                                        dateTo={xMax}
                                        dateFrom={xMin}
                                        graphDatas={graphDatas}
                                        controller={true}
                                        targetHeight={320}
                                        controllerHeight={120}
                                        showThreshold={showThreshold}
                                        onZoom={() => this.setState({ zoomed: true })}
                                        onZoomReset={() => this.setState({ zoomed: false })}
                                        autoScale={true}
                                    />
                                </Row>
                            </Grid>
                        </Box.Body>
                    </Box>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={() => onHide()}>閉じる</Button>
                </Modal.Footer>
                <MessageModal
                    show={message.show}
                    title={message.title}
                    bsSize="small"
                    buttonStyle={message.buttonStyle}
                    onOK={message.onOK}
                    onCancel={message.onCancel}
                >
                    {message.message}
                </MessageModal>
            </Modal>
        )
    }
}

TrendGraphModal.propTypes = {
    showModal: PropTypes.bool,
    onHide: PropTypes.func,
    startDate: PropTypes.object,
    endDate: PropTypes.object,
    updateInterval: PropTypes.updateInterval
}

TrendGraphModal.defaultProps = {
    showModal: false,
    onHide: () => { },
    updateInterval: AUTO_UPDATE_VALUES.none,
}