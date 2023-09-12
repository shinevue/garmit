/**
 * @license Copyright 2019 DENSO
 * 
 * 電気錠操作ボックス Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { ControlLabel, FormGroup, Checkbox, HelpBlock } from 'react-bootstrap';

import Box from 'Common/Layout/Box';
import Button from 'Common/Widget/Button';
import Icon from 'Common/Widget/Icon';
import ListDisplayTable, { makeComponentColumn } from 'Assets/ListDisplayTable';
import TextareaForm from 'Common/Form/TextareaForm';
import { RemoveCircleButton } from 'Assets/GarmitButton';
import EnterpriseCellDisplay from 'ElectricLockMap/EnterpriseCellDisplay';
import MultipleLineCellDisplay from 'ElectricLockMap/MultipleLineCellDisplay';
import UnlockPurposeSelectForm from 'Assets/Form/UnlockPurposeSelectForm';
import ExtendedItemFormList from 'Assets/ExtendedItemFormList';

import { isAllBothTargetOrPhysicalKey, MAX_LENGTH_OPERATION_MEMO, makeLockStatusName } from 'electricLockUtility';
import { successResult } from 'inputCheck';

/**
 * 電気錠操作ボックスコンポーネント
 * @param {array} electricLockRacks 選択中の電気錠ラックリスト
 * @param {string} operationMemo メモ
 * @param {array} operationExtendedPages 詳細項目情報
 * @param {object} operationTarget 操作対象
 * @param {object} memoValidation メモの検証結果
 * @param {boolean} extendedPagesError 詳細情報が入力エラーとなっているか
 * @param {boolean} unlockPurposeError 開錠目的が入力エラーとなっているか
 * @param {object} targetValidatation 操作対象の検証結果
 * @param {array} unlockPurposes 開錠目的リスト
 * @param {object} selectedUnlockPurpose 選択中の開錠目的
 * @param {boolean} isReadOnly 読取専用かどうか
 * @param {boolean} isLoading ロード中かどうか
 * @param {function} onUnlock 開錠を呼び出す
 * @param {function} onLock 施錠を呼び出す
 * @param {function} onRemove 選択中の電気錠ラックリストから指定の電気錠ラックを解除する
 * @param {function} onClear 選択中の電気錠ラックを全クリアする
 * @param {function} onChangeMemo メモを変更する
 * @param {function} onChangeTarget 操作対象を変更する
 * @param {function} onChangeExtendedPages 詳細項目情報を変更する
 * @param {function} onChangeUnlockPurpose 開錠目的を変更する
 * @param {function} onSaveUnlockPurpose 開錠目的を保存する
 * @param {function} onDeleteUnlockPurpose 開錠目的を削除する
 */
export default class KeyOperationBox extends Component {
    
