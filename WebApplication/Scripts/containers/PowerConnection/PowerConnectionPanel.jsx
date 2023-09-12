/**
 * @license Copyright 2017 DENSO
 * 
 * PowerConnection画面
 * 
 * 画面のコンテナとして。Reduxに依存したコードを記述します。
 * 画面のロジックはここに記述します。（適宜ファイル分割は行うこと）
 * 
 */
'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { sendData, EnumHttpMethod, NETWORKERROR_MESSAGE } from 'http-request';
import { setSessionStorage, getSessionStorage, STORAGE_KEY } from 'webStorage';    //webStorage.jsから関数とストレージキーをインポート
import { changeModalState, showErrorMessage, closeModal } from 'ModalState/actions.js';
import { changeLoadState } from 'LoadState/actions.js';
import { changeNetworkError } from 'NetworkError/actions.js';

import { Row, Col, Grid } from 'react-bootstrap';

import { setEgroupList, setSelectedEgroup, setRightBreaker, setLeftBreaker, setValueLabelData } from './actions.js';

import Content from 'Common/Layout/Content';
import Button from 'Common/Widget/Button';
import Icon from 'Common/Widget/Icon';

import EgroupSelectForm from 'PowerConnection/EgroupSelectForm';
import PowerConnectionRackView from 'PowerConnection/PowerConnectionRackView';
import DistributionBoardMapBox from 'PowerConnection/DistributionBoardMapBox';

import AutoUpdateButtonGroup from 'Assets/AutoUpdateButtonGroup';
import MessageModal from 'Assets/Modal/MessageModal';
import NetworkAlert from 'Assets/NetworkAlert';

import { AUTO_UPDATE_VALUES, DRAW_AREA_SIZE } from 'constant';
import { getEgrouptMapData } from 'makeOmitData';

/**
 * 電源コネクション画面のコンポーネント
 */
class PowerConnectionPanel extends Component {

    /**
     * コンストラクタ
     */
    constructor() {
        super();
        this.state = {
            getInterval: AUTO_UPDATE_VALUES.slow,
            width: DRAW_AREA_SIZE.width,
            height: DRAW_AREA_SIZE.height
        };
    }

    /**
     * 最初のレンダリング時にクライアントに一度だけ呼び出されます。
     * Componentがレンダリングされた直後に呼び出されるメソッドです。
     * ここでsetStateを行うと、renderがもう一度呼び出されるためあまり行わないほうがよいです。
     */
    componentDidMount() {
        const egroupId = getSessionStorage(STORAGE_KEY.egroupId);
        this.getEgroupList((egroupList) => {
            if (egroupId) {
                const selected = this.getMatchEgroup(egroupList, Number(egroupId));
                //選択中電源系統情報をセットする
                if (selected) {
                    this.props.setSelectedEgroup(selected);
                }
            }
        });

        this.setDrawingInfo();  //初期表示時画面サイズに合わせて描画エリアサイズ変更
        window.addEventListener('resize', () => {    //画面サイズ変更イベントを設定
            this.setDrawingInfo();
        });
    }

    /**
     * 新たなPropsを受け取ったときに実行されます
     */
    componentWillReceiveProps(nextProps) {
        if (this.props.selectedEgroup !== nextProps.selectedEgroup) {
            //選択中電源系統が変更された場合
            this.getValueLabelData(_.get(nextProps.selectedEgroup, 'egroupId'));
            if (this.state.getInterval !== AUTO_UPDATE_VALUES.none) {
                //自動更新ON時はタイマーをクリアして再スタート
                this.clearAllTimer();
                this.startTimer();
            }
        }
    }

    //#region データ送受信
    /**
     * 分電盤図一覧を取得する
     */
    getEgroupList(callback) {
        this.props.changeLoadState();
        sendData(EnumHttpMethod.get, "api/power", null, (data, networkError) => {
            if (data) {
                this.props.setEgroupList(data.egroups);
                callback && callback(data.egroups);
            }
            else {
                this.props.showErrorMessage({ message: networkError ? NETWORKERROR_MESSAGE : "分電盤情報の取得に失敗しました。" });
            }
            !networkError && this.props.changeNetworkError(false);
            this.props.changeLoadState();
        });
    }

    /**
     * 分電盤オブジェクトの計測値を取得する
     * @param {int} egroupId 指定したい場合のみ使用
     * @param {func} callback コールバック関数
     */
    getValueLabelData(egroupId, callback) {
        this.props.changeLoadState();
        const postEgroupId = egroupId ? egroupId : _.get(this.props.selectedEgroup, 'egroupId');
        sendData(EnumHttpMethod.get, 'api/powerConnection/value?egroupId=' + postEgroupId, null, (data, networkError) => {
            if (data) {
                this.props.setValueLabelData(data);
            } else if (egroupId != null) {
                this.props.showErrorMessage({ message: "計測値情報の取得に失敗しました。" });
            }
            if (egroupId == null || !networkError) {
                this.props.changeNetworkError(networkError);
            } else {
                this.props.showErrorMessage({ message: NETWORKERROR_MESSAGE });
            }
            callback && callback();
            this.props.changeLoadState();
        });
    }

