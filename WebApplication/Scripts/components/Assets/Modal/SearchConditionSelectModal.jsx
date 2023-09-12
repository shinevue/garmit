/**
 * @license Copyright 2022 DENSO
 * 
 * SearchConditionSelectModal Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'react-bootstrap';
import SelectForm from 'Common/Form/SelectForm';
import Loading from 'Common/Widget/Loading';
import { ApplyButton, CancelButton } from 'Assets/GarmitButton';
import MessageModal from 'Assets/Modal/MessageModal';

import { validateSelect, VALIDATE_STATE } from 'inputCheck';
import { compareAscending } from 'sortCompare';
import { sendData, EnumHttpMethod, NETWORKERROR_MESSAGE } from 'http-request';
import { createInitSearchCondition, checkExistTargets, checkSearchCondition, checkConditionItems, checkBooleanCondition, checkDateCondition, convertDateTimeConditionItems } from 'searchConditionUtility';
import { DATE_FORMAT } from 'searchConditionUtility'
import { convertJsonDateToMoment } from 'datetimeUtility';
import { convertNumber } from 'numberUtility';

/**
 * 検索条件選択モーダル
 * @param {boolean} showModal モーダルを表示するか
 * @param {array} conditionList 検索条件リスト
 * @param {array} targets 固定検索条件
 * @param {object} lookUp 検索条件のマスタデータ
 * @param {function} onSubmit 適用ボタン押下時に呼び出す
 * @param {function} onCancel キャンセルボタン押下時に呼び出す
 * 
 */
export default class SearchConditionSelectModal extends Component {
    
    /**
     * コンストラクタ
     */
    constructor(props) {
        super(props);
        const conditionList = this.initializeConditionList(props.conditionList);
        this.state = {
            conditionList: conditionList,
            selectedConditon: this.getInitialSelectedCondition(conditionList),
            isLoading: false,
            message: {},
        };
    }

    
    /**
     * 新しいpropsを受け取るときに呼び出す
     */
    componentWillReceiveProps(nextProps) {
        if (nextProps.showModal && nextProps.showModal !== this.props.showModal) {
            const conditionList = this.initializeConditionList(nextProps.conditionList);
            this.setState({
                conditionList: conditionList,
                selectedConditon: this.getInitialSelectedCondition(conditionList),
                isLoading: false,
                message: {},
            });
        }
    }

    /**
     * render
     */
    render() {
        const { showModal } = this.props;
        const { selectedConditon, conditionList, message, isLoading } = this.state;
        const validate = validateSelect(selectedConditon&&selectedConditon.index);
        return (
            <Modal show={showModal} bsSize="sm" backdrop="static" onHide={() => this.handleCancel()}>
                <Modal.Header closeButton>
                    <Modal.Title>検索条件選択</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <SelectForm 
                        value={selectedConditon&&selectedConditon.index} 
                        options={conditionList&&conditionList.map((item) => { return { value: item.index, name: item.name }})}
                        validationState={validate.state}
                        helpText={validate.helpText}
                        onChange={(value) => this.hanldeChanged(value)}
                    />                    
                    <MessageModal
                            show={message.show}
                            title={message.title}
                            bsSize="small"
                            buttonStyle={message.buttonStyle}
                            onOK={message.onOK}
                            onCancel={message.onCancel}
                            disabled={isLoading}
                        >
                            {message.message}
                    </MessageModal>
                    <Loading isLoading={isLoading} />
                </Modal.Body>
                <Modal.Footer>
                    <ApplyButton disabled={this.invalid(validate)} onClick={() => this.loadSearchCondition(selectedConditon)} />
                    <CancelButton onClick={() => this.handleCancel()} />
                </Modal.Footer>
            </Modal>
        )
    }

    //#region イベント

    /**
     * 検索条件セレクトボックス変更イベント
     * @param {*} index 変更後のindex
     */
    hanldeChanged(index) {
        const selectedConditon = this.state.conditionList.find((c) => c.index === convertNumber(index));
        this.setState({ selectedConditon });
    }

    /**
     * キャンセルボタンクリック
     */
    handleCancel() {
        if (this.props.onCancel) {
            this.props.onCancel()
        }
    }

    /**
     * 検索条件適用イベントを呼び出す
     * @param {object} condition 
     */
    onSubmit(condition) {
        if (this.props.onSubmit) {
            this.props.onSubmit(condition);
        }
    }

    //#endregion

    //#region API呼び出し

