/**
 * @license Copyright 2019 DENSO
 * 
 * ControlScheduleEdit画面
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

import { Radio, FormGroup,　ControlLabel, Checkbox, FormControl, HelpBlock, ButtonToolbar, Modal } from 'react-bootstrap';

import * as Actions from './actions';
import { confirmSave, confirmDelete, closeModal, showErrorMessage } from 'ModalState/actions';

import Content from 'Common/Layout/Content';
import InputForm from 'Common/Form/InputForm';
import TextForm from 'Common/Form/TextForm';
import TextareaForm from 'Common/Form/TextareaForm';
import DateTimeSpanForm from 'Common/Form/DateTimeSpanForm';
import ColorForm from 'Common/Form/ColorForm';
import EnterpriseForm from 'Assets/Condition/EnterpriseForm';
import CheckboxSwitch from 'Common/Widget/CheckboxSwitch';

import GarmitBox from 'Assets/GarmitBox';
import MessageModal from 'Assets/Modal/MessageModal';
import WaitingMessage from 'Assets/Modal/WaitingMessage';
import { SaveButton, CancelButton } from 'Assets/GarmitButton';
import ControlOperationsEditForm from 'Assets/Control/ControlOperationsEditForm';

import { LAVEL_TYPE, readOnlyByLevel } from 'authentication';
import { SCHEDULE_DATETIME_FORMAT, SCHEDULE_TIME_FORMAT, MAXCOUNT_COMMANDS, SCHEDULE_TIMING, SCHEDULE_LASTDAY_VALUE } from 'controlScheduleUtility';
import { MAX_LENGTH_SCHDULE_NAME, MAX_LENGTH_SCHDULE_MEMO, SCHEDULE_LASTDAY_NAME } from 'controlScheduleUtility';
import { isDate } from 'datetimeUtility';

const INITIAL_SCHEDULE_TIMING = SCHEDULE_TIMING.daily;

/**
 * ControlScheduleEdit画面のコンポーネント
 */
class ControlScheduleEditPanel extends Component {

    /**
     * コンストラクタ
     */
    constructor(){
        super();
        this.state = {
            dateTimeInfo: {
                displayDateTime: null,      //画面表示時刻（日時指定判定に使用する）
                disableStartDate: true,     //開始日時フォームが無効状態
                disableEndDate: true        //終了日時フォームが無効状態
            }
        };
    }

    /**
     * 新たなPropsを受け取ったときに実行
     */
    componentWillReceiveProps(nextProps) {
        const displayTime = moment().second(0).millisecond(0);
        const nextStartDate = _.get(nextProps, "editing.scheduleStartDate");
        const nextEndDate = _.get(nextProps, "editing.scheduleEndDate");
        if (!this.state.dateTimeInfo.displayDateTime && (nextStartDate || nextEndDate)) {   //初回のみdisable設定（編集時はエラーメッセージ表示とする）
            const disableStartDate = nextStartDate && moment(nextStartDate, SCHEDULE_DATETIME_FORMAT) <= displayTime;
            const disableEndDate = nextEndDate && moment(nextEndDate, SCHEDULE_DATETIME_FORMAT) <= displayTime;
            this.setState({
                dateTimeInfo: {
                    displayDateTime: displayTime,
                    disableStartDate: disableStartDate,
                    disableEndDate: disableEndDate,
                }
            });
        }
    }