    /**
     * 選択中ブレーカーにつながるラック情報を取得する
     * @param {bool} isRight 右側のラックかどうか
     * @param {object} selectObject 選択されたオブジェクト情報
     */
    getRackData(isRight, selectObject, selectItemInfo) {
        this.props.changeLoadState();
        const postData = { EgroupId: this.props.selectedEgroup.egroupId, BreakerNo: selectItemInfo.breakerNo }
        sendData(EnumHttpMethod.post, 'api/powerConnection/rack', postData, (data, networkError) => {
            if (data) {
                if (isRight) {
                    this.props.setRightBreaker({ ...data, selectedObject: selectObject, breakerNo: selectItemInfo.breakerNo });
                }
                else {
                    this.props.setLeftBreaker({ ...data, selectedObject: selectObject, breakerNo: selectItemInfo.breakerNo });
                }
            }
            else {
                this.props.showErrorMessage({ message: networkError ? NETWORKERROR_MESSAGE : "ブレーカー情報の取得に失敗しました。" });
            }
            !networkError && this.props.changeNetworkError(false);
            this.props.changeLoadState();
        });
    }
    //#endregion

    //#region イベントハンドラ
    /**
     * 分電盤名称表示オブジェクトクリックイベント
     * @param {object} selectObject クリックされたオブジェクト情報
     */
    handleClickBreaker(isRight, selectObject, selectItemInfo) {
        this.getRackData(isRight, selectObject, selectItemInfo);
    }

    /**
     * 電源系統編集へボタンクリックイベント
     */
    handleClickMove() {
        const egroupId = this.props.selectedEgroup ? this.props.selectedEgroup.egroupId : -1;
        if (egroupId && egroupId !== -1) {  //電源系統選択中の場合
            setSessionStorage(STORAGE_KEY.egroupId, egroupId);
        }
        window.location.href = '../Maintenance/Power';
    }

    /**
     * 電源系統変更イベント
     * @param {string} selected 選択された電源系統
     */
    handleSelectEgroup(selected) {
        //選択中電源系統情報をセットする
        this.props.setSelectedEgroup(selected);
    }

    /**
     * 更新周期変更イベント
     * @param {number} val 変更後の更新周期
     */
    handleChangeUpdateInterval(val) {
        this.changeInterval(val);
    }

    /**
     * 手動更新ボタンクリックイベント
     */
    handleClickManualUpdate() {
        this.getValueLabelData();   //値を更新
    }

    //#endregion

    //#region render
    /**
     * render
     */
    render() {
        const { egroupList, selectedEgroup, rightBreaker, leftBreaker, valueLabelData, isLoading, networkError } = this.props;
        const { show, title, message } = this.props.modalState;
        const { getInterval, width, height } = this.state;

        return (
            <Content>
                <NetworkAlert show={networkError.isNetworkError} />
                <Row>
                    <Col md={3}>
                        <Button disabled={isLoading || !selectedEgroup} bsStyle='link' className='pa-l-0' onClick={() => this.handleClickMove()}><Icon className='fa fa-angle-double-right mr-05' />電源系統編集へ</Button>
                        <EgroupSelectForm isReadOnly={isLoading} selectedEgroup={selectedEgroup} egroupList={egroupList} onSelectEgroup={(select) => this.handleSelectEgroup(select)} />
                    </Col>
                </Row>
                <Row>
                    <Col sm={12} md={3}>
                        <PowerConnectionRackView
                            selectBreaker={leftBreaker}
                            isLeft={true}
                        />
                    </Col>
                    <Col sm={12} md={6}>
                        <Grid fluid>
                            <div className="pull-right mb-1">
                                <AutoUpdateButtonGroup
                                    disabled={isLoading}
                                    value={getInterval}
                                    onChange={(val) => this.handleChangeUpdateInterval(val)}
                                    onManualUpdateClick={() => this.handleClickManualUpdate()}
                                />
                            </div>
                        </Grid>
                        <DistributionBoardMapBox
                            selectedEgroup={selectedEgroup}
                            valueLabelData={valueLabelData}
                            leftBreaker={leftBreaker}
                            rightBreaker={rightBreaker}
                            originalSize={{ height: DRAW_AREA_SIZE.height, width: DRAW_AREA_SIZE.width }}
                            displaySize={{ width: width, height: height }}
                            isLoading={isLoading}
                            onClickBreakerObject={(isRight, selectObject, selectItemInfo) => this.handleClickBreaker(isRight, selectObject, selectItemInfo)}
                        />
                    </Col>
                    <Col sm={12} md={3}>
                        <PowerConnectionRackView
                            selectBreaker={rightBreaker}
                            isLeft={false}
                        />
                    </Col>
                </Row>
                <MessageModal
                    title={title}
                    show={show}
                    bsSize={"sm"}
                    buttonStyle={"message"}
                    onCancel={() => this.props.closeModal()}
                >{message}
                </MessageModal>
            </Content>
        );
    }
    //#endregion

