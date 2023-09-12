/**
 * @license Copyright 2017 DENSO
 * 
 * スケジュール登録画面のReactコンポーネント
 * 
 */

'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import { bindActionCreators } from 'redux';

import * as Actions from './actions';
import { confirmSave, confirmDelete, closeModal, showErrorMessage } from 'ModalState/actions';
import { FUNCTION_ID_MAP, LAVEL_TYPE, getAuthentication } from 'authentication';

import FullLocationsDisplay from 'WorkSchedule/FullLocationsDisplay';

import Content from 'Common/Layout/Content';
import Box from 'Common/Layout/Box';
import InputForm from 'Common/Form/InputForm';
import TextForm from 'Common/Form/TextForm';
import TextareaForm from 'Common/Form/TextareaForm';
import DateTimeSpanForm from 'Common/Form/DateTimeSpanForm';
import ColorForm from 'Common/Form/ColorForm';
import CheckboxSwitch from 'Common/Widget/CheckboxSwitch';

import GarmitBox from 'Assets/GarmitBox';
import EnterpriseForm from 'Assets/Condition/EnterpriseForm';
import PointSelectModal from 'Assets/Modal/PointSelectModal';
import MessageModal from 'Assets/Modal/MessageModal';
import WaitingMessage from 'Assets/Modal/WaitingMessage';
import ListDisplayTable, { makeComponentColumn } from 'Assets/ListDisplayTable';
import { SaveButton, CancelButton, DeleteButton, AddButton } from 'Assets/GarmitButton';

import { getPointTableData, SCHEDULE_DATETIME_FORMAT } from 'scheduleUtility';

class ScheduleEditPanel extends Component {

    constructor(props){
        super(props);
        this.state = {
            showPointSelectModal: false,
            pointTableData: getPointTableData(_.get(this.props, "editing.edit.points", []), this.handleChangeAlarmState),
            checkedRowIndex: [],
            dateTimeInfo: {
                displayDateTime: null,        //画面表示時刻（日時指定判定に使用する）
                disableStartDate: true,      //開始日時フォームが無効状態
                disableEndDate: true         //終了日時フォームが無効状態
            }
        };
    }

    /**
     * コンポーネントマウント後に1度だけ呼ばれる
     * (一覧画面からの遷移時にも呼ばれる)
     */
    componentDidMount() {
        //所属情報取得
        this.props.requestEnterprises();
    }

    /**
     * 新たなPropsを受け取ったときに実行
     */
    componentWillReceiveProps(nextProps) {
        const beforePoints = _.get(this.props.editing, "edit.points", []);
        const nextPoints = _.get(nextProps.editing, "edit.points", []);
        if (beforePoints !== nextPoints) {
            this.setState({ pointTableData: getPointTableData(nextPoints, this.handleChangeAlarmState) });
        }
        const displayTime = moment().second(0).millisecond(0);
        const nextStartDate = _.get(nextProps, "editing.edit.startDate");
        const nextEndDate = _.get(nextProps, "editing.edit.endDate");
        if (!this.state.dateTimeInfo.displayDateTime && (nextStartDate || nextEndDate)) {   //初回のみdisable設定（編集時はエラーメッセージ表示とする）
            const disableStartDate = nextStartDate && moment(nextStartDate, SCHEDULE_DATETIME_FORMAT) <= displayTime;
            const disableEndDate = nextEndDate && moment(nextEndDate, SCHEDULE_DATETIME_FORMAT) <= displayTime;
            this.setState({
                dateTimeInfo: {
                    displayDateTime: displayTime,
                    disableStartDate: disableStartDate,
                    disableEndDate: disableEndDate,
                },
                pointTableData: getPointTableData(nextPoints, this.handleChangeAlarmState, undefined, disableStartDate)
            });
        }
    }    

    //#region イベントハンドラ
    /**
     * アラーム監視チェック状態変更イベント
     */
    handleChangeAlarmState = (index, e) => {
        let points = _.cloneDeep(this.props.editing.edit.points);
        points[index].maintMode = !e;
        this.props.changeSchedule({ key: "points", value: points });
    }

    /**
     * キャンセルボタン押下イベント
     */
    handleClickCancel = () => {
        //編集画面に遷移する
        browserHistory.push({ pathname: '/WorkSchedule' });
        //編集情報クリア
        this.props.clearEdit();
    }