    /**
     * render
     */
    render() {
        const { editing, validate, invalid, userInfo, locations, authentication, controlCommands } = this.props;
        const { modalState, isLoading, waitingInfo } = this.props;
        const { dateTimeInfo } = this.state;   
        return (
            <Content>
                <SaveCancelButton 
                    canSave={!this.invalid(invalid)&&!(dateTimeInfo.disableStartDate&&dateTimeInfo.disableEndDate)} 
                    disabled={isLoading} 
                    onClickSave={this.handleClickSave} 
                    onClickCancel={this.handleClickCancel} 
                />
                <GarmitBox isLoading={isLoading} title="制御スケジュール">
                    <BoxBody
                        editing={editing}
                        validate={validate}
                        userInfo={userInfo}
                        dateTimeInfo={dateTimeInfo}
                        locations={locations}
                        controlCommands={controlCommands}
                        isLoading={isLoading}
                        authentication={authentication}
                        onChange={this.handleChange}
                        onChangeCommands={this.handleChamgeCommands}
                    />
                </GarmitBox>
                <MessageModal
                    show={modalState.show}
                    title={modalState.title}
                    bsSize="small"
                    buttonStyle={modalState.buttonStyle}
                    children={modalState.message && modalState.message.split(/\r\n|\n/).map((str) => <div>{str}</div>)}
                    onOK={this.handleOK}
                    onCancel={this.handleCloseModal}
                />
                <WaitingMessage show={waitingInfo.isWaiting} type={waitingInfo.waitingType} />
            </Content>
        );
    }   
    
    //#region イベントハンドラ

    /**
     * キャンセルボタン押下イベント
     */
    handleClickCancel = () => {
        //編集画面に遷移する
        browserHistory.push({ pathname: '/ControlSchedule' });
        //編集情報クリア
        this.props.clearEdit();
    }

    /**
     * 保存ボタン押下イベント
     */
    handleClickSave = () => {        
        const { editing } = this.props;
        const { disableStartDate } = this.state.dateTimeInfo;
        const nextday = moment().hours(0).minutes(0).second(0).millisecond(0).add(1, 'd');    //現在日付＋1日とする
        if (!disableStartDate) {
            if (moment(editing.scheduleStartDate) < nextday) {
                this.props.showErrorMessage({ message: "開始日時は翌日以降の日時を指定してください。" });
                return;
            }
        }
        this.props.confirmSave({targetName:"編集中スケジュール", okOperation:"save"});
    }

    /**
     * モーダルクローズイベント
     */
    handleCloseModal = () => {
        if (this.props.modalState.okOperation === "transition") {
            //保存に成功した場合、画面移動
            browserHistory.push({ pathname: '/ControlSchedule'});
        }
        this.props.closeModal();
    }

    /**
     * 確認モーダルOK押下イベント
     */
    handleOK = () => {
        this.props.closeModal();
        if (this.props.modalState.okOperation === "save") {
            this.saveSchedules();
        }
    }

    /**
     * 編集イベント
     */
    handleChange = (key, e) => {
        if (key === 'enterprises') {
            const enterpriseIds = e && e.map((enterprise) => enterprise.enterpriseId);
            this.props.requestChangeRelatedControlCommands(enterpriseIds);
        }
        this.props.requestChangeSchedule(key, e);
    }

    /**
     * 制御コマンド変更イベント
     */
    handleChamgeCommands = (commands, isError) => {
        this.props.changeScheduleCommands(commands, isError)
    }
    
    //#endregion

    /**
    * スケジュール保存
    */
   saveSchedules() {
    const { editing } = this.props;
        this.props.requestSave(_.cloneDeep(editing));
    }

    /**
     * 保存ボタンが無効化どうか
     * @param {object} invalid 無効化どうか 
     */
    invalid(invalid) {
        return invalid.schedule || invalid.commands ;
    }
}

// Which props do we want to inject, given the global state?
// Note: use https://github.com/faassen/reselect for better performance.

/**
 * storeからstateを受け取り、propsに入れ込みます。
 */
const mapStateToProps = (state) => {
    return {
        editing: state.editing,
        validate: state.validate,
        invalid: state.invalid,
        userInfo: state.userInfo,
        locations: state.locations,
        controlCommands: state.controlCommands,
        modalState: state.modalState,
        isLoading: state.isLoading,
        waitingInfo: state.waitingInfo,
        authentication: state.authentication
    };
};

/**
 * 画面更新のアクションを設定します。
 * storeからActionを受け取り、propsに入れ込みます。
 */
const mapDispatchToProps = (dispatch) => {
    return {
        ...bindActionCreators(Actions, dispatch),
        confirmSave: (data) => dispatch(confirmSave(data)),
        confirmDelete: (data) => dispatch(confirmDelete(data)),
        closeModal: () => dispatch(closeModal()),
        showErrorMessage: (data) => dispatch(showErrorMessage(data))
    };
};

