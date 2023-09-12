/**
 * @license Copyright 2017 DENSO
 * 
 * 詳細情報ボックス Reactコンポーネント
 *  
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Button from 'Common/Widget/Button';
import GarmitBox from 'Assets/GarmitBox';
import PointDetailModal from 'Assets/Modal/PointDetailModal.jsx';
import TrendGraphModal from 'Assets/Modal/TrendGraphModal';
import RackDetailModal from 'FloorMap/Modal/RackDetailModal.jsx';
import PointListPanel from 'FloorMap/PointListPanel.jsx';
import MessageModal from 'Assets/Modal/MessageModal';

import { LINK_TYPE, MESSAGEMODAL_BUTTON } from 'constant';

/**
 * 詳細情報ボックス
 */
export default class DetailInfoBox extends Component {

    constructor() {
        super();
        this.state = this.getInitialState();
    }

    /**
     * stateの初期値を取得する
     */
    getInitialState() {
        return {
            checkNoList: [],
            showRackDetailModal: false,
            showPointDetailModal: false,
            showTrendGraphModal: false,
            selectPointNo: null,   //ポイント詳細に表示するポイント番号
            isCheckPoint: false,    //ポイントがチェックされているかどうか,
            messageModalInfo: {
                show: false,
                title: '',
                buttonStyle: MESSAGEMODAL_BUTTON.comfirm,
                message: '',
                callback: null
            }
        };
    }

    /**
     * 新たなPropsを受け取ったときに実行
     */
    componentWillReceiveProps(nextProps) {
        const beforeLayoutId = _.get(this.props, "selectObjectInfo.selectObject.layoutId");
        const beforeObjectId = _.get(this.props, "selectObjectInfo.selectObject.objectId");
        const layoutId = _.get(nextProps, "selectObjectInfo.selectObject.layoutId");
        const objectId = _.get(nextProps, "selectObjectInfo.selectObject.objectId");
        if (!(beforeLayoutId === layoutId && beforeObjectId === objectId)) {
            this.setState(this.getInitialState());  //レイアウトIDとオブジェクトIDのどちらも一致しているとき以外
        }
    }

    //#region イベントハンドラ
    /**********************************
    * 
    * イベントハンドラ
    * 
    **********************************/

    /**
    * ポイント詳細クリックイベントハンドラ
    */
    handleClickPointDetail(pointno) {
        this.setState({
            showPointDetailModal: true,
            selectPointNo: pointno
        });
    }

    /**
     * トレンドボタン押下イベントハンドラ
     */
    handleClickTrend() {
        this.setState({ showTrendGraphModal: true });
    }

    /**
     * ポイント詳細モーダルクローズイベントハンドラ
     */
    handleClosePointDetailModal() {
        this.setState({ showPointDetailModal: false });
    }

    /**
     * トレンドグラフモーダルクローズイベント
     */
    handleCloseTrendGraphModal() {
        if (this.props.onCloseTrendGraphModal) {
            this.props.onCloseTrendGraphModal();
        }
    }

    /**
     * ラック詳細ボタンクリックイベントハンドラ
     */
    handleClickRackDetail() {
        if (this.props.onClickRackDetail) {
            this.props.onClickRackDetail();
        }
        this.setState({ showRackDetailModal: true });
    }

    /**
     * ラック詳細モーダルクローズイベントハンドラ
     */
    handleCloseRackDetailModal() {
        if (this.props.onCloseRackDetail) {
            this.props.onCloseRackDetail();
        }
        this.setState({ showRackDetailModal: false })
    }

    /**
     * ラック画面遷移リンクボタン押下イベントハンドラ
     * @param {number} locationId ロケーションID
     */
    handleClickRackLink(locationId) {
        this.changeMessageModalInfo(true, '確認', 'ラック画面に遷移しますか？', MESSAGEMODAL_BUTTON.confirm, () => this.onClickRackLink());
    }

    /**
     * メッセージモーダルのOKボタン押下イベントハンドラ
     */
    handleOK() {        
        const selectObject = _.get(this.props.selectObjectInfo, "selectObject");
        this.onClickRackLink(this.getLocationId(selectObject));
        this.closeMessageModal();
    }

