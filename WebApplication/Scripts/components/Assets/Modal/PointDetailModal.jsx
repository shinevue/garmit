/**
 * Copyright 2017 DENSO Solutions
 * 
 * ポイント詳細モーダル Reactコンポーネント
 *  
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { sendData, EnumHttpMethod, NETWORKERROR_MESSAGE } from 'http-request';
import { convertToFormattedString } from 'numberUtility';
import { getLocationsList } from 'locationBreadcrumb';
import { getBarInfo } from 'thresholdUtility';
import { showErrorModalInfo, showSuccessModalInfo, showConfirmInfo, closeModalInfo } from 'messageModalUtility';

import { Button, Modal, Row, Col, ControlLabel, ProgressBar } from 'react-bootstrap';

import BarGraph from 'Common/Widget/BarGraph';
import PointValueDispLabel from 'Assets/PointValueDispLabel.jsx';
import LocationBreadcrumb from 'Assets/LocationBreadcrumb.jsx';
import AlarmInfoPanel from 'Assets/AlarmSettingPanel/AlarmInfoPanel.jsx';
import MessageModal from 'Assets/Modal/MessageModal';
import WaitingMessage from 'Assets/Modal/WaitingMessage';
import { CloseButton } from 'Assets/GarmitButton';

/**
 * ポイント詳細モーダル
 */
export default class PointDetailModal extends Component {

    constructor(props) {
        super();
        const locations = _.get(this.props, "pointInfo.point.locations");
        this.state = {
            locationsList: locations && getLocationsList(locations),
            targetPoint: _.get(this.props, "pointInfo.point"),
            isEditMode: false,
            messageModalInfo: {
                show: false,
                title: null,
                message: null,
                buttonStyle: null
            },
            showWaitingInfo: {
                show: false,
                type: null
            },
            isLoading: false
        };
    }

    /**********************************
    * 
    * ライフサイクルイベント
    * 
    **********************************/

    /**
     * コンポーネントが新しいpropsを受け取ると実行される
     */
    componentWillReceiveProps(nextProps) {
        if (!this.props.pointInfo && nextProps.pointInfo) {
            //対象ポイントが選択されたらロケーション情報をセットする
            this.setState({ locationsList: getLocationsList(nextProps.pointInfo.point.locations) });
        }
        if (_.get(nextProps, "pointInfo.point.pointNo") !== _.get(this.state.targetPoint, "pointNo")) {
            //対象ポイントが変更された場合
            this.setState({ targetPoint: _.get(nextProps, "pointInfo.point") });
            //ロケーション情報をセットする
            const locations = _.get(nextProps, "pointInfo.point.locations");
            this.setState({ locationsList: locations && getLocationsList(locations) });
        }
    }

    /**
     * コンポーネントをアップデートするかどうか
     */
    shouldComponentUpdate(nextProps, nextState) {
        if (this.props !== nextProps) {
            return true;
        }
        if (this.state !== nextState) {
            return true;
        }
    }

    /**********************************
    * 
    * データ送受信
    * 
    **********************************/
    /**
     * 編集したポイント情報（アラーム設定）を保存する
     */
    postPointInfo(pointInfo) {
        // 必要なデータだけに絞り込んでApiControllerに渡す
        const sendingData = Object.assign({}, {
            pointNo: pointInfo.pointNo,
            upperError: pointInfo.upperError,
            upperAlarm: pointInfo.upperAlarm,
            lowerAlarm: pointInfo.lowerAlarm,
            lowerError: pointInfo.lowerError,
            errorOccurBlindTime: pointInfo.errorOccurBlindTime,
            alarmOccurBlindTime: pointInfo.alarmOccurBlindTime,
            errorRecoverBlindTime: pointInfo.errorRecoverBlindTime,
            alarmRecoverBlindTime: pointInfo.alarmRecoverBlindTime
        });

        this.setState({ isLoading: true, showWaitingInfo: { show: true, type: "save" } });
        sendData(EnumHttpMethod.post, 'api/Point/thresholdBlindTime', sendingData, (requestResult, networkError) => {
            if (!networkError) {
                if (requestResult && requestResult.isSuccess) {
                    this.setState({ messageModalInfo: showSuccessModalInfo("保存", "アラーム設定", requestResult.message) });
                    this.changeMode(false);
                    this.setState({ targetPoint: pointInfo });	//編集内容に置き換え
                    if (this.props.onSaved) {
                        this.props.onSaved(pointInfo);
                    }
                }
                else {
                    this.setState({ messageModalInfo: showErrorModalInfo((requestResult && requestResult.message) ? requestResult.message : "アラーム設定の保存に失敗しました。") });
                }
            } else {
                this.setState({ messageModalInfo: showErrorModalInfo(NETWORKERROR_MESSAGE) });
            }
            this.setState({ isLoading: false, showWaitingInfo: { show: false, type: null } });
        });
    }

