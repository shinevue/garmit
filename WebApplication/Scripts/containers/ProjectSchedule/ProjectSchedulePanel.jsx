/**
 * @license Copyright 2020 DENSO
 * 
 * 案件スケジュール画面
 * 
 * 画面のコンテナとして。Reduxに依存したコードを記述します。
 * 画面のロジックはここに記述します。（適宜ファイル分割は行うこと）
 * 
 */
'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as Actions from './actions';
import { FUNCTION_ID_MAP, getAuthentication } from 'authentication';
import { setAuthentication } from 'Authentication/actions.js';
import { closeModal } from 'ModalState/actions.js';

import { ButtonToolbar, Row, Col, ControlLabel, FormGroup, Checkbox } from 'react-bootstrap';

import Content from 'Common/Layout/Content';
import Button from 'Common/Widget/Button';
import GarmitBox from 'Assets/GarmitBox';
import MessageModal from 'Assets/Modal/MessageModal';

import { setSessionStorage, STORAGE_KEY } from 'webStorage';
import { getMatchSchedule, getScheduleTitle, getScheduleColor, getScheduleTypeName, getProjectTypeName, SCHEDULE_TYPE, makeCalendarEvent } from 'projectScheduleUtility';

/**
 * 案件スケジュール画面のコンポーネント
 */
class ProjectSchedulePanel extends Component {

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
        this.loadAuthentication();
        this.initializeCalendar();
    }

    /**
     * コンポーネントが更新されたときに呼び出す
     * @param {*} prevProps 
     */
    componentDidUpdate(prevProps, prevState) {
        if (this.props.selectSchedules !== prevProps.selectSchedules ||
            this.props.dispScheduleList != prevProps.dispScheduleList ) {
            $('#calendar').fullCalendar('removeEventSource', prevProps.dispScheduleList);
            $('#calendar').fullCalendar('addEventSource', this.props.dispScheduleList);
        }
        
    }

    /**
     * render
     */
    render() {
        const { selectSchedules, dispSetting, modalState, isLoading } = this.props;
        const { loadAuthentication  } = this.props.authentication;
        const isSelected = selectSchedules.length > 0 ? true : false;
        const loading = isLoading || !loadAuthentication;
        return (
            <Content>
                <Row>
                    <Col md={9} xs={12}>
                        <CalendarBox 
                            isLoading={loading}
                            isSelected={isSelected}
                            completeDate={dispSetting.completeDate}
                            openDate={dispSetting.openDate}
                            closeDate={dispSetting.closeDate}
                            opserveDate={dispSetting.opserveDate}
                            onChange={this.handleDispSettingChange}
                            onClear={this.handleClearSelectSchedules}
                        />
                    </Col>
                    <Col md={3} xs={12}>
                        {selectSchedules.map((schedule) => {
                            return <DetailBox 
                                        {...schedule} 
                                        isLoading={loading} 
                                        onClick={this.handleClick.bind(this, schedule)} 
                                    />
                        })}
                    </Col>
                </Row>
                <MessageModal
                    show={modalState.show}
                    title={modalState.title}
                    bsSize="small"
                    buttonStyle={modalState.buttonStyle}
                    onOK={() => this.handleModalOK()}
                    onCancel={() => this.handleModalCancel()}
                >
                    {modalState.message}
                </MessageModal>
            </Content>
        );
    }    
    
    //#region 権限取得   

    /**
     * 権限情報を読み込む
     */
    loadAuthentication() {
        getAuthentication(FUNCTION_ID_MAP.projectSchedule, (auth) => {            
            this.props.setAuthentication(auth);
        });
    }

    //#endregion

    //#region カレンダーボックスイベント

    /**
    * カレンダー初期設定
    */
    initializeCalendar() {
        //カレンダー初期設定
        $('#calendar').fullCalendar({
            locale: 'ja',
            theme: 'bootstrap3',
            header: {
                left: 'today',
                center: 'prevYear,prev title next,nextYear',
                right: ''
            },
            views: {
                month: {
                    titleFormat: 'YYYY年MM月'
                }
            },
            buttonText: {
                today: '今日'
            },
            displayEventTime: false,
            viewRender: this.handleViewRender,
            eventClick: this.handleClickEvent,
            eventDataTransform: this.handleEventTransForm,
            eventAfterRender: this.handleAfterRenderEvent
        });
    }

    /**
     * イベントデータ取得イベントハンドラ
     */
    handleEventTransForm = (e) => {
        //取得したイベントデータをカレンダーイベント形式に変換する
        return makeCalendarEvent(e);
    }

    /**
     * イベントクリックイベントハンドラ
     */
    handleClickEvent = (calEvent, jsEvent, view) => {
        const { selectSchedules } = this.props;
        const selectSchedule = selectSchedules.find((schedule) => schedule.projectId === calEvent.projectId && schedule.scheduleType === calEvent.scheduleType)
        if (selectSchedule) {
            this.props.removeSelect(selectSchedule);
        } else {
            //選択されていない場合、スケジュール一覧から一致するスケジュールを取得して選択中に設定する
            const targetEvent = getMatchSchedule(this.props.scheduleList, calEvent.projectId, calEvent.scheduleType);
            this.props.setSelect(targetEvent);
        }
    }

    /**
     * イベントオブジェクトカレンダーイベントハンドラ
     */
    handleAfterRenderEvent = (event, element) => {
        //選択状態イベントがある場合はカレンダーのイベントオブジェクトを選択状態にする
        this.props.selectSchedules.map((schedule) => {
            if (event.projectId === schedule.projectId && event.scheduleType === schedule.scheduleType) {
                $(element[0].parentNode).addClass('select-event');
            }
        })
    }
    
    /**
     * ビューのレンダリングイベントハンドラ
     */
    handleViewRender = (view, element) => {
        this.props.requestRefresh(view.start.startOf('day'), view.end.add(-1, 'days').endOf('day'));
    }

    //#endregion

    //#region イベントハンドラ
    
    /**
     * 表示設定チェック変更
     * @param {boolean} checked チェック状態
     * @param {string} key 表示設定のキー
     */
    handleDispSettingChange = (checked, key) => {
        this.props.requestChangeDispSetting(checked, key);
    }

    /**
     * まとめて選択解除ボタンクリック
     */
    handleClearSelectSchedules = () => {
        this.props.clearSelect();
    }

    
    /**
     * 案件画面表示ボタンクリックイベント
     */
    handleClick = (schedule) => {
        this.dispProjectPage(schedule.projectId);
    }
    
    /**
     * OKボタンクリックイベントハンドラ
     */
    handleModalOK() {
        this.props.closeModal();
    }

    /**
     * キャンセルボタンクリックのイベントハンドラ
     */
    handleModalCancel() {
        this.props.closeModal();
    }


    //#endregion

    //#region その他

    /**
     * 案件画面に遷移する
     * @param {number} projectId 案件ID
     */
    dispProjectPage(projectId){
        //sessionStorageに案件IDと遷移前の機能IDを格納を格納
        setSessionStorage(STORAGE_KEY.projectId, projectId);
        setSessionStorage(STORAGE_KEY.functionId, FUNCTION_ID_MAP.projectSchedule);
        window.location.href = '/Project';         //画面遷移
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
        authentication: state.authentication,
        scheduleList: state.scheduleList,
        dispScheduleList: state.dispScheduleList,
        selectSchedules: state.selectSchedules,
        dispSetting: state.dispSetting,
        modalState: state.modalState,
        isLoading: state.isLoading
    };
};