    /**
     * 検索条件を取得する
     * @param {object} condition 対象の検索条件
     */
    loadSearchCondition(condition) {
        this.setState({ isLoading: true }, () => {
            sendData(EnumHttpMethod.post, '/api/searchCondition/get', { functionId: condition.functionId, saveDate: condition.saveDate }, (data, networkError) => {
                this.setState({ isLoading: false });
                if (networkError) {
                    this.showNetWorkErrorMessage();
                } else if (data) {
                    const resultCondition = this.convertJsonData(data.condition);        
                    const result = this.checkSearchCondition(resultCondition, condition.functionId);
                    if (result.isSuccess) {
                        this.onSubmit(resultCondition);
                    } else {
                        this.showErrorMessage(result.message);
                    }                        
                } else {
                    this.showErrorMessage('検索条件取得に失敗しました。');
                }
            });
        });
    }

    //#endregion

    //#region 検索条件のチェック

    /**
     * 取得した検索条件をチェックする
     * @param {object} targetCondition 対象の条件
     * @param {number} functionId 機能番号
     * @return {object} チェック結果 { isSuccsss, message }
     */
    checkSearchCondition(targetCondition, functionId) {
        const lookUp = _.cloneDeep(this.props.lookUp);

        //targetの存在チェック
        var result = checkExistTargets(targetCondition.targets, this.props.targets);

        //固定検索条件項目チェック
        if (result.isSuccess) {
            result = checkSearchCondition(lookUp, targetCondition);
        }

        //詳細項目検索条件チェック
        if (result.isSuccess) {
            result = checkConditionItems(lookUp, targetCondition)
        }

        //Bool型の検索条件チェック（固定項目と詳細項目以外）
        if (result.isSuccess) {
            result = checkBooleanCondition(targetCondition, functionId);
        }

        //日付型の検索条件チェック（固定項目と詳細項目以外）
        if (result.isSuccess) {
            result = checkDateCondition(targetCondition, functionId);
        }

        return result;
    }

    //#endregion

    //#region エラーメッセージ
   
    /**
     * エラーメッセージを表示する
     * @param {string} message
     */
    showErrorMessage(message) {
        this.setState({
            message: {
                show: true,
                buttonStyle: 'message',
                title: 'エラー',
                message: message,
                onCancel: () => this.closeMessage()
            }
        });
    }

    /**
     * ネットワークエラーメッセージを表示する
     */
    showNetWorkErrorMessage() {
        this.showErrorMessage(NETWORKERROR_MESSAGE);
    }

    /**
     * メッセージモーダルを閉じる
     */
    closeMessage() {
        this.setState({ message: { show: false } });
    }

    //#endregion
    
    //#region 初期化

    /**
     * 検索条件一覧を初期化する
     * @param {array} connects 検索条件一覧(indexなし)
     */    
    initializeConditionList(conditions) {
        let conditionList = conditions ? _.cloneDeep(conditions) : [];
        conditionList = conditionList.sort((currnet, next) => compareAscending(currnet.saveDate, next.saveDate));
        conditionList = this.getInitialConditionList(conditionList);
        return conditionList;
    }

    /**
     * 初期化した検索条件一覧を取得する
     * @param {array} connects 検索条件一覧(indexなし)
     */
    getInitialConditionList(conditions) {
        var index = 1;
        var workConditions = conditions.map((item) => {
            item.index = index;
            index++;
            return item;
        });
        return workConditions;
    }

    /**
     * 最初に選択する検索条件を取得する
     * @param {arrray} conditionList 検索条件一覧
     */
    getInitialSelectedCondition(conditionList) {
        var condition = null
        if (conditionList && conditionList.length > 0) {
            return conditionList[0];
        }
        return condition;
    }

    //#endregion
    
    //#region その他

    /**
     * 適用ボタンが無効かどうか
     * @param {object} validate 入力検証一覧
     */
    invalid(validate) {
        return validate.state !== VALIDATE_STATE.success;
    }

    /**
     * JSONに変換する
     * @param {*} condition 
     */
    convertJsonData(condition) {
        var condition = condition ? JSON.parse(condition) : createInitSearchCondition(this.props.targets);

        //日付型変換
        condition.dateFrom = condition.dateFrom && convertJsonDateToMoment(condition.dateFrom, DATE_FORMAT);
        condition.dateTo = condition.dateTo && convertJsonDateToMoment(condition.dateTo, DATE_FORMAT);
        condition.projectConditionItems = condition.projectConditionItems && convertDateTimeConditionItems(condition.projectConditionItems);
        condition.patchCableConditionItems = condition.patchCableConditionItems && convertDateTimeConditionItems(condition.patchCableConditionItems);
        condition.patchboardConditionItems = condition.patchboardConditionItems && convertDateTimeConditionItems(condition.patchboardConditionItems);

        return condition;
    }

    //#endregion
}