    /**
     * render
     */
    render() {
        const { electricLockRacks, operationExtendedPages, operationMemo, operationTarget, memoValidation, targetValidatation, extendedPagesError, unlockPurposeError, isLoading } = this.props;
        const { unlockPurposes, selectedUnlockPurpose } = this.props;
        const { isReadOnly } = this.props;
        const headers = this.getHeader();
        const rows = this.getTableData(electricLockRacks);
        const extendedItems = operationExtendedPages && operationExtendedPages.length > 0 ? operationExtendedPages[0].extendedItems : [];
        const disabled = !electricLockRacks||electricLockRacks.length<=0;        
        return (
            <Box isLoading={isLoading}>
                <Box.Header>
                    <Box.Title>選択ラック</Box.Title>
                </Box.Header >
                <Box.Body>
                    <ListDisplayTable id="selectRackTable" 
                        data={rows} 
                        headerSet={headers} 
                        noOrderColIndexArray = {[0]}
                        order={[[1, 'asc']]}
                        selectable={false}
                        stateSave
                     />
                    <div className="flex-center-right mt-05">
                         <Button bsStyle="lightgray" disabled={disabled} onClick={this.handleClearClick}>選択クリア</Button>
                    </div>
                </Box.Body>
                {!isReadOnly&&!disabled&&
                    <Box.Footer>
                        <UnlockPurposeSelectForm 
                            isReadOnly={isLoading}
                            unlockPurposes={unlockPurposes}
                            selectedPurpose={selectedUnlockPurpose}
                            onChange={this.handleChangeUnlockPurpose}
                            onSave={this.handleSaveUnlockPurpose}
                            onDelete={this.handleDeleteUnlockPurpose}
                        />
                        {extendedItems.length > 0 &&
                            <ExtendedItemFormList
                                extendedItems={extendedItems}
                                onChange={this.handleChangeExtendedItems}
                            />
                        }
                        <TextareaForm 
                            label="メモ"
                            value={operationMemo}
                            validationState={!disabled&&memoValidation&&memoValidation.state}
                            helpText={!disabled&&memoValidation&&memoValidation.helpText}
                            onChange={this.handleChangeMemo}
                            maxlength={MAX_LENGTH_OPERATION_MEMO}
                        />               
                        {!isAllBothTargetOrPhysicalKey(electricLockRacks) &&
                            <TargetOperationForm 
                                front={operationTarget.front}
                                rear={operationTarget.rear}
                                validationState={!disabled&&targetValidatation&&targetValidatation.state}
                                helpText={!disabled&&targetValidatation&&targetValidatation.helpText}
                                onChange={this.handleChangeTarget}
                            />
                        }
                        <div className="flex-center-right">
                            <div>
                                <Button 
                                    bsStyle="success" 
                                    className="mr-05" 
                                    disabled={disabled||this.invalid(memoValidation, targetValidatation, extendedPagesError, unlockPurposeError, false)} 
                                    onClick={this.handleUnlockClick}>
                                    <Icon className="fal fa-lock-open-alt mr-05" />
                                    開錠
                                </Button>
                                <Button 
                                    bsStyle="lightgray" 
                                    disabled={disabled||this.invalid(memoValidation, targetValidatation, extendedPagesError, unlockPurposeError, true)} 
                                    onClick={this.handleLockClick}>
                                    <Icon className="fal fa-lock-alt mr-05" />
                                    施錠
                                </Button>
                            </div>
                        </div>
                    </Box.Footer>
                }
            </Box>
        );
    }

    //#region イベントハンドラ

    /**
     * クリアボタンクリックイベント
     */
    handleClearClick = () => {
        if (this.props.onClear) {
            this.props.onClear();
        }
    }

    /**
     * 選択解除ボタンクリックイベント
     */
    handleRemoveClick = (rack) => {
        if (this.props.onRemove) {
            this.props.onRemove(rack)
        }
    }

    /**
     * 開錠ボタンクリックイベント
     */
    handleUnlockClick = () => {
        if (this.props.onUnlock) {
            this.props.onUnlock();
        }
    }

    /**
     * 施錠ボタンクリックイベント
     */
    handleLockClick = () => {
        if (this.props.onLock) {
            this.props.onLock();
        }
    }

    /**
     * メモを変更する
     */
    handleChangeMemo = (memo) => {
        if (this.props.onChangeMemo) {
            this.props.onChangeMemo(memo)
        }
    }

    /**
     * 詳細項目を変更する
     */
    handleChangeExtendedItems = (extendedItems, isError) => {
        if (this.props.onChangeExtendedPages) {
            const extendedPages = _.cloneDeep(this.props.operationExtendedPages);
            extendedPages[0].extendedItems = extendedItems;
            this.props.onChangeExtendedPages(extendedPages, isError)
        }
    }

    /**
     * 操作対象を変更する
     */
    handleChangeTarget = (front, rear) => {
        if (this.props.onChangeTarget) {
            this.props.onChangeTarget(front, rear);
        }
    }

    /**
     * 開錠目的を変更する
     */
    handleChangeUnlockPurpose = (purpose) => {
        if (this.props.onChangeUnlockPurpose) {
            this.props.onChangeUnlockPurpose(purpose);
        }
    }

    /**
     * 開錠目的を保存する
     */
    handleSaveUnlockPurpose = (purpose, callback) => {
        if (this.props.onSaveUnlockPurpose) {
            this.props.onSaveUnlockPurpose(purpose, callback);
        }
    }
    
    /**
     * 開錠目的を削除する
     */
    handleDeleteUnlockPurpose = (purpose) => {
        if (this.props.onDeleteUnlockPurpose) {
            this.props.onDeleteUnlockPurpose(purpose);
        }
    }