/**
 * 画面更新のアクションを設定します。
 * storeからActionを受け取り、propsに入れ込みます。
 */
const mapDispatchToProps = (dispatch) => {
    return {
        ...bindActionCreators(Actions, dispatch),
        setAuthentication: (auth) => dispatch(setAuthentication(auth)),
        closeModal: () => dispatch(closeModal())
    };
};

// Wrap the component to inject dispatch and state into it
/**
 * mapStateToProps, mapDispatchToPropsをReduxと連携させる
 */
export default connect(mapStateToProps, mapDispatchToProps)(ProjectSchedulePanel);

 
/**
 * スケジュールカレンダーボックス
 */
const CalendarBox = ({ isLoading, isSelected, completeDate, openDate, closeDate, opserveDate, onChange: handleChange, onClear: handleClear }) => {
    return (
        <GarmitBox title="回線工事スケジュール" isLoading={isLoading}>
            <div className="flex-center-between">
                <div>
                    <ControlLabel>表示設定</ControlLabel>
                    <FormGroup className="flex-center-left">
                        <Checkbox inline checked={completeDate} onChange={(e) => handleChange(e.target.checked, SCHEDULE_TYPE.completeDate)}>工事完了希望日</Checkbox>
                        <Checkbox inline checked={openDate} onChange={(e) => handleChange(e.target.checked, SCHEDULE_TYPE.openDate)}>開通年月日</Checkbox>
                        <Checkbox inline checked={closeDate} onChange={(e) => handleChange(e.target.checked, SCHEDULE_TYPE.closeDate)}>廃止年月日</Checkbox>
                        <Checkbox inline checked={opserveDate} onChange={(e) => handleChange(e.target.checked, SCHEDULE_TYPE.opserveDate)}>工事立会日</Checkbox>
                    </FormGroup>
                </div>
                <div>                    
                    <Button
                        bsStyle="lightgray"
                        iconId="eraser"
                        disabled={!isSelected}
                        onClick={handleClear}
                    >
                        まとめて選択解除
                    </Button>
                </div>
            </div>
            <div id='calendar'></div>
        </GarmitBox>
    );
}

/**
 * スケジュール詳細表示ボックス
 */
const DetailBox = ({ isLoading, projectType, projectNo, userName, scheduleType, scheduleDate, projectId, onClick:handleClick }) => {
    return (
        <GarmitBox title={getScheduleTitle(projectNo, projectType)} isLoading={isLoading}>
            <div>
                <ButtonToolbar className="mb-1">
                    <Button bsStyle="primary" onClick={handleClick}>案件画面表示</Button>
                </ButtonToolbar>
                <div className="mb-1">
                    <div>
                        <label>{getScheduleTypeName(scheduleType) + '：'}</label>
                        <span>{moment(new Date(scheduleDate)).format('YYYY年MM月DD日')}</span>
                    </div>
                </div>
                <div style={{ display: "flex" }}>
                    <div className="flex-column-between  mlr-1">
                        <svg width="10px" height="100%">
                            <rect width="10px" height="100%" fill={getScheduleColor(scheduleType)} />
                        </svg>
                    </div>
                    <div className="flex-column">
                        <div><label>工事種別：</label>{getProjectTypeName(projectType)}</div>
                        <div><label>工事番号：</label>{projectNo}</div>
                        <div><label>ユーザー名：</label>{userName}</div>
                    </div>
                </div>
            </div>
        </GarmitBox>
    );
}

