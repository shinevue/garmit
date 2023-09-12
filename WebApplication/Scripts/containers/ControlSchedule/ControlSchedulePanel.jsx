/**
 * @license Copyright 2019 DENSO
 * 
 * ControlSchedule画面
 * 
 * 画面のコンテナとして。Reduxに依存したコードを記述します。
 * 画面のロジックはここに記述します。（適宜ファイル分割は行うこと）
 * 
 */
'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import { bindActionCreators } from 'redux';

import * as Actions from './actions';
import { confirmDelete, closeModal } from 'ModalState/actions';

import { FUNCTION_ID_MAP, LAVEL_TYPE, getAuthentication, readOnlyByLevel } from 'authentication';
import { setAuthentication } from 'Authentication/actions.js';

import { ButtonToolbar, Row, Col } from 'react-bootstrap';

import Content from 'Common/Layout/Content';
import Button from 'Common/Widget/Button';
import GarmitBox from 'Assets/GarmitBox';
import { EditButton, DeleteButton } from 'Assets/GarmitButton';
import MessageModal from 'Assets/Modal/MessageModal';
import WaitingMessage from 'Assets/Modal/WaitingMessage';

import { getMatchSchedule, DEFAULT_COLOR, DEFAULT_TEXT_COLOR, SCHEDULE_TIMING, getScheduleTimingName, getOperationWeeekString, getOperationDayString } from 'controlScheduleUtility';

const OK_OPERATION_BULK_DELETE = 'bulkDelete';
const OK_OPERATION_DELETE = 'delete';

/**
 * ControlSchedule画面のコンポーネント
 */
class ControlSchedulePanel extends Component {

    /**
     * コンストラクタ
     */
    constructor(){
        super();
        this.state = {
            deleteScheduleId: null
        };
    }

    /**
     * 最初のレンダリング時にクライアントに一度だけ呼び出されます。
     * Componentがレンダリングされた直後に呼び出されるメソッドです。
     * ここでsetStateを行うと、renderがもう一度呼び出されるためあまり行わないほうがよいです。
     */
    componentDidMount() {
        this.loadAuthentication();
        this.props.requestRefresh();
        this.initializeCalendar();
    }

    /**
     * コンポーネントが更新されたときに呼び出す
     * @param {*} prevProps 
     */
    componentDidUpdate(prevProps) {
        if (this.props.selectSchedules != prevProps.selectSchedules ||
            this.props.schedulePlans != prevProps.schedulePlans ) {
            $('#calendar').fullCalendar('removeEventSource', prevProps.schedulePlans);
            $('#calendar').fullCalendar('addEventSource', this.props.schedulePlans);
        } else if (this.props.authentication !== prevProps.authentication) {
            this.createAddIcon();
        }
      }
    