    /**
     * メッセージも―ダリのキャンセルボタン押下イベントハンドラ
     */
    handleCloseModal() {
        this.closeMessageModal();
    }

    //#endregion

    //#region ゲッターメソッド
    /**********************************
    * 
    * ゲッターメソッド
    * 
    **********************************/

    /**
     * ポイント一覧パネル
     */
    getPointListPanel(checkNoList, selectObject, selectObjectLink, valueData, showRackDetailModal, disabledRackFunc) {
        return (
            <PointListPanel
                ref="pointListPanel"
                checkNoList={checkNoList}
                title={this.getPointListPanelTitle(selectObject, selectObjectLink)}
                pointInfo={valueData}
                isRack={_.get(selectObject, "location.isRack")}
                alarmFlg={selectObject.alarmFlg}
                errorFlg={selectObject.errorFlg}
                disabledRackFunc={disabledRackFunc}
                onClickPointDetail={(pointno) => this.handleClickPointDetail(pointno)}
                onClickRackDetail={() => this.handleClickRackDetail()}
                changeIsSelect={(checkedList) => this.setState({ checkNoList: checkedList })}
                onClickRackLink={() => this.handleClickRackLink()}
            />
        );
    }

    /**
    * ポイント詳細モーダル
    */
    getPointDetailModal(selectPoint, showPointDetailModal, isReadOnly, isConvert) {
        return (
            <PointDetailModal
                ref="pointModal"
                show={showPointDetailModal}
                pointInfo={selectPoint}
                isReadOnly={isReadOnly}
                isConvert={isConvert}
                onClose={() => this.handleClosePointDetailModal()}
            />
        );
    }

    /**
    * ラック詳細モーダル
    */
    getRackDetailModal(rackView, valueData, showRackDetailModal, isLoading) {
        return (
            <RackDetailModal
                show={showRackDetailModal}
                rackInfo={rackView}
                pointInfo={valueData}
                isLoading={isLoading}
                onClose={() => this.handleCloseRackDetailModal()}
            />
        );
    }

    /**
    * トレンドグラフモーダル
    */
    getTrendGraphModal(showTrendGraphModal) {
        return (
            <TrendGraphModal
                showModal={showTrendGraphModal}
                pointNos={this.state.checkNoList}
                onHide={() => this.setState({ showTrendGraphModal: false })}
            />
        );
    }

    /**
     * メッセージモーダル
     */
    getMessagaModal(modalInfo) {
        return (
            <MessageModal 
                show={modalInfo.show} 
                title={modalInfo.title} 
                bsSize="small"
                buttonStyle={modalInfo.buttonStyle}
                onOK={() => this.handleOK()}
                onCancel={() => this.handleCloseModal()}
            >
                {modalInfo.message && modalInfo.message.split(/\r\n|\n/).map((str) => <div>{str}</div>)}                    
            </MessageModal>
        );
    }
    //#endregion

    /**
     * render
     */
    render() {
        const { show, selectObjectInfo, rackView, isLoading, isReadOnly, isConvert, disabledRackFunc } = this.props;
        const { checkNoList, showRackDetailModal, showPointDetailModal, showTrendGraphModal, selectPointNo, isCheckPoint, messageModalInfo } = this.state;
        const selectObject = _.get(selectObjectInfo, "selectObject");
        const objectLinkInfo = _.get(selectObjectInfo, "objectLinkInfo");
        const valueData = _.get(selectObjectInfo, "objectLinkInfo.measuredValues");
        const selectPoint = valueData && selectPointNo ? this.searchMatchPoint(selectPointNo, valueData) : null;

        if (show) {
            return (
                <GarmitBox
                    isLoading={isLoading}
                    title={this.getDetailBoxTitle(selectObject, objectLinkInfo)}
                >
                    {this.getPointListPanel(checkNoList, selectObject, objectLinkInfo, valueData, showRackDetailModal, disabledRackFunc)}
                    <TrendButton
                        disabled={!checkNoList || checkNoList.length <= 0}
                        onClick={() => { this.handleClickTrend() }}
                    />
                    {this.getPointDetailModal(selectPoint, showPointDetailModal, isReadOnly, isConvert)}
                    {this.getRackDetailModal(rackView, valueData, showRackDetailModal, isLoading)}
                    {this.getTrendGraphModal(showTrendGraphModal)}
                    {this.getMessagaModal(messageModalInfo)}
                </GarmitBox>
            );
        }
        return null;
    }