    /**
     * モーダルクローズイベント
     */
    handleCloseModal = () => {
        if (this.props.modalState.okOperation === "transition") {
            //保存に成功した場合、画面移動
            browserHistory.push({ pathname: '/WorkSchedule'});
        }
        this.props.closeModal();
    }

    /**
     * 保存ボタン押下イベント
     */
    handleClickSave = () => {        
        const { edit } = this.props.editing;
        const { disableStartDate, disableEndDate } = this.state.dateTimeInfo;
        const nowTime = moment().second(0).millisecond(0);
        if (!disableStartDate) {
            if (moment(edit.startDate) <= nowTime) {
                this.props.showErrorMessage({ message: "開始日時は現在よりも後の日時を指定してください。" });
                return;
            }
        }
        if (!disableEndDate) {
            if (moment(edit.endDate) < moment(nowTime).add(15, 'm')) {
                this.props.showErrorMessage({ message: "終了日時は現在から15分後以降の日時を指定してください。" });
                return;
            }
        }
        this.props.confirmSave({targetName:"編集中スケジュール", okOperation:"save"});
    }

    /**
     * 確認モーダルOK押下イベント
     */
    handleOK = () => {
        this.props.closeModal();
        switch (this.props.modalState.okOperation) {
            case "save":
                this.saveSchedules();
                break;
            case "deletePoints":
                this.deletePoints();
                break;
            default: break;
        }
    }

    /**
     * 編集イベント
     */
    handleChange = (key, e) => {
        this.props.changeSchedule({ key: key, value: e });
    }

    /**
     * チェック状態変更イベントイベント
     */
    handleChecked = (checked) => {
        this.setState({ checkedRowIndex: checked});
    }

    /**
     * 作業日時編集イベント
     */
    handleChangeDateTime = (start, end) => {
        this.props.changeSchedule({ key: "dateTime", value: {startDate:start, endDate:end} });
    }

    /**
     * 削除ボタン押下イベント
     */
    handleClickDelete = () => {
        this.props.confirmDelete({ targetName: "チェック中のポイント", okOperation: "deletePoints" });
    }

    /**
     * 追加ボタン押下イベント
     */
    handleClickAdd = () => {
        //ポイント選択モーダル表示
        this.setState({ showPointSelectModal: true });
    }

    /**
     * ポイント追加イベント
     */
    handleAddPoint = (e) => {
        //現在選択中のポイントに追加ポイントをマージ
        let allPoints = _.cloneDeep(this.props.editing.edit.points).concat(e);
        //重複削除して渡す
        this.props.changeSchedule({ key: "points", value: _.unionBy(allPoints, "pointNo") });
        this.setState({ showPointSelectModal: false });
    }

    /**
     * ポイント選択モーダルクローズイベント
     */
    handleClosePointModal = () => {
        this.setState({ showPointSelectModal: false });
    }
    //#endregion

    render() {
        const { editing, modalState, userInfo, isLoading, waitingInfo } = this.props;
        const { edit } = editing;
        const { showPointSelectModal, pointTableData, checkedRowIndex, dateTimeInfo } = this.state;
        const isCheckedPoint = checkedRowIndex.length > 0 ? true : false;

        return (
            <Content>
                <SaveCancelButton canSave={edit.canSave&&!(dateTimeInfo.disableStartDate&&dateTimeInfo.disableEndDate)} disabled={isLoading} onClickSave={this.handleClickSave} onClickCancel={this.handleClickCancel} />
                <GarmitBox isLoading={isLoading} title="作業スケジュール（*は必須項目）">
                    <BoxBody
                        editing={edit}
                        userInfo={userInfo}
                        dateTimeInfo={dateTimeInfo}
                        pointTableData={pointTableData}
                        isCheckedPoint={isCheckedPoint}
                        isLoading={isLoading}
                        onChange={this.handleChange}
                        onChecked={this.handleChecked}
                        onClickDelete={this.handleClickDelete}
                        onClickAdd={this.handleClickAdd}
                        onChangeDateTime={this.handleChangeDateTime}
                    />
                </GarmitBox>
                <PointSelectModal showModal={showPointSelectModal} multiSelect={true} onSubmit={this.handleAddPoint} onCancel={this.handleClosePointModal} />
                <MessageModal
                    show={modalState.show}
                    title={modalState.title}
                    bsSize="small"
                    buttonStyle={modalState.buttonStyle}
                    children={modalState.message}
                    onOK={this.handleOK}
                    onCancel={this.handleCloseModal}
                />
                <WaitingMessage show={waitingInfo.isWaiting} type={waitingInfo.waitingType} />
            </Content>
        );
    }    

