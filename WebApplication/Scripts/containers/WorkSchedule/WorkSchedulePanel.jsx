/**
 * @license Copyright 2017 DENSO
 * 
 * スケジュール画面のReactコンポーネント
 * 
 */

'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import { bindActionCreators } from 'redux';

import * as Actions from './actions';
import { confirmDelete } from 'ModalState/actions';
import { FUNCTION_ID_MAP, LAVEL_TYPE, getAuthentication } from 'authentication';
import { setAuthentication } from 'Authentication/actions.js';

import { ButtonToolbar, Row, Col } from 'react-bootstrap';

import Content from 'Common/Layout/Content';
import Button from 'Common/Widget/Button';
import Icon from 'Common/Widget/Icon';
import GarmitBox from 'Assets/GarmitBox';
import { EditButton, DeleteButton } from 'Assets/GarmitButton';
import MessageModal from 'Assets/Modal/MessageModal';
import WaitingMessage from 'Assets/Modal/WaitingMessage';

import { getMatchSchedule, DEFAULT_COLOR, DEFAULT_TEXT_COLOR, SCHEDULE_DATETIME_FORMAT } from 'scheduleUtility';

class WorkSchedulePanel extends Component {

    constructor(){
        super();
        this.state = {
            deleteSchId:null    //削除対象スケジュールID一時保存用
        };
    }

    /**
     * 新たなPropsを受け取ったときに実行
     */
    componentWillReceiveProps(nextProps) {
        if (this.props.scheduleList !== nextProps.scheduleList) {
            $('#calendar').fullCalendar('removeEventSource', this.props.scheduleList);
            $('#calendar').fullCalendar('addEventSource', nextProps.scheduleList);
        }
    }

    /**
     * コンポーネントマウント後に1度だけ呼ばれる
     * (編集画面からの遷移時にも呼ばれる)
     */
    componentDidMount() {
        this.loadAuthentication();
        this.props.requestRefresh();
        this.initializeCalendar();
    }