    /**
    * ポイント一覧パネルのタイトルを取得する
    * @param {object} selectObject 選択中オブジェクト情報
    * @param {object} objectLinkInfo リンク先情報
    */
    getDetailBoxTitle(selectObject, objectLinkInfo) {
        switch (_.get(selectObject, "linkType")) {
            case LINK_TYPE.egroup:
                return "分電盤情報";
            case LINK_TYPE.point:
                return "ポイント情報";
            case LINK_TYPE.location:
                if (_.get(selectObject, "location.isRack")) {
                    return "ラック情報";
                }
                else {
                    return "ロケーション情報";
                }
            default: return "詳細情報";
        }
    }

    /**
    * ポイント一覧パネルのタイトルを取得する
    * @param {object} selectObject 選択中オブジェクト情報
    * @param {object} objectLinkInfo リンク先情報
    */
    getPointListPanelTitle(selectObject, objectLinkInfo) {
        const linkType = selectObject.linkType;
        if (linkType === LINK_TYPE.egroup) {    //オブジェクトが選択されていない場合
            return _.get(objectLinkInfo, "selectedEgroup.egroupName");
        }
        else if (linkType === LINK_TYPE.location) {  //ロケーションが選択されている
            return _.get(selectObject, "location.name");
        }
        return null;
    }

    /**
    * pointNoが一致するポイント検索する
    * @param {int} pointNo 選択されたポイントのpointNo
    * @param {array} valueDataList 計測値情報一覧
    */
    searchMatchPoint(pointNo, valueDataList) {
        return valueDataList.find((data) => {
            return data.point.pointNo === pointNo;
        })
    }

    /**
    * ロケーションIDを取得する
    * @param {object} selectObject 選択中オブジェクト情報
    */
    getLocationId(selectObject) {
        const linkType = selectObject.linkType;
        if (linkType === LINK_TYPE.location) {  //ロケーションが選択されている
            return _.get(selectObject, "location.locationId");
        }
        return null;
    }

    /**
     * ラック画面遷移リンクボタン押下イベント呼び出し
     * @param {number} locationId ロケーションID
     */
    onClickRackLink(locationId) {
        if (this.props.onClickRackLink) {
            this.props.onClickRackLink(locationId)
        }
    }
    
    /**
     * メッセージモーダルを閉じる
     */
    closeMessageModal() {
        this.changeMessageModalInfo(false, '', '', MESSAGEMODAL_BUTTON.confirm);
    }

    /**
     * メッセージモーダル情報のstateを変更する
     * @param {boolean} show モーダルを表示するかどうか
     * @param {string} title タイトル
     * @param {string} message メッセージ
     * @param {string} buttonStyle ボタンのスタイル
     * @param {function} callback コールバック関数
     */
    changeMessageModalInfo(show, title, message, buttonStyle, callback) {
        this.setState({
            messageModalInfo: {
                show,
                title,
                message,
                buttonStyle,
                callback: callback
            }
        })
    }
}

DetailInfoBox.propTypes = {
    show: PropTypes.bool,
    selectObjectInfo: PropTypes.shape({
        selectObject: PropTypes.object,
        objectLinkInfo: PropTypes.shape({
            measuredValues: PropTypes.object,
            selectedEgroup: PropTypes.object
        })
    }),
    rackView: PropTypes.object,
    isLoading: PropTypes.bool,
    isReadOnly: PropTypes.bool,
    isConvert: PropTypes.bool,
    disabledRackFunc: PropTypes.bool,
    onClickRackDetail: PropTypes.func,
    onCloseRackDetail: PropTypes.func
};

/**
* トレンドボタン
*/
const TrendButton = ({ disabled, onClick: handleClick }) => {
    return (
        <Button
            disabled={disabled}
            bsStyle="primary"
            className="btn-garmit-trend-graph pull-right"
            onClick={handleClick}
        >
            トレンド
        </Button>
    );
}