    /**
    * スケジュール保存
    */
    saveSchedules() {
        const { edit } = this.props.editing;
        this.props.requestSave(_.cloneDeep(edit));
    }

    /**
    * 対象ポイント削除
    */
    deletePoints() {
        //削除対象情報取得
        let points = [];
        _.remove(this.props.editing.edit.points, (point, index) => {
            if (!_.includes(this.state.checkedRowIndex, index)) {
                points.push(point);
            }
        })
        this.props.changeSchedule({ key: "points", value: points });
        this.setState({ checkedRowIndex: [] });
        this.props.closeModal();
    }
}

// Which props do we want to inject, given the global state?
// Note: use https://github.com/faassen/reselect for better performance.
const mapStateToProps = (state) => {
    return {
        editing: state.editing,
        modalState: state.modalState,
        userInfo: state.userInfo,
        isLoading: state.isLoading,
        waitingInfo: state.waitingInfo
    };
};

//画面更新のアクションを設定します。
const mapDispatchToProps = (dispatch) => {
    return {
        ...bindActionCreators(Actions, dispatch),
        setAuthentication: (auth) => dispatch(setAuthentication(auth)),
        confirmSave: (data) => dispatch(confirmSave(data)),
        confirmDelete: (data) => dispatch(confirmDelete(data)),
        closeModal: () => dispatch(closeModal()),
        showErrorMessage: (data) => dispatch(showErrorMessage(data))
    };
};