    //#region タイマー関連
    /**
     * タイマーのインターバルを変更する
     * @param {number} newInterval 新しい更新周期
     */
    changeInterval(newInterval) {
        if (newInterval === AUTO_UPDATE_VALUES.none) {
            //自動更新がOFFになった場合はタイマークリア
            this.clearAllTimer();
        }
        else if (this.state.getInterval === AUTO_UPDATE_VALUES.none) {
            //自動更新がONになった場合はタイマースタート
            this.startTimer();
        }
        this.setState({ getInterval: newInterval });
    }

    /**
     * タイマーをスタートする
     */
    startTimer() {
        this.setTimer(AUTO_UPDATE_VALUES.slow);
        this.setTimer(AUTO_UPDATE_VALUES.fast);
    }

    /**
     * 計測値を更新する
     * @param {number} interval 収集周期
     */
    updateValue(interval) {
        if (interval === this.state.getInterval) {
            //更新用関数
            this.getValueLabelData(null, () => {
                this.setTimer(interval);
            });
        }
        else {
            this.setTimer(interval);
        }
    }

    /**
    * タイマーを設定する
    * @param {number} interval 収集周期
    */
    setTimer(interval) {
        if (interval === AUTO_UPDATE_VALUES.fast) {
            this.fastTimerId = setTimeout(() => { this.updateValue(interval) }, interval);
        }
        else if (interval === AUTO_UPDATE_VALUES.slow) {
            this.slowTimerId = setTimeout(() => { this.updateValue(interval) }, interval);
        }
    }

    /**
     * タイマーが動いている場合はをクリアする
     */
    clearAllTimer() {
        if (this.fastTimerId) {
            clearTimeout(this.fastTimerId);
        }
        if (this.slowTimerId) {
            clearTimeout(this.slowTimerId);
        }
    }

    //#endregion

    //#region その他関数
    /**
     * 電源系統一覧からIDが一致する電源系統情報を検索して取得する
     * @param {array} egroupList 電源系統一覧
     * @param {number} egroupId　電源系統ID
     */
    getMatchEgroup(egroupList, egroupId) {
        for (let i = 0; i < egroupList.length; i++) {
            if (egroupList[i].egroupId === egroupId) {
                return Object.assign({}, egroupList[i]);
            } else if (egroupList[i].children && egroupList[i].children.length) {
                const egroup = this.getMatchEgroup(egroupList[i].children, egroupId);
                if (egroup) {
                    return Object.assign({}, egroup);
                }
            }
        }
    }

    /**
     * 描画エリアの幅と高さをセットする
     */
    setDrawingInfo() {
        const { width, height } = this.state;
        var boxBody = $("#elecDrawBoxBody").parents(".box-body")[0];
        if (boxBody) {
            //フロアマップボックスの幅から描画エリアの幅と高さを取得
            const newWidth = boxBody.clientWidth - 20;
            const newHeight = newWidth * height / width;
            this.setState({ width: newWidth, height: newHeight });
        }
    }
    //#endregion
}

// Which props do we want to inject, given the global state?
// Note: use https://github.com/faassen/reselect for better performance.

/**
 * storeからstateを受け取り、propsに入れ込みます。
 */
const mapStateToProps = (state) => {
    return {
        egroupList: state.egroupList,
        selectedEgroup: state.selectedEgroup,
        rightBreaker: state.rightBreaker,
        leftBreaker: state.leftBreaker,
        valueLabelData: state.valueLabelData,
        modalState: state.modalState,
        isLoading: state.isLoading,
        networkError: state.networkError
    };
};

/**
 * 画面更新のアクションを設定します。
 * storeからActionを受け取り、propsに入れ込みます。
 */
const mapDispatchToProps = (dispatch) => {
    return {
        setEgroupList: (egroupList) => dispatch(setEgroupList(egroupList)),
        setSelectedEgroup: (egroup) => dispatch(setSelectedEgroup(egroup)),
        setRightBreaker: (data) => dispatch(setRightBreaker(data)),
        setLeftBreaker: (data) => dispatch(setLeftBreaker(data)),
        setValueLabelData: (values) => dispatch(setValueLabelData(values)),
        changeModalState: (data) => dispatch(changeModalState(data)),
        showErrorMessage: (data) => dispatch(showErrorMessage(data)),
        closeModal: () => dispatch(closeModal()),
        changeLoadState: () => dispatch(changeLoadState()),
        changeNetworkError: (isError) => dispatch(changeNetworkError(isError))
    };
};

// Wrap the component to inject dispatch and state into it
/**
 * mapStateToProps, mapDispatchToPropsをReduxと連携させる
 */
export default connect(mapStateToProps, mapDispatchToProps)(PowerConnectionPanel);