    /**
     * 権限情報を読み込む
     */
    loadAuthentication() {
        getAuthentication(FUNCTION_ID_MAP.working, (auth) => {
            this.props.setAuthentication(auth);
        });
    }

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
            timeFormat: 'HH:mm',
            viewRender: this.createAddIcon,
            eventClick: this.handleClickEvent,
            eventDataTransform: this.handleEventTransForm,
            eventAfterRender:this.handleAfterRenderEvent
        });
        this.createAddIcon;
    }

    /**
     * 追加アイコンボタンを作成する
     */
    createAddIcon = () => {
        //追加アイコンボタン
        $('td.fc-day-top.fc-today, td.fc-day-top.fc-future').append("<i class='fal fa-plus-circle'></i>");
        //追加ボタンクリックイベント設定
        $('td.fc-day-top i').on('click', this.handleClickAddIcon);
    }

    //#region イベントハンドラ
    //#region カレンダーボックスイベント
    /**
     * イベントデータ取得イベントハンドラ
     */
    handleEventTransForm = (e) => {
        //取得したイベントデータをカレンダーイベント形式に変換する
        return {
            id: e.scheduleId,
            title: e.name,
            start: e.startDate,
            end: e.endDate,
            color: e.backColor ? e.backColor:DEFAULT_COLOR,
            textColor: e.textColor ? e.textColor : DEFAULT_TEXT_COLOR
        };
    }

    /**
     * イベントクリックイベントハンドラ
     */
    handleClickEvent = (calEvent, jsEvent, view) => {
        if ($(jsEvent.currentTarget.parentNode).hasClass('select-event')) {
            //選択されている場合
            $(jsEvent.currentTarget.parentNode).removeClass('select-event');
            this.props.removeSelect({ scheduleId: calEvent.id });
        }
        else {  //選択されていない場合
            $(jsEvent.currentTarget.parentNode).addClass('select-event');
            //スケジュール一覧から一致するスケジュールを取得して選択中に設定する
            const targetEvent = getMatchSchedule(this.props.scheduleList, calEvent.id);
            this.props.setSelect(targetEvent);
        }
    }

    /**
     * イベントオブジェクトカレンダーイベントハンドラ
     */
    handleAfterRenderEvent = (event, element) => {
        //選択状態イベントがある場合はカレンダーのイベントオブジェクトを選択状態にする
        this.props.selectSchedules.map((schedule) => {
            if (event.id === schedule.scheduleId) {
                $(element[0].parentNode).addClass('select-event');
            }
        })
    }

    /**
     * スケジュール追加アイコン（カレンダーセル内）クリックイベントハンドラ
     */
    handleClickAddIcon = (e) => {
        const selectDate = moment(e.currentTarget.parentNode.dataset.date);
        //セルを選択状態にする
        $('#calendar').fullCalendar('select', selectDate);
        //編集画面に遷移する
        this.transitionScreen('add', null, selectDate);
    }

    /**
     * スケジュール追加ボタンクリックイベントハンドラ
     */
    handleClickAdd = () => {
        //編集画面に遷移する
        this.transitionScreen('add', null, null);
    }

    /**
     * 削除ボタンクリックイベントハンドラ
     */
    handleClickDelete = () => {
        //まとめて削除ボタンクリックイベント
        this.props.confirmDelete({ targetName: "選択中スケジュール", okOperation: "bulkDelete" });
    }
    //#endregion

    //#region スケジュール詳細ボックスイベント
    /**
     * スケジュール削除/編集ボタン押下イベント
     */
    handleClick = (schedule, type) => {
        switch (type) {
            case "delete":
                this.setState({ deleteSchId: schedule.scheduleId });
                this.props.confirmDelete({ targetName: "スケジュール「"+schedule.name+"」", okOperation: "delete"});
                break;
            case "edit":
                //編集画面に遷移する
                this.transitionScreen('edit', schedule);
                break;
            default: break;
        }
    }

    /**
     * 確認モーダルのOKボタン押下イベント
     */
    handleOK = () => {
        this.props.closeModal();
        switch (this.props.modalState.okOperation) {
            case "delete":
                this.props.requestDelete(this.state.deleteSchId);
                this.setState({ deleteSchId: null });    //削除対象クリア
                break;
            case "bulkDelete":
                this.props.requestDelete();
                break;
            default: break;
        }
        
    }
    //#endregion

    /**
     * モーダルクローズイベント
     */
    handleCloseModal = () => {
        if (this.props.modalState.operation === "reload") {
            this.props.reload();
        }
        this.props.closeModal();
    }
    //#endregion

    /**
     * render
     */
    render() {
        const { selectSchedules, modalState, isLoading, location, waitingInfo } = this.props;
        const { isReadOnly, level, loadAuthentication  } = this.props.authentication;
        const isSelected = selectSchedules.length > 0 ? true : false;
        const loading = isLoading || !loadAuthentication;

        return (
            <Content>
                <Row>
                    <Col md={9} xs={12}>
                        <CalendarBox isSelected={isSelected} isLoading={loading} onClickAdd={this.handleClickAdd} onClickDelete={this.handleClickDelete} />
                    </Col>
                    <Col md={3} xs={12}>
                        {selectSchedules.map((schedule) => {
                            return <DetailBox {...schedule} isLoading={loading} onClick={this.handleClick.bind(this, schedule)} />
                        })}
                    </Col>
                </Row>
                <MessageModal
                    show={modalState.show}
                    title={modalState.title}
                    bsSize="small"
                    buttonStyle={modalState.buttonStyle}
                    onOK={this.handleOK}
                    onCancel={this.handleCloseModal}
                >
                    {modalState.message}
                </MessageModal>
                <WaitingMessage show={waitingInfo.isWaiting} type={waitingInfo.waitingType} />
            </Content>
        );
    }    

    //#region その他関数
    /**
     * 画面遷移時の処理
     */
    transitionScreen(mode, schedule, startDate) {
        this.props.setEdit({ mode:mode, value:schedule, startDate:startDate});
        browserHistory.push({ pathname: '/WorkSchedule/Edit', query: { mode: mode } });
    }
    //#endregion
}