    /**
     * render
     */
    render() {
        const { selectSchedules, modalState, isLoading, waitingInfo } = this.props;
        const { isReadOnly, level, loadAuthentication  } = this.props.authentication;
        const isSelected = selectSchedules.length > 0 ? true : false;
        const loading = isLoading || !loadAuthentication;
        const readOnlyManager = readOnlyByLevel(isReadOnly, level, LAVEL_TYPE.manager);
        return (
            <Content>
                <Row>
                    <Col md={9} xs={12}>
                        <CalendarBox 
                            isSelected={isSelected} 
                            isLoading={loading} 
                            isReadOnly={readOnlyManager}
                            onClickAdd={this.handleClickAdd} 
                            onClickDelete={this.handleClickDelete} 
                        />
                    </Col>
                    <Col md={3} xs={12}>
                        {selectSchedules&&selectSchedules.map((schedule) => 
                            <DetailBox 
                                {...schedule} 
                                operationWeek={_.pick(schedule, ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'])}
                                isLoading={loading} 
                                isReadOnly={isReadOnly}
                                disabledDelete={readOnlyManager}
                                onClick={this.handleClick.bind(this, schedule)} 
                            />
                        )}
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
                    {modalState.message && modalState.message.split(/\r\n|\n/).map((str) => <div>{str}</div>)}
                </MessageModal>
                <WaitingMessage show={waitingInfo.isWaiting} type={waitingInfo.waitingType} />
            </Content>
        );
    }   

    //#region 権限取得    
    /**
     * 権限情報を読み込む
     */
    loadAuthentication() {
        getAuthentication(FUNCTION_ID_MAP.controlSchedule, (auth) => {            
            this.props.setAuthentication(auth);
        });
    }
    //#endregion

    //#region カレンダー初期設定

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
            eventAfterRender:this.handleAfterRenderEvent,
            eventRender: this.createRepeatIcon
        });
        this.createAddIcon;
    }

    /**
     * 繰り返しマークを作成する
     */
    createRepeatIcon = (event, element) => {
        this.props.schedulePlans.some((schedule) => {
            if (event.id === schedule.controlScheduleId && 
                schedule.scheduleTiming !== SCHEDULE_TIMING.noRepeat) {
                $(element[0]).find('.fc-content').addClass('repaet-schedule');      //繰り返しの設定がある場合はマークを付ける
                return true;
            }
        })
    }

    /**
     * 追加アイコンボタンを作成する
     */
    createAddIcon = () => {
        const { isReadOnly, level  } = this.props.authentication;
        const readOnly = readOnlyByLevel(isReadOnly, level, LAVEL_TYPE.manager);
        if (!readOnly) {
            //追加アイコンボタン
            $('td.fc-day-top.fc-future').append("<i class='fal fa-plus-circle'></i>");
            //追加ボタンクリックイベント設定
            $('td.fc-day-top i').on('click', this.handleClickAddIcon);
        }
    }

    //#endregion

    //#region イベントハンドラ

    //#region カレンダーボックスイベント

    /**
     * イベントデータ取得イベントハンドラ
     */
    handleEventTransForm = (e) => {
        //取得したイベントデータをカレンダーイベント形式に変換する
        return {
            id: e.controlScheduleId,
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
        const { selectSchedules } = this.props;
        if (selectSchedules.some((sch) => sch.controlScheduleId === calEvent.id)) {
            //選択されている場合
            this.props.removeSelect(calEvent.id);
        } else {
            //選択されていない場合、スケジュール一覧から一致するスケジュールを取得して選択中に設定する
            const targetEvent = getMatchSchedule(this.props.schedulePlans, calEvent.id);
            this.props.setSelect(targetEvent);
        }
    }

    /**
     * イベントオブジェクトカレンダーイベントハンドラ
     */
    handleAfterRenderEvent = (event, element) => {
        //選択状態イベントがある場合はカレンダーのイベントオブジェクトを選択状態にする
        this.props.selectSchedules.map((schedule) => {
            if (event.id === schedule.controlScheduleId) {
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
        this.transitionScreen(true, null, selectDate);
    }

    /**
     * スケジュール追加ボタンクリックイベントハンドラ
     */
    handleClickAdd = () => {
        //編集画面に遷移する
        this.transitionScreen(true, null, null);
    }

    /**
     * 削除ボタンクリックイベントハンドラ
     */
    handleClickDelete = () => {
        //まとめて削除ボタンクリックイベント
        this.props.confirmDelete({ targetName: '選択中スケジュール', okOperation: OK_OPERATION_BULK_DELETE });
    }
    //#endregion

    //#region スケジュール詳細ボックスイベント

    /**
     * スケジュール削除/編集ボタン押下イベント
     */
    handleClick = (schedule, type) => {
        switch (type) {
            case 'delete':
                this.setState({ deleteScheduleId: schedule.controlScheduleId }, () => {
                    this.props.confirmDelete({ targetName: 'スケジュール「'+schedule.name+'」', okOperation: OK_OPERATION_DELETE});
                });                
                break;
            case 'edit':
                //編集画面に遷移する
                this.transitionScreen(false, schedule);
                break;
            default: break;
        }
    }

    //#endregion

    //#region モーダルのイベント

    /**
     * 確認モーダルのOKボタン押下イベント
     */
    handleOK = () => {
        this.props.closeModal();
        switch (this.props.modalState.okOperation) {
            case OK_OPERATION_DELETE:
                this.props.requestDelete(this.state.deleteScheduleId);
                this.setState({ deleteScheduleId: null });    //削除対象クリア
                break;
            case OK_OPERATION_BULK_DELETE:
                this.props.requestDelete();
                break;
            default: break;
        }
        
    }

    /**
     * モーダルクローズイベント
     */
    handleCloseModal = () => {
        this.props.closeModal();
    }
    //#endregion

    //#endregion
    
    //#region その他関数
    /**
     * 画面遷移時の処理
     */
    transitionScreen(isRegister, schedule, startDate) {
        this.props.requestSetEditSchedule(schedule&&schedule.controlScheduleId, isRegister, startDate, (isTransition) => {
            isTransition && browserHistory.push({ pathname: '/ControlSchedule/Edit' });
        });
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
        authentication : state.authentication,
        schedulePlans : state.schedulePlans,
        selectSchedules : state.selectSchedules,
        modalState : state.modalState,
        isLoading : state.isLoading,
        waitingInfo : state.waitingInfo
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
        confirmDelete: (data) => dispatch(confirmDelete(data)),
        closeModal: () => dispatch(closeModal())
    };
};

// Wrap the component to inject dispatch and state into it
/**
 * mapStateToProps, mapDispatchToPropsをReduxと連携させる
 */
export default connect(mapStateToProps, mapDispatchToProps)(ControlSchedulePanel);

/**
 * スケジュールカレンダーボックス
 */
const CalendarBox = ({ isSelected, isReadOnly, isLoading, onClickAdd: handleClickAdd, onClickDelete: handleClickDelete }) => {
    return (
        <GarmitBox title="制御スケジュール" isLoading={isLoading}>
            <div>
                {!isReadOnly&&
                    <div className="pull-right" >                    
                        <Button
                            bsStyle="primary mr-05"
                            iconId="add"
                            onClick={handleClickAdd}
                        >
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
                }
                <div id='calendar'></div>
            </div>
        </GarmitBox>
    );
}

/**
 * 作業スケジュール詳細表示ボックス
 */
const DetailBox = ({ isLoading, isReadOnly, disabledDelete, startDate, endDate, name, backColor, memo, onClick:handleClick,
                     scheduleTiming, operationStartDate, operationEndDate, operationWeek, day }) => {
    var startTime = startDate;
    var endTime = endDate;
    if (scheduleTiming !== SCHEDULE_TIMING.noRepeat) {
        startTime = operationStartDate;
        endTime = operationEndDate;
    }
    return (
        <GarmitBox title={name} isLoading={isLoading}>
            <div>
                {!isReadOnly&&
                    <ButtonToolbar className="mb-1">
                        <EditButton onClick={handleClick.bind(this, "edit")} />
                        {!disabledDelete&&
                                <DeleteButton onClick={handleClick.bind(this, "delete")} />
                        }
                    </ButtonToolbar>
                }
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
                        <span>{moment(new Date(startTime)).format('HH:mm')}</span>
                        <span>{moment(new Date(endTime)).format('HH:mm')}</span>
                    </div>
                    <div className="flex-column-between  mlr-1">
                        <svg width="10px" height="100%">
                            <rect width="10px" height="100%" fill={(backColor || DEFAULT_COLOR)} />
                        </svg>
                    </div>
                    <div className="flex-column">
                        <div><label>スケジュール名：</label>{name}</div>
                        {scheduleTiming !== SCHEDULE_TIMING.noRepeat&&
                            <div><label>実行周期：</label>
                                <span>
                                    {getScheduleTimingName(scheduleTiming)}
                                    {scheduleTiming===SCHEDULE_TIMING.weekly&&(' (' + getOperationWeeekString(operationWeek) + ')')}
                                    {scheduleTiming===SCHEDULE_TIMING.monthly&&(' (' + getOperationDayString(day) + ')')}
                                </span>
                            </div>
                        }                                            
                        <div>{memo}</div>
                    </div>
                </div>
            </div>
        </GarmitBox>
    );
}

