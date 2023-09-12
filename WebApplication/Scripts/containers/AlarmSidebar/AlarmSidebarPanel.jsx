/**
 * @license Copyright 2018 DENSO
 * 
 * アラームサイドバー
 * 
 * 画面のコンテナとして。Reduxに依存したコードを記述します。
 * 画面のロジックはここに記述します。（適宜ファイル分割は行うこと）
 * 
 */
'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';

import { Button } from 'react-bootstrap';

import { setAlarmSummary } from 'AlarmSummary/actions.js';
import Notifications from 'Assets/Notifications/Notifications';
import AlarmToast from 'Assets/Notifications/AlarmToast';
import OtherAlarmCount from 'AlarmSidebar/OtherAlarmCount';

import { sendData, EnumHttpMethod } from 'http-request';
import { setSessionStorage, getSessionStorage, STORAGE_KEY } from 'webStorage';
import { TOAST_DISPSTATUS_MAP, getToastDispStatus, makeAlarmCountObject, transitPage } from 'alarmToast';
import { ALARM_CATEGORY, ALARM_UPDATE_INTERVAL } from 'constant';

/**
 * アラームサイドバーコンポーネント
 */
class AlarmSidebarPanel extends Component {

    /**
     * コンストラクタ
     */
    constructor(){
        super();
        this.toastRefs=[];
    }

    /**
     * 最初のレンダリング時にクライアントに一度だけ呼び出されます。
     * Componentがレンダリングされた直後に呼び出されるメソッドです。
     * ここでsetStateを行うと、renderがもう一度呼び出されるためあまり行わないほうがよいです。
     */
    componentDidMount() { 
        this.getAlarmSummary();
    }

    /**
     * Componentがレンダリング（更新）する直前に呼ばれる
     */
    componentWillUpdate() {
        this.toastRefs=[];
    }

    /**
     * Componentがレンダリング（更新）された直後に呼び出される
     */
    componentDidUpdate() {
        const { occuringAlarmToastItems } = this.props.alarmSummary;
        const alarmIdList = occuringAlarmToastItems.map((item) => item.alarmId);
        const prevAlarmIdList = this.getAlarmIdList();

        //トーストの表示（表示していないアラーム、且つ、最新のアラームのみを表示する）
        const prevMaxAlarmId = (prevAlarmIdList && prevAlarmIdList.length > 0) ? Math.max.apply(null, prevAlarmIdList) : 0;
        const dispAlarmIdList = alarmIdList.filter((alarmId) => prevAlarmIdList.every((no) => (no !== alarmId && alarmId > prevMaxAlarmId)));
        this.updateToast(dispAlarmIdList);

        //トーストを一旦折りたたむ
        if (dispAlarmIdList && dispAlarmIdList.length > 0) {
            garmitFrame.collapseNewToast();
        }
        
        //WebStorageに表示しているアラームリストを保存しておく
        this.setAlarmIdList(alarmIdList);

    }



    /**
     * アラームサマリー情報を取得する
     */
    getAlarmSummary () {
        sendData(EnumHttpMethod.get, '/api/IncidentLog/getAlarmSummary', null, (info, networkError) => {
            if (!networkError) {
                this.props.setAlarmSummary(info.alarmSummary);
                const { alarmSummary } = info;
                setSessionStorage(STORAGE_KEY.alarmCount, alarmSummary && JSON.stringify(makeAlarmCountObject(alarmSummary)), true);
            }
            setTimeout(() => this.getAlarmSummary(), ALARM_UPDATE_INTERVAL);
        });
    }

    /**
     * WebStorageからアラームNoリストを取得する
     */
    getAlarmIdList(){
        const alarmIdString = getSessionStorage(STORAGE_KEY.dispAlarmId, false);
        var alarmIdList = [];
        if (alarmIdString) {
            alarmIdList = JSON.parse(alarmIdString);
        }
        return alarmIdList;
    }

    /**
     * WebStorageに表示したアラームNoリストを保存する
     * @param {array} alarmIdList 保存するアラームNoリスト
     */
    setAlarmIdList(alarmIdList) {
        var alarmIdString = '';
        if (alarmIdList) {
            alarmIdString = JSON.stringify(alarmIdList);
        }
        setSessionStorage(STORAGE_KEY.dispAlarmId, alarmIdString);
    }