    /**
     * ポイント情報（閾値と不感時間）を更新する
     */
    getPointInfo() {
        this.setState({ isLoading: true, showWaitingInfo: { show: true, type: "update" } });
        const pontNoList = [this.state.targetPoint.pointNo];
        sendData(EnumHttpMethod.post, 'api/Point/getPoints', pontNoList, (data, networkError) => {
            if (!networkError) {
                if (data && data.points.length > 0) {
                    this.setState({ targetPoint: data.points[0] })
                }
                else {
                    this.setState({ messageModalInfo: showErrorModalInfo("アラーム情報の更新に失敗しました。") });
                }
            } else {
                this.setState({ messageModalInfo: showErrorModalInfo(NETWORKERROR_MESSAGE) });
            }
            this.setState({ isLoading: false, showWaitingInfo: { show: false, type: null } });
        });
    }

    /**********************************
    * 
    * イベントハンドラ
    * 
    **********************************/

    /**
     * モードを変更する
     * @param {object} isEditMode 編集モードかどうか
     */
    handleChangeMode(isEditMode) {
        this.setState({ isEditMode: isEditMode });
    }

    /**
     * 編集したアラーム情報を保存する
     * @param {object} alarmInfo 編集後のアラーム情報
     */
    handleClickSave(alarmInfo) {
        const newPointInfo = {
            ...this.state.targetPoint,
            ...alarmInfo
        };
        this.postPointInfo(newPointInfo);
    }

    /**
     * モーダルを閉じるときのイベント
     */
    handleConfirmCloseModal() {
        if (this.state.isEditMode) {
            this.setState({ messageModalInfo: showConfirmInfo("アラーム設定編集を保存せずに閉じてもよろしいですか？", this.handleCloseModal) });
        }
        else {
            this.handleCloseModal();
        }
    }

    /**
     * モーダルを閉じるときのイベント
     */
    handleCloseModal = () => {
        this.changeMode(false);
        this.setState({ messageModalInfo: closeModalInfo() });
        if (this.props.onClose) {
            this.props.onClose();
        }
    }

    /**
     * 更新ボタン押下イベント
     */
    handleClickUpdate() {
        this.getPointInfo();
    }

    /**********************************
    *
    * ゲッターメソッド
    *
    **********************************/

    /**
     * ロケーション表示
     */
    getLocationDisplay(locationsList) {
        if (locationsList && locationsList.length > 0) {
            return (
                <Row>
                    <Col sm={3}>
                        <div className="flex-center">
                            <ControlLabel bsClass="mt-05">ロケーション：</ControlLabel>
                        </div>
                    </Col>
                    <Col sm={9}>
                        {locationsList.map((rootLocation) => {
                            return <LocationBreadcrumb locationList={rootLocation} />;
                        })
                        }
                    </Col>
                </Row>
            );
        }
    }