// Wrap the component to inject dispatch and state into it
/**
 * mapStateToProps, mapDispatchToPropsをReduxと連携させる
 */
export default connect(mapStateToProps, mapDispatchToProps)(ControlScheduleEditPanel);

/**
* 保存キャンセルボタン
*/
const SaveCancelButton = ({canSave, disabled, onClickSave:handleClickSave, onClickCancel:handleClickCancel }) => {
    return (
        <div className="flex-center-right mb-05">
            <SaveButton
                disabled={!canSave || disabled}
                className="mr-05"
                onClick={handleClickSave}
            />
            <CancelButton
                disabled={disabled}
                onClick={handleClickCancel}
            />
        </div>
    );
}

/**
 * ボックスボディ
 */
const BoxBody = (props) => {
    const { editing, validate, userInfo, authentication, isLoading, dateTimeInfo } = props;
    const { onChange: handleChange, onChangeCommands: handleChangeCommands } = props;
    const { locations, controlCommands } = props;
    const colorProps = _.pick(editing, ['backColor', 'textColor']);
    const operationTime = _.pick(editing, ['operationStartDate', 'operationEndDate']);
    const operationWeek = _.pick(editing, ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']);
    const isReadOnly = dateTimeInfo.disableStartDate&&dateTimeInfo.disableEndDate;
    const isReadOnlyByAuth = isReadOnly || readOnlyByLevel(authentication.isReadOnly, authentication.level, LAVEL_TYPE.manager);
    return (
        <InputForm>
            <DateTimeRow
                startDate={editing&&editing.scheduleStartDate}
                endDate={editing&&editing.scheduleEndDate}
                startValidation={validate.startDateTime}
                endValidation={validate.endDateTime}
                dateTimeInfo={dateTimeInfo}
                isLoading={isLoading}
                onChangeDateTime={handleChange}
            />
            <NameEnterpriseRow
                name={editing&&editing.name}
                nameValidation={validate.name}
                enterpriseList={userInfo.enterprises}
                selectedEnterprises={editing?editing.enterprises:[]}
                mainEnterprise={userInfo.mainEnterprise}
                enterpriseValidation={validate.enterprises}
                isLoading={isLoading}
                isReadOnly={isReadOnlyByAuth}
                isReadOnlyEnterprise={isReadOnlyByAuth || dateTimeInfo.disableStartDate}
                onChange={handleChange}
            />
            <ColorSelectRow
                {...colorProps}
                isLoading={isLoading}
                isReadOnly={isReadOnlyByAuth}
                onChange={handleChange}
            />
            <ControlPatternRow 
                isLoading={isLoading}
                isReadOnly={isReadOnlyByAuth}
                maxCount={MAXCOUNT_COMMANDS}
                commands={editing&&editing.controlCommands}
                locations={locations}
                controls={controlCommands}
                onChange={handleChangeCommands}
            />
            <RepeatCycleRow 
                isLoading={isLoading}
                isReadOnly={isReadOnlyByAuth}
                scheduleTiming={editing&&editing.scheduleTiming}
                operationTime={operationTime}
                weekPattern={operationWeek}
                day={editing&&editing.day}
                validate={validate.operation}
                onChange={handleChange}
            />
            <MemoEditRow
                memo={editing&&editing.memo}
                validation={validate.memo}
                isLoading={isLoading}
                isReadOnly={isReadOnly}
                onChange={handleChange}
            />
            <InvalidRow 
                invalid={editing&&editing.invalid}
                isLoading={isLoading}
                isReadOnly={isReadOnlyByAuth}
                onChange={handleChange}
            />
        </InputForm>    
    );
}

/**
 * 日時行
 */
const DateTimeRow = ({ isLoading, dateTimeInfo, startDate, endDate, startValidation, endValidation, onChangeDateTime: handleChangeDateTime }) => {
    const nextDay = moment().add(1, 'day').hours(0).minutes(0).second(0).millisecond(0);
    return (
        <InputForm.Row>
            <InputForm.Col label="期間" columnCount={1} isRequired={true}>
                <DateTimeSpanForm
                    isReadOnly={isLoading}
                    isReadOnlyFrom={dateTimeInfo.disableStartDate}
                    isReadOnlyTo={dateTimeInfo.disableEndDate}
                    timePicker={true}
                    format={SCHEDULE_DATETIME_FORMAT}
                    from={startDate}
                    validationFrom={startValidation}
                    to={endDate}
                    fromMax={null}
                    fromMin={moment(nextDay)}
                    toMax={null}
                    toMin={moment(nextDay).add(15, 'm')}
                    validationTo={endValidation}
                    onChange={(start, end) => handleChangeDateTime('dateTime', { startDate: start, endDate: end })}
                />
            </InputForm.Col>
        </InputForm.Row>
    );
}


/**
* 名称・所属行
*/
const NameEnterpriseRow = ({ isLoading, isReadOnly, isReadOnlyEnterprise, name, nameValidation, enterpriseList, selectedEnterprises, mainEnterprise, enterpriseValidation, onChange: handleChange }) => {
    return (
        <InputForm.Row>
            <InputForm.Col label="名称" columnCount={2} isRequired={true}>
                <TextForm
                    isReadOnly={isLoading||isReadOnly}
                    value={name}
                    maxlength={MAX_LENGTH_SCHDULE_NAME}
                    validationState={nameValidation && nameValidation.state}
                    helpText={nameValidation && nameValidation.helpText}
                    onChange={handleChange.bind(this, "name")}
                />
            </InputForm.Col>
            <InputForm.Col label="所属" columnCount={2} isRequired={true}>
                <EnterpriseForm
                    initialTreeMode="individual"
                    multiple={false}
                    enterpriseList={enterpriseList}
                    selectedEnterprise={selectedEnterprises.length>0?selectedEnterprises[0]:[]}
                    validationState={enterpriseValidation && enterpriseValidation.state}
                    helpText={enterpriseValidation && enterpriseValidation.helpText}
                    disabled={isLoading||isReadOnlyEnterprise}
                    onChange={(enterprise) => handleChange("enterprises", enterprise ? [ enterprise ] : [])}
                />
            </InputForm.Col>
        </InputForm.Row>
    );
}


/**
* 色選択行
*/
const ColorSelectRow = ({ isLoading, isReadOnly, backColor, textColor, onChange:handleChange}) => {
    return (
        <InputForm.Row>
            <InputForm.Col
                label="背景色"
                columnCount={2}
                isRequired={true}
            >
                <ColorForm
                    color={backColor}
                    isReadOnly={isLoading||isReadOnly}
                    onChange={handleChange.bind(this, "backColor")}
                />
            </InputForm.Col>
            <InputForm.Col
                label="文字色"
                columnCount={2}
                isRequired={true}
            >
                <ColorForm
                    color={textColor}
                    isReadOnly={isLoading||isReadOnly}
                    onChange={handleChange.bind(this, "textColor")}
                />
            </InputForm.Col>
        </InputForm.Row>
    );
}

/**
 * 制御行
 */
const ControlPatternRow = ({ isLoading, isReadOnly, maxCount, commands, locations, controls, onChange: handleChanged }) => {
    return (
        <InputFormSingleRow label="制御" isRequired={true}>
            <ControlOperationsEditForm 
                isReadOnly={isLoading||isReadOnly}
                isRequired={true}
                controlOperations={commands?commands:[]}
                locations={locations}
                controls={controls}
                maxCount={maxCount}
                onChange={handleChanged}
            />
        </InputFormSingleRow>
    );
}

/**
 * 実行周期行
 */
const RepeatCycleRow = ({ isLoading, isReadOnly, scheduleTiming, operationTime, weekPattern, day, validate, onChange: handleChange }) => {
    const disabled = isLoading || isReadOnly;
    const repeatChecked = !(scheduleTiming===SCHEDULE_TIMING.noRepeat);
    return (
        <InputFormSingleRow label="実行周期" isRequired={true}>
            <CheckboxSwitch 
                text="繰り返す"
                bsSize="sm"
                disabled={disabled} 
                checked={repeatChecked}
                onChange={(checked) => {
                    repeatChecked !== checked && handleChange('scheduleTiming', (checked ? INITIAL_SCHEDULE_TIMING : SCHEDULE_TIMING.noRepeat))
                }}
            />
            {repeatChecked&&
                <RepeatPatternForm 
                    className="mt-05 ml-05" 
                    scheduleTiming={scheduleTiming} 
                    onChange={handleChange.bind(this, 'scheduleTiming')} />
            }
            {repeatChecked&&
                <div className="mt-1 ml-05 pa-1" style={{border: '1px dashed gray'}}>
                    <OperationTimeFrom 
                        isReadOnly={disabled}
                        startTime={operationTime&&operationTime.operationStartDate}
                        endTime={operationTime&&operationTime.operationEndDate}
                        startValidation={validate.startTime}
                        endValidation={validate.endTime}
                        validation={validate.operationDate}
                        onChange={(start, end) => handleChange('operationTime', { startTime: start, endTime: end })}
                    />
                    {scheduleTiming===SCHEDULE_TIMING.weekly&&
                        <WeekPatternForm 
                            className="mt-1 ml-05"  
                            weekPattern={weekPattern} 
                            isReadOnly={disabled}
                            validate={validate.week}
                            onChange={handleChange} 
                        />
                    }
                    {scheduleTiming===SCHEDULE_TIMING.monthly&&
                        <MonthlyPatternForm 
                            className="mt-1 ml-05"
                            day={day}
                            isReadOnly={disabled}
                            validate={validate.day}
                            onChange={handleChange}
                        />
                    }
                </div>
            }
        </InputFormSingleRow>
    );
}

/**
* メモ編集行
*/
const MemoEditRow = ({ isLoading, isReadOnly, memo, validation, onChange:handleChange}) => {
    return (
        <InputFormSingleRow label="メモ" isRequired={false}>
            <TextareaForm
                isReadOnly={isLoading||isReadOnly}
                value={memo}
                maxlength={MAX_LENGTH_SCHDULE_MEMO}
                validationState={_.get(validation, "state")}
                helpText={_.get(validation, "helpText")}
                onChange={handleChange.bind(this, "memo")}
            />
        </InputFormSingleRow>
    );
}

/**
 * 無効状態行
 */
const InvalidRow = ({ isLoading, isReadOnly, invalid, onChange: handleChange }) => {
    return (
        <InputFormSingleRow label="実行する" isRequired={true} >
            <CheckboxSwitch text={!invalid?"ON":"OFF"} 
                            disabled={isLoading||isReadOnly}
                            checked={!invalid} 
                            onChange={(checked) => handleChange('invalid', !checked)}
            />
        </InputFormSingleRow>
    )
}

/**
 * 繰り返しパターン 
 */
const RepeatPatternForm = ({ scheduleTiming, className, disabled, onChange:handleChange }) => {
    return (
        <div className={className}>
            <RadioForm name="timing" disabled={disabled} text="毎日" checked={scheduleTiming===SCHEDULE_TIMING.daily} onChange={() => handleChange(SCHEDULE_TIMING.daily)} />
            <RadioForm name="timing" disabled={disabled} text="毎週" checked={scheduleTiming===SCHEDULE_TIMING.weekly} onChange={() => handleChange(SCHEDULE_TIMING.weekly)} />
            <RadioForm name="timing" disabled={disabled} text="毎月" checked={scheduleTiming===SCHEDULE_TIMING.monthly} onChange={() => handleChange(SCHEDULE_TIMING.monthly)} />
        </div>
    );
}

/**
 * 実行時刻フォーム
 */
const OperationTimeFrom = ({ isLoading, isReadOnly, startTime, endTime, startValidation, endValidation, validation, onChange: handleChangeTime }) => {
    const onChangeTime = (start, end) => {
        const startTime = isDate(start, SCHEDULE_TIME_FORMAT) ? moment({hour: start.hour(), minute: start.minute(), seconds: 0, milliseconds: 0}) : start;
        const endTime = isDate(end, SCHEDULE_TIME_FORMAT) ? moment({hour: end.hour(), minute: end.minute(), seconds: 0, milliseconds: 0}) : end;
        handleChangeTime(startTime, endTime); 
    }

    return (        
        <DateTimeSpanForm
            isReadOnly={isLoading||isReadOnly}
            timePicker={true}
            format={SCHEDULE_TIME_FORMAT}
            from={startTime}
            validationFrom={startValidation}
            to={endTime}
            viewMode="time"
            validationTo={endValidation}
            onChange={onChangeTime}
            validation={validation}
        />
    );

    
}

/**
 * 週パターンフォーム
 */
const WeekPatternForm = ({ className, weekPattern, isReadOnly, validate, onChange:handleChange }) => {
    const stateClass = validate ? 'has-' + validate.state : '';
    return (
        <div className={classNames(className, stateClass)} >
            <ControlLabel className="pa-0">曜日指定</ControlLabel>
            <div>
                <Checkbox inline disabled={isReadOnly} checked={weekPattern.sunday} onChange={(e) => handleChange('sunday', e.target.checked)}>日曜日</Checkbox>
                <Checkbox inline disabled={isReadOnly} checked={weekPattern.monday} onChange={(e) => handleChange('monday', e.target.checked)}>月曜日</Checkbox>
                <Checkbox inline disabled={isReadOnly} checked={weekPattern.tuesday} onChange={(e) => handleChange('tuesday', e.target.checked)}>火曜日</Checkbox>
                <Checkbox inline disabled={isReadOnly} checked={weekPattern.wednesday} onChange={(e) => handleChange('wednesday', e.target.checked)}>水曜日</Checkbox>
                <Checkbox inline disabled={isReadOnly} checked={weekPattern.thursday} onChange={(e) => handleChange('thursday', e.target.checked)}>木曜日</Checkbox>
                <Checkbox inline disabled={isReadOnly} checked={weekPattern.friday} onChange={(e) => handleChange('friday', e.target.checked)}>金曜日</Checkbox>
                <Checkbox inline disabled={isReadOnly} checked={weekPattern.saturday} onChange={(e) => handleChange('saturday', e.target.checked)}>土曜日</Checkbox>    
            </div>
            {validate.helpText&&<HelpBlock>{validate.helpText}</HelpBlock>}
        </div>
    );
}

/**
 * 毎月のパターンフォーム
 */
const MonthlyPatternForm = ({ className, day, isReadOnly, validate, onChange: handleChange }) => {
    const stateClass = validate ? 'has-' + validate.state : '';
    return (
        <div className={classNames(className, stateClass)} >
            <ControlLabel className="pa-0">日付指定</ControlLabel>
            <FormControl componentClass='select' className="width-auto" value={day ? day : -1} onChange={(e) => handleChange('day', parseInt(e.target.value))} disabled={isReadOnly}>
                {[...Array(31)].map((_, i) => 
                    <option value={i+1}>{(i+1) + '日'}</option>
                 )
                }
                <option value={SCHEDULE_LASTDAY_VALUE}>{SCHEDULE_LASTDAY_NAME}</option>
            </FormControl>
            {validate.helpText&&<HelpBlock>{validate.helpText}</HelpBlock>}
        </div>
    );
}

/**
* 単一カラム入力フォーム行
*/
const InputFormSingleRow = ({ label, isRequired, children}) => {
    return (
        <InputForm.Row>
            <InputForm.Col
                label={label}
                columnCount={1}
                isRequired={isRequired}
            >
                {children}
            </InputForm.Col>
        </InputForm.Row>
    );
}


/**
 * ラジオボタンフォーム 
 */
const RadioForm = ({ name, text, checked, disabled, onChange: handleChange }) => {
    return (
        <Radio inline name={name} checked={checked} onChange={handleChange} disabled={disabled}>
            {text}
        </Radio>
    );
}