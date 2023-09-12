/**
 * @license Copyright 2018 DENSO
 * 
 * メインヘッダーのアラーム個数コンポーネントコンテナ
 * 
 * 画面のコンテナとして。Reduxに依存したコードを記述します。
 * 画面のロジックはここに記述します。（適宜ファイル分割は行うこと）
 * 
 */
'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { setAlarmSummary } from 'AlarmSummary/actions.js';
import { DropdownButton, MenuItem } from 'react-bootstrap';
import Icon from 'Common/Widget/Icon';
import Notifications from 'Assets/Notifications/Notifications';
import { TOAST_DISPSTATUS_MAP, setToastDispStatus, getToastDispStatus, makeAlarmSummaryObject } from 'alarmToast';
import { STORAGE_KEY, removeSessionStorage } from 'webStorage';

/**
 * MainHeaderAlarmPanelのコンポーネント
 */
class MainHeaderAlarmPanel extends Component {

    /**
     * コンストラクタ
     */
    constructor(){
        super();
    }

    /**
     * 最初のレンダリング時にクライアントに一度だけ呼び出されます。
     * Componentがレンダリングされた直後に呼び出されるメソッドです。
     * ここでsetStateを行うと、renderがもう一度呼び出されるためあまり行わないほうがよいです。
     */
    componentDidMount() {
        window.addEventListener('storage', (e) => {
            if (e.key === STORAGE_KEY.alarmCount && e.newValue) {
                const alarmCount = JSON.parse(e.newValue);
                const nextAlarmSummary = makeAlarmSummaryObject(alarmCount);
                if (nextAlarmSummary != this.props.alarmSummary) {
                    this.props.setAlarmSummary(nextAlarmSummary);
                }
            }
            removeSessionStorage(e.key);
        });
    }

    /**
     * render
     */
    render() {
        const { alarmSummary } = this.props;
        const { systemErrorCountItem, errorCountItem, warnCountItem } = alarmSummary;
        const status = getToastDispStatus();
        return (
            <div>  
                <div className="main-header__alarm-toast-select" >
                    <DropdownButton className="btn-circle btn-toast-select"
                                    noCaret
                                    bsSize="xs"
                                    title={this.getStatusIcon(status)} 
                                    onSelect={(value) => this.updateToastDispStatus(value)} >
                        {this.makeToastDispStatuesItems(status.value)}
                    </DropdownButton>
                </div>
                <div className="main-header__alarm-inner" >
                    <Notifications isHeader={true}
                                systemErrorCountItem={systemErrorCountItem}
                                errorCountItem={errorCountItem} 
                                warnCountItem={warnCountItem}
                    />
                </div>
            </div>            
        );
    }

    /**
     * ステータスアイコンを取得する
     * @param {object} status アラームトーストステータス
     */
    getStatusIcon(status) {
        return status&&<Icon className={status.iconClass} />;
    }
    
    /**
     * トースト表示状態の選択肢を作成する
     * @param {number} アラームトーストステータスID
     */
    makeToastDispStatuesItems(statusId) {
        var items = [];
        for (const key in TOAST_DISPSTATUS_MAP) {
            if (TOAST_DISPSTATUS_MAP.hasOwnProperty(key)) {
                const item = TOAST_DISPSTATUS_MAP[key];
                items.push(
                    <MenuItem eventKey={item.value} active={item.value===statusId}>
                        <Icon className={item.iconClass + ' fa-fw'} /> {item.name}
                    </MenuItem>
                );
            }
        } 
        return items;
    }

    /**
     * トーストの表示状態を変更する
     * @param {string} value ステータス値
     */
    updateToastDispStatus(value) {
        setToastDispStatus(value);
        this.forceUpdate();         //強制的にrenderを走らせる
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
export default connect(mapStateToProps, mapDispatchToProps)(MainHeaderAlarmPanel);

 