    /**
     * 計測値表示のゲッターメソッド
     */
    getValueDisplay(valueData, targetPointInfo, isConvert) {
        const { format, unit, dateValuePairs, alarmClassName, breaker, point } = valueData;
        const scaledValue = _.get(dateValuePairs, "[0].scaledValue");
        const unconvertedValue = _.get(dateValuePairs, "[0].unconvertedValue");
        const displayString = _.get(dateValuePairs, "[0].displayString");
        return (
            <div>
                <Row className="flex-top-left">
                    <Col sm={3}>
                        <div className="flex-center mt-1">
                            <ControlLabel>現在の計測値：</ControlLabel>
                        </div>
                    </Col>
                    <Col sm={9}>
                        <PointValueDispLabel
                            dispOnly={true}
                            displayString={displayString}
                            scaledValue={scaledValue}
                            unconvertedValue={unconvertedValue}
                            format={format}
                            unit={unit}
                            unconvertedUnit={_.get(point, 'unit')}
                            unconvertedFormatString={_.get(point, 'format')}
                            isConvert={isConvert}
                            alarmClassName={alarmClassName}
                        />
                        <ThresholdBarSelector
                            alarmClassName={this.getBsStyleName(alarmClassName)}
                            value={unconvertedValue ? unconvertedValue : scaledValue ? scaledValue : null}
                            thresholdInfo={_.pick(targetPointInfo, ['lowerError', 'lowerAlarm', 'upperAlarm', 'upperError'])}
                        />
                    </Col>
                </Row>
            </div>
        );
    }

    /**
     * アラーム情報パネル
     */
    getAlarmInfoPanel(point, isEditMode, isLoading, isReadOnly) {
        return (
            <AlarmInfoPanel
                refs="alarmInfoPanel"
                pointInfo={point}
                isEditMode={isEditMode}
                isLoading={isLoading}
                isReadOnly={isReadOnly}
                onChangeMode={(isEditMode) => this.handleChangeMode(isEditMode)}
                onClickSave={(alarmInfo) => this.handleClickSave(alarmInfo)}
                onClickUpdate={() => this.handleClickUpdate()}
            />
        );
    }

    /**
     * render
     */
    render() {
        const { show, pointInfo, isReadOnly, isConvert } = this.props;
        const { targetPoint, isEditMode, locationsList, messageModalInfo, showWaitingInfo, isLoading } = this.state;

        return (
            <Modal show={show} backdrop="static" onHide={() => this.handleConfirmCloseModal()}>
                <Modal.Header closeButton>
                    <Modal.Title>ポイント詳細　【{targetPoint ? targetPoint.pointName : null}】</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {locationsList && this.getLocationDisplay(locationsList)}
                    {targetPoint && this.getValueDisplay(pointInfo, targetPoint, isConvert)}
                    {targetPoint && this.getAlarmInfoPanel(targetPoint, isEditMode, isLoading, isReadOnly)}
                </Modal.Body>
                <Modal.Footer>
                    <CloseButton onClick={() => this.handleConfirmCloseModal()} />
                </Modal.Footer>
                <MessageModal
                    {...messageModalInfo}
                    bsSize={"sm"}
                    onCancel={() => this.setState({ messageModalInfo: closeModalInfo() })}
                >{messageModalInfo.message}
                </MessageModal>
                <WaitingMessage {...showWaitingInfo} />
            </Modal>
        );
    }

    //#region その他関数
    /**
     * 設定する定格値を取得する
     * @param ratedInfo {object} 定格値情報
     * @param value {double} ポイントの現在の計測値
     */
    getMaxValue(ratedInfo, value) {
        if (ratedInfo) {
            if (ratedInfo.ratedCurrent) {
                //定格電流値が設定されている場合
                return ratedInfo.ratedCurrent;
            }
        }
        return value; //定格値が設定されていない場合はバーグラフ100％で表示（現在の値を返す）
    }

    /**
    * bsStyle名を取得
    * @param {any} alarmClassName
    */
    getBsStyleName(alarmClassName) {
        switch (alarmClassName) {
            case 'error':
                return 'danger';
            case 'warn':
                return 'warning';
            default:
                return 'success';
        }
    }

    /**
     * バーグラフの補足情報（定格値）を取得する
     * @param ratedInfo {object} 定格値情報
     * @param pointUnit {string} ポイントの単位
     */
    getBarDescription(ratedInfo, pointUnit) {
        if (ratedInfo) {
            if (ratedInfo.ratedCurrent) {
                //定格電流値が設定されている場合
                return `${ratedInfo.ratedCurrent} ${(pointUnit || '')}`;
            }
        }

        else return null;
    }