// Which props do we want to inject, given the global state?
// Note: use https://github.com/faassen/reselect for better performance.
const mapStateToProps = (state) => {
    return {
        authentication  : state.authentication,
        scheduleList    : state.scheduleList  ,
        eventList       : state.eventList     ,
        selectSchedules : state.selectSchedules,
        modalState      : state.modalState    ,
        isLoading       : state.isLoading,
        waitingInfo: state.waitingInfo,
    };
};

//画面更新のアクションを設定します。
const mapDispatchToProps = (dispatch) => {
    return {
        ...bindActionCreators(Actions, dispatch),
        setAuthentication: (auth) => dispatch(setAuthentication(auth)),
        confirmDelete: (data) => dispatch(confirmDelete(data))
    };
};

// Wrap the component to inject dispatch and state into it
export default connect(mapStateToProps, mapDispatchToProps)(WorkSchedulePanel);

/**
 * 作業スケジュールカレンダーボックス
 */
const CalendarBox = ({ isSelected, isLoading, onClickAdd: handleClickAdd, onClickDelete: handleClickDelete }) => {
    return (
        <GarmitBox title="作業スケジュール" isLoading={isLoading}>
            <div>
                <div style={{ float: "right" }}>
                    <Button
                        bsStyle="primary mr-05"
                        onClick={handleClickAdd}
                    >
                        <Icon className="fal fa-plus mr-05" />
                        スケジュール追加
                        </Button>
                    <Button
                        bsStyle="danger"
                        iconId="delete"
                        disabled={!isSelected}
                        onClick={handleClickDelete}
                    >
                        まとめて削除
                        </Button>
                </div>
                <div id='calendar'></div>
            </div>
        </GarmitBox>
    );
}

/**
 * 作業スケジュール詳細表示ボックス
 */
const DetailBox = ({ isLoading, startDate, endDate, name, backColor, memo, unMonitored, onClick:handleClick }) => {
    const startTime = moment(new Date(startDate)).format('HH:mm');
    const endTime = moment(new Date(endDate)).format('HH:mm');
    const ALARM_MESSAGE = "アラーム未監視設定あり";

    return (
        <GarmitBox title={name} isLoading={isLoading}>
            <div>
                <ButtonToolbar className="mb-1">
                    <EditButton onClick={handleClick.bind(this, "edit")} />
                    <DeleteButton onClick={handleClick.bind(this, "delete")} />
                </ButtonToolbar>
                <div className="mb-1">
                    <div>
                        <label>開始：</label>
                        <span>{moment(new Date(startDate)).format('YYYY年MM月DD日 HH:mm')}</span>
                    </div>
                    <div>
                        <label>終了：</label>
                        <span>{moment(new Date(endDate)).format('YYYY年MM月DD日 HH:mm')}</span>
                    </div>
                </div>
                <div style={{ display: "flex" }}>
                    <div className="flex-column-between">
                        <span>{startTime}</span>
                        <span>{endTime}</span>
                    </div>
                    <div className="flex-column-between  mlr-1">
                        <svg width="10px" height="100%">
                            <rect width="10px" height="100%" fill={(backColor || DEFAULT_COLOR)} />
                        </svg>
                    </div>
                    <div className="flex-column">
                        <div><label>作業名：</label>{name}</div>
                        <div>{memo}</div>
                        {unMonitored && <div style={{ color: "red" }}>{ALARM_MESSAGE}</div>}
                    </div>
                </div>
            </div>
        </GarmitBox>
    );
}


 