    /**
     * トーストをアップデートする
     * @param {array} alarmIdList トースト表示するアラーム番号リスト
     */
    updateToast(alarmIdList) {
        const status = getToastDispStatus();
        if (status.value === TOAST_DISPSTATUS_MAP.none.value) {
            return;     //トーストは非表示
        }

        var count = alarmIdList.length;
        var soundUrl = '';
        alarmIdList.forEach((alarmId, index) => {
            this.toastRefs.forEach((item) => {
                const { alarmToastItem } = item.props;
                if (status.value === TOAST_DISPSTATUS_MAP.error.value &&
                    alarmToastItem.alarmCategory.categoryType.categoryNo === ALARM_CATEGORY.alarm) {
                    return;     //異常のみの場合は注意エラーは表示しない
                }

                if (item.props.alarmId === alarmId) {
                    let html = item.sectionRef.outerHTML;
                    garmitFrame.toast(html);        //トースト表示
                    
                    let itemSoundUrl = item.props.alarmToastItem.soundUrl;
                    if ((count === index + 1) && itemSoundUrl) {
                        soundUrl = itemSoundUrl;
                    }
                }                
            })
        })

        if (alarmIdList.length > 0) {
            this.addClickEventToastButtons();
        }

        if (soundUrl) {
            this.playSound(soundUrl)
        }
    }

    /**
     * トーストのボタンにクリックイベントを追加する
     */
    addClickEventToastButtons() {
        const { occuringAlarmToastItems } = this.props.alarmSummary;
        var toastElements = $('.jq-toast-single')
        if (toastElements) {
            let buttons = toastElements.find('button');
            if (buttons && buttons.length > 0) {
                buttons.each((index, value) => {
                    let button = $(value);
                    let type = button.data().operationtype;
                    let url = button.data().url;
                    let alarmId = button.data().alarmid;
                    let alarmToastItem = occuringAlarmToastItems.find((item) => item.alarmId === alarmId);
                    let hoverButton = alarmToastItem && alarmToastItem.hoverButtons.find((btn) => btn.operationType === type);
                    if (hoverButton) {
                        button.on('click', () => transitPage(url, hoverButton.parameterKeyPairs));
                    }
                });
            }
        }
    }

    /**
     * 音を鳴らす
     * @param {string} soundUrl 
     */
    playSound(soundUrl) {
        var audio = new Audio(soundUrl);
        audio.play();
    }
    
    /**
     * render
     */
    render() {
        const { alarmSummary } = this.props;
        const { systemErrorCountItem, errorCountItem, warnCountItem, occuringAlarmToastItems, isAllowIncidentLog } = alarmSummary;
        const sumCount = systemErrorCountItem.alarmCount + errorCountItem.alarmCount + warnCountItem.alarmCount;
        const dispCount = occuringAlarmToastItems.length;

        return (
            <div className="alarm-sidebar__inner">
                <div className="alarm-sidebar__header">
                    <Notifications isHeader={false}
                                   systemErrorCountItem={alarmSummary.systemErrorCountItem}
                                   errorCountItem={alarmSummary.errorCountItem} 
                                   warnCountItem={alarmSummary.warnCountItem}
                    />
                </div>
                <div className="alarm-sidebar__state">
                    {occuringAlarmToastItems&&occuringAlarmToastItems.length>0&&
                        <div className="toast-list">
                            {occuringAlarmToastItems.map((item, index) =>
                                <AlarmToast key={item.alarmId} 
                                            ref={(toast) => this.toastRefs[index] = toast}
                                            alarmId={item.alarmId} 
                                            alarmToastItem={item} 
                                />
                            )}
                        </div>
                    }
                </div>
                <div className="alarm-sidebar__log">
                    <div className="alarm-sidebar__log--inner">
                        {isAllowIncidentLog&&
                            <div className="float-button">
                                <Button href="/IncidentLog" bsStyle="sm" className="btn-garmit-incident-log" >インシデントログ</Button>
                            </div>
                        }
                        <OtherAlarmCount count={sumCount} dispCount={dispCount} />
                    </div>
                </div>
            </div>
        );
    }
}

// Which props do we want to inject, given the global state?
// Note: use https://github.com/faassen/reselect for better performance.

/**
 * storeからstateを受け取り、propsに入れ込みます。
 */
const mapStateToProps = (state) => {
    return {
        alarmSummary: state.alarmSummary
    };
};

/**
 * 画面更新のアクションを設定します。
 * storeからActionを受け取り、propsに入れ込みます。
 */
const mapDispatchToProps = (dispatch) => {
    return {
        setAlarmSummary:(alarmSummary) => dispatch(setAlarmSummary(alarmSummary))
    };
};

// Wrap the component to inject dispatch and state into it
/**
 * mapStateToProps, mapDispatchToPropsをReduxと連携させる
 */
export default connect(mapStateToProps, mapDispatchToProps)(AlarmSidebarPanel);

 