// Wrap the component to inject dispatch and state into it
export default connect(mapStateToProps, mapDispatchToProps)(ScheduleEditPanel);

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
    const { editing, userInfo, pointTableData, isLoading, isCheckedPoint, dateTimeInfo } = props;
    const { onChange: handleChange, onChecked: handleChecked, onChangeDateTime: handleChangeDateTime } = props;
    const { onClickDelete: handleClickDelete, onClickAdd: handleClickAdd } = props;
    const dateTimeProps = _.pick(editing, ['startDate', 'endDate', 'startValidation', 'endValidation']);
    const nameProps = _.pick(editing, ['name', 'nameValidation']);
    const colorProps = _.pick(editing, ['backColor', 'textColor']);
    const memoProps = _.pick(editing, ['memo', 'memoValidation']);

    return (
        <Box.Body>
            <InputForm>
                <DateTimeRow
                    {...dateTimeProps }
                    dateTimeInfo={dateTimeInfo}
                    isLoading={isLoading}
                    onChangeDateTime={handleChangeDateTime}
                />
                <NameEnterpriseRow
                    {...nameProps }
                    enterpriseList={userInfo.enterprises}
                    checkedEnterprises={editing.enterprises}
                    mainEnterprise={userInfo.mainEnterprise}
                    enterpriseValidation={editing.enterpriseValidation}
                    isLoading={isLoading}
                    isReadOnly={dateTimeInfo.disableStartDate&&dateTimeInfo.disableEndDate}
                    isReadOnlyEnterprise={dateTimeInfo.disableStartDate}
                    onChange={handleChange}
                />
                <ColorSelectRow
                    {...colorProps}
                    isLoading={isLoading}
                    isReadOnly={dateTimeInfo.disableStartDate&&dateTimeInfo.disableEndDate}
                    onChange={handleChange}
                />
                <TargetPointSelectRow
                    isCheckedPoint={isCheckedPoint}
                    tableData={pointTableData}
                    isLoading={isLoading}
                    isReadOnly={dateTimeInfo.disableStartDate}
                    onChecked={handleChecked}
                    onChange={handleChange}
                    onClickDelete={handleClickDelete}
                    onClickAdd={handleClickAdd}
                />
                <MemoEditRow
                    {...memoProps}
                    isLoading={isLoading}
                    isReadOnly={dateTimeInfo.disableStartDate&&dateTimeInfo.disableEndDate}
                    onChange={handleChange.bind(this, "memo")}
                />
            </InputForm>
        </Box.Body>
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
* 作業日時行
*/
const DateTimeRow = ({ isLoading, dateTimeInfo, startDate, endDate, startValidation, endValidation, onChangeDateTime: handleChangeDateTime }) => {
    const now = moment().second(0).millisecond(0);
    return (
        <InputForm.Row>
            <InputForm.Col label="作業日時" columnCount={1} isRequired={true}>
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
                    fromMin={moment(now)}
                    toMax={null}
                    toMin={moment(now).add(15, 'm')}
                    validationTo={endValidation}
                    onChange={handleChangeDateTime}
                />
            </InputForm.Col>
        </InputForm.Row>
    );
}

/**
* 作業名称・所属行
*/
const NameEnterpriseRow = ({ isLoading, isReadOnly, isReadOnlyEnterprise, name, nameValidation, enterpriseList, checkedEnterprises, mainEnterprise, enterpriseValidation, onChange: handleChange }) => {
    return (
        <InputForm.Row>
            <InputForm.Col label="作業名称" columnCount={2} isRequired={true}>
                <TextForm
                    isReadOnly={isLoading||isReadOnly}
                    value={name}
                    maxlength={100}
                    validationState={nameValidation && nameValidation.state}
                    helpText={nameValidation && nameValidation.helpText}
                    onChange={handleChange.bind(this, "name")}
                />
            </InputForm.Col>
            <InputForm.Col label="所属" columnCount={2} isRequired={true}>
                <EnterpriseForm
                    initialTreeMode="individual"
                    multiple={true}
                    enterpriseList={enterpriseList}
                    checkedEnterprises={checkedEnterprises}
                    mainEnterprise={mainEnterprise}
                    validationState={enterpriseValidation && enterpriseValidation.state}
                    helpText={enterpriseValidation && enterpriseValidation.helpText}
                    disabled={isLoading||isReadOnlyEnterprise}
                    onChange={handleChange.bind(this, "enterprises")}
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
* 対象ポイント選択行
*/
const TargetPointSelectRow = ({ isReadOnly, isCheckedPoint, tableData, onChecked: handleChecked, onClickDelete: handleClickDelete, onClickAdd: handleClickAdd, onChangeIsAlarm: handleChangeIsAlarm }) => {

    return (
        <InputFormSingleRow label="対象ポイント" isRequired={false}>
            <div style={{ float: "left" }}>
                {!isReadOnly&&<DeleteButton className="mr-05" disabled={!isCheckedPoint} onClick={handleClickDelete.bind(this, "delete")} />}
                {!isReadOnly&&<AddButton onClick={handleClickAdd.bind(this, "add")} />}
            </div>
            <ListDisplayTable
                id="targetPointTable"
                data={tableData.data}
                headerSet={tableData.headerSet}
                useCheckbox={true&&!isReadOnly}
                headerCheckbox={true&&!isReadOnly}
                order={[[1, 'asc']]}
                className="target-point-datatable"
                onChangeCheckState={handleChecked}
            />      
        </InputFormSingleRow>
    );
}

/**
* フルロケーション一覧表示カラム
*/
export const LocationColumn = makeComponentColumn(FullLocationsDisplay);

/**
* アラーム監視スイッチ
*/
const AlarmSwitch = (props) => (
    <CheckboxSwitch
        {...props}
        text="監視する"
        bsSize="sm"
        checked={props.checked}
        onChange={props.onChange}
    />
);

/**
* アラーム監視スイッチカラム
*/
export const AlarmSwitchColumn = makeComponentColumn(AlarmSwitch);

/**
* 作業メモ編集行
*/
const MemoEditRow = ({ isLoading, isReadOnly, memo, memoValidation, onChange:handleChange}) => {
    return (
        <InputFormSingleRow label="作業メモ" isRequired={false}>
            <TextareaForm
                isReadOnly={isLoading||isReadOnly}
                value={memo}
                maxlength={500}
                validationState={_.get(memoValidation, "state")}
                helpText={_.get(memoValidation, "helpText")}
                onChange={handleChange}
            />
        </InputFormSingleRow>
    );
}