    //#endregion

    //#region 一覧表示

    /**
     * ヘッダを取得する
     */
    getHeader() {
        return　['', 'ラック', '状態', '所属'];
    }

    /**
     * 一覧のデータを作成する
     * @param {array} electricLockRacks 電気錠ラックリスト
     */
    getTableData(electricLockRacks) {
        return electricLockRacks ? electricLockRacks.map((rack) => {
            return {
                alarmCssClassName: rack.electricLocks.some((lock) => lock.isError) ? 'error' : '',
                cells: [
                    { Component: RemoveButtonColumn, disabled: false, onClick: this.handleRemoveClick.bind(this, rack) }, 
                    { value: rack.locationName, foreColor: "black" }, 
                    { Component: LockStatusColumn, values: makeLockStatusName(rack.electricLocks) }, 
                    { Component: EnterpriseColumn, enterpriseNames: rack.enterpriseNames }
                ]
            };
        }) : [] ;
    }

    //#endregion

    //#region その他

    /**
     * 操作が無効かどうか
     * @param {object} memoValidation メモの検証結果
     * @param {object} targetValidatation 操作対象の検証結果
     * @param {boolean} extendedPagesError 詳細項目が入力エラーかどうか
     * @param {boolean} unlockPurposeError 開錠目的が入力エラーかどうか
     * @param {boolean} isLock 施錠かどうか
     */
    invalid(memoValidation, targetValidatation, extendedPagesError, unlockPurposeError, isLock) {
        if (memoValidation && memoValidation.state === successResult.state && 
            targetValidatation && targetValidatation.state === successResult.state &&
            !extendedPagesError &&
            (isLock || !unlockPurposeError)) {
                return false;
        }
        return true;
    } 

    //#endregion

}

KeyOperationBox.propTypes = {
    electricLockRacks: PropTypes.array,
    operationMemo: PropTypes.string,
    operationExtendedPages: PropTypes.array,
    operationTarget: PropTypes.object,
    memoValidation: PropTypes.object,
    targetValidatation: PropTypes.object,
    extendedPagesError: PropTypes.bool,
    unlockPurposeError: PropTypes.bool,
    unlockPurposes: PropTypes.array,
    selectedPurpose: PropTypes.object,
    isReadOnly: PropTypes.bool,
    isLoading: PropTypes.bool,
    onUnlock: PropTypes.func,
    onLock: PropTypes.func,
    onClear: PropTypes.func,
    onRemove: PropTypes.func,
    onChangeMemo: PropTypes.func,
    onChangeTarget: PropTypes.func,
    onChangeExtendedPages: PropTypes.func,
    onChangeUnlockPurpose: PropTypes.func,
    onSaveUnlockPurpose: PropTypes.func,
    onDeleteUnlockPurpose: PropTypes.func
};

KeyOperationBox.defaultProps = { electricLockRacks: [] };

/**
 * 選択解除ボタン
 */
const RemoveButton = (props) => (
    <RemoveCircleButton
        {...props}
        onClick={props.onClick}
    />
);

/**
* 選択解除カラム
*/
const RemoveButtonColumn = makeComponentColumn(RemoveButton);

/**
 * 電気錠ステータスカラム
 */
const LockStatusColumn = makeComponentColumn(MultipleLineCellDisplay);

/**
 * 所属カラム
 */
const EnterpriseColumn = makeComponentColumn(EnterpriseCellDisplay);


/**
 * 操作対象フォーム
 */
const TargetOperationForm = ({front, rear, validationState, helpText, onChange: handleChange}) => {
    return (
        <FormGroup validationState={validationState}>
            <ControlLabel>施開錠対象（前面/背面別操作ラックの場合）</ControlLabel>
            <div>
                <Checkbox 
                    inline
                    checked={front}
                    onClick={(e) => handleChange(e.currentTarget.checked, rear)}
                >
                    前面
                </Checkbox>
                <Checkbox 
                    inline
                    checked={rear}
                    onClick={(e) => handleChange(front, e.currentTarget.checked)}
                >
                    背面
                </Checkbox>
            </div>
            {helpText&& 
                <HelpBlock>{helpText}</HelpBlock>
            }
        </FormGroup>
    );
}