/**
 * @license Copyright 2017 DENSO
 * 
 * ポイント一覧パネル Reactコンポーネント
 * <PointListPanel rackInfo={rackInfo} pointInfo={pointInfo} />
 *  
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Panel, ButtonToolbar } from 'react-bootstrap';

import PointListTable from 'FloorMap/PointListTable';

import Button from 'Common/Widget/Button';
import { RackLinkButton } from 'Assets/GarmitButton';

/**
 * ポイント一覧パネル
 * <PointListPanel name={rackName} isRack={true} pointInfo={pointInfo} disabledRackFunc={true} />
 * @param {object} title タイトル表示
 * @param {object} pointInfo 選択中ラックに紐づくポイント情報
 * @param {object} isRack ラック情報表示かどうか
 * @param {boolean} disabledRackFunc ラック画面（機能）が利用不可かどうか
 */
export default class PointListPanel extends Component {

    constructor() {
        super();
        this.state = {
        };
    }

    /**********************************
    * 
    * イベントハンドラ
    * 
    **********************************/

    /**
     * ポイント詳細表示ボタン押下イベントハンドラ
     */
    handleClickPointDetail(pointno) {
        if (this.props.onClickPointDetail) {
            this.props.onClickPointDetail(pointno)
        }
    }

    /**
     * ラック詳細表示ボタン押下イベントハンドラ
     */
    handleClickRackDetail() {
        if (this.props.onClickRackDetail) {
            this.props.onClickRackDetail()
        }
    }

    /**
     * ラック画面遷移リンクボタン押下イベントハンドラ
     */
    handleClickRackLink() {
        if (this.props.onClickRackLink) {
            this.props.onClickRackLink()
        }
    }

    /**
     * ポイントチェック状態変更イベントハンドラ
     */
    handleChangeCheck(value, pointNo, checkPointList) {
        let update = [];
        if (value) {
            update = Object.assign([], checkPointList);
            update.push(pointNo);
        }
        else {
            for (let i = 0; checkPointList.length > i; i++) {
                if (checkPointList[i] !== pointNo) {
                    update.push(checkPointList[i]);
                }
            }
        }
        if (this.props.changeIsSelect) {
            this.props.changeIsSelect(update);
        }
    }

    /**********************************
    * 
    * ゲッターメソッド
    * 
    **********************************/

    /**
     * パネルタイトルゲッターメソッド
     */
    getPanelTitle(title, isRack, alarmFlg, errorFlg, disabledRackFunc) {
        if (title) {
            return (
                <div className="flex-center-end">
                    <div>
                        {this.getAlarmIcon(alarmFlg, errorFlg)}
                        {title}
                    </div>
                    {isRack &&
                        <ButtonToolbar>
                            <Button
                                className="btn-garmit-rack-detail"
                                onClick={() => this.handleClickRackDetail()}
                            >
                                ラック詳細表示
                            </Button>
                            {!disabledRackFunc && 
                                <RackLinkButton onClick={() => this.handleClickRackLink()} />
                            }
                        </ButtonToolbar>
                    }
                </div>
            )
        }
        else {
            return null;
        }
    }

    /**
     * アラームアイコンを取得する
     * @param {bool} alarmFlg 注意フラグ
     * @param {bool} errorFlg 異常フラグ
     */
    getAlarmIcon(alarmFlg, errorFlg) {
        let iconClass = null;
        if (errorFlg) {
            iconClass = "icon-garmit-error"
        } else if (alarmFlg) {
            iconClass = "icon-garmit-warn"
        }
        return iconClass && <span className={iconClass} />
    }

    /**
     * render
     */
    render() {
        const { checkNoList, title, pointInfo, isRack, alarmFlg, errorFlg, disabledRackFunc } = this.props;

        return (
            <Panel header={this.getPanelTitle(title, isRack, alarmFlg, errorFlg, disabledRackFunc)}>
                <div className="scroll-y panell" style={{ maxHeight: '500px' }}>
                    <PointListTable
                        pointInfo={pointInfo}
                        dispOnly={false}
                        checkPointList={checkNoList}
                        onCheck={(value, pointNo) => this.handleChangeCheck(value, pointNo, checkNoList)}
                        onClickPointDetail={(pointNo) => this.handleClickPointDetail(pointNo)}
                    />
                </div>
            </Panel>
        );
    }
}

PointListPanel.propTypes = {
    checkNoList:PropTypes.array,
    title: PropTypes.string,
    pointInfo: PropTypes.object,
    isRack: PropTypes.bool,
    alarmFlg: PropTypes.bool,
    errorFlg: PropTypes.bool,
    disabledRackFunc: PropTypes.bool,
    onClickPointDetai: PropTypes.func,
    onClickRackDetai: PropTypes.func,
    onClickRackLink: PropTypes.func,
    changeIsSelect: PropTypes.func
};