    /**
    * アラーム設定編集パネルのモードを変更する
    * @param {bool} isEditMode 編集モードに変更するかどうか
    */
    changeMode(isEditMode) {
        this.setState({ isEditMode: isEditMode });
    }
    //#endregion
}

PointDetailModal.propTypes = {
    show: PropTypes.bool,
    pointInfo: PropTypes.shape({
        point: PropTypes.shape({
            pointNo: PropTypes.number
        })
    }),
    isReadOnly: PropTypes.bool,
    isConvert: PropTypes.bool,
    onClose: PropTypes.func,
    onClickSave: PropTypes.func,
    onClickUpdate: PropTypes.func
};

/**
* バーグラフセレクタ
*/
const ThresholdBarSelector = (props) => {
    const { value, thresholdInfo, alarmClassName } = props;
    const { upperError, upperAlarm, lowerError, lowerAlarm } = thresholdInfo;

    //閾値が設定されている数を取得
    const thresholdNumber = _
        .chain(_.pull([upperError, upperAlarm, lowerError, lowerAlarm], null, undefined))
        .size()
        .value();

    if (thresholdNumber <= 1) {
        return <BarGraph alarmClassName={alarmClassName} value={100} max={100} />
    }
    else {
        return (
            <ThresholdBarGroup thresholdNumber={thresholdNumber} value={value} thresholdInfo={thresholdInfo} />
        );
    }
}


/**
* 閾値バーグラフ
*/
const ThresholdBarGroup = ({ thresholdNumber, value, thresholdInfo }) => {
    const { upperError, upperAlarm, lowerError, lowerAlarm } = thresholdInfo;

    const thresholdList = [upperError, upperAlarm, lowerError, lowerAlarm];
    const thresholdMax = _.max(thresholdList);
    const thresholdMin = _.min(thresholdList);
    let barInfo = getBarInfo(thresholdMax, thresholdMin, upperError, upperAlarm, lowerError, lowerAlarm);
    const bufferRange = (thresholdMax - thresholdMin) / 8;  //左右に10%ずつあるバッファ部分の値

    return (
        <div className="mb-1">
            <ThresholdScale barInfo={barInfo} />
            <ThresholdBar barInfo={barInfo} />
            <svg height="30px" style={{ overflow: "visible", width: "100%" }} >
                {value &&
                    <ValueMarkObject
                        value={value}
                        min={thresholdMin - bufferRange}
                        max={thresholdMax + bufferRange}
                    />
                }
            </svg>
        </div>
    );
}

/**
* 閾値表示目盛り
*/
const ThresholdScale = ({ barInfo }) => {
    return (
        <svg height="30px" style={{ overflow: "visible", width: "100%" }} >
            <g transform="translate(0,30)" >
                {barInfo.map((info) => {
                    return (
                        <text width="20" height="30" x={info.position ? info.position + "%" : 0} text-anchor="middle">
                            {info.value}
                        </text>
                    );
                })}
            </g>
        </svg>
    );
}

/**
* 閾値表示バーグラフ
*/
const ThresholdBar = ({ barInfo }) => {
    return (
        <ProgressBar className="mb-0">
            {barInfo.map((info) => {
                return <ProgressBar {...info} />
            })}
        </ProgressBar>
    );
}

/**
* 現在値マーク
*/
const ValueMarkObject = ({ value, max, min }) => {
    let correctedValue = (value - min) / (max - min) * 100;
    correctedValue = isNaN(correctedValue) ? 0 : correctedValue;
    if (correctedValue < 0) {
        correctedValue = 0
    }
    else if (correctedValue > 100) {
        correctedValue = 100;
    }
    return (
        <g transform="translate(-10)" >
            <svg width="20" height="30" x={correctedValue + "%"}>
                <path d="M10 0 L0 15 L10 30 L20 15 Z" style={{ fill: "black" }} />
            </svg>
        </g>
    );
}