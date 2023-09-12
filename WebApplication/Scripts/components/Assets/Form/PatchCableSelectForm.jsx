/**
 * @license Copyright 2022 DENSO
 * 
 * PatchCableSelectForm Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import { FormGroup, HelpBlock, ButtonToolbar } from 'react-bootstrap';
import { SearchButton, CopyButton } from 'Assets/GarmitButton';
import SelectSearchForm from 'Common/Form/SelectSearchForm';

import { Tooltip, OverlayTrigger } from 'react-bootstrap';
import Button from 'Common/Widget/Button';
import Icon from 'Common/Widget/Icon';

import { makePatchCableNoString } from 'lineUtility';

const PATCHCABLE_NO_ALL = 999999;

/**
 * 線番選択フォーム（ドロップダウン検索機能付き）
 * @param {string} className class名
 * @param {array} patchCables 線番一覧
 * @param {number} selectedPatchboardId 選択中の配線盤ID
 * @param {number} selectedPatchNo 選択中の線番番号
 * @param {boolean} claerButton クリアボタンを表示するかどうか
 * @param {boolean} searchButton 検索ボタンを表示するかどうか
 * @param {boolean} copyButton コピーボタンを表示するかどうか
 * @param {string} validationState 検証結果（success, warning, error, null）
 * @param {string} helpText 入力欄の説明。例：入力エラー時にエラー内容を表示する。
 * @param {boolean} isReadOnly 読み取り専用かどうか
 * @param {boolean} isReadOnlyClear クリアボタンが読み取り専用かどうか
 * @param {boolean} isReadOnlySearch 検索ボタンが読み取り専用かどうか
 * @param {boolean} isReadOnlyCopy コピーボタンが読み取り専用かどうか
 * @param {boolean} isRequiredAllChoice 線番選択肢に「すべて」が必要かどうか
 * @param {function} onChangePatchborad 配線盤選択時に呼び出す
 * @param {function} onChangePatchNo 線番番号選択時に呼び出す（すべての場合は、PatchNo=nullで返す）
 * @param {function} onClear クリアボタンクリック時に呼び出す
 * @param {function} onSearch 検索ボタンクリック時に呼び出す
 * @param {function} onCopy コピーボタンクリック時に呼び出す 
 */
export default class PatchCableSelectForm extends Component {
    
    /**
     * render
     */
    render() {
        const {className, patchCables, selectedPatchboardId, selectedPatchNo, validationState, helpText, isRequiredAllChoice } = this.props;
        const {claerButton, searchButton, copyButton, isReadOnly, isReadOnlyClear, isReadOnlySearch, isReadOnlyCopy } = this.props;
        const patchboardOptions = this.getPatchboardOptions(patchCables);
        const cableNoOptions = this.getCableNoOptions(patchCables, selectedPatchboardId, isRequiredAllChoice);
        const selectedNo = this.getSelectedPatchNo(selectedPatchNo, isRequiredAllChoice);
        return (
            <FormGroup validationState={validationState}>
                <div className={className}>
                    <div className='garmit-input-item'>
                        <SelectSearchForm 
                            value={selectedPatchboardId}
                            options={patchboardOptions}
                            isReadOnly={isReadOnly}
                            isRequired
                            onChange={(value) => this.handleChangePatchborad(value, patchCables)}
                        />
                    </div>
                    <div className='garmit-input-item'>
                        <SelectSearchForm 
                            value={selectedNo}
                            options={cableNoOptions}
                            isReadOnly={isReadOnly}
                            isRequired
                            onChange={(value) => this.handleChangePatchNo(value)}
                        />
                    </div>
                    {(claerButton||searchButton||copyButton)&&
                        <div className="garmit-input-item va-t pa-r-0" >
                            <ButtonToolbar>
                                {claerButton&&
                                    <ClearCircleButton classNameSpan="ml-05" disabled={isReadOnly||isReadOnlyClear} onClick={() => this.handleClear() } />
                                }
                                {searchButton&&
                                    <SearchButton disabled={isReadOnly||isReadOnlySearch} onClick={() => this.handleSearch() } />
                                }
                                {copyButton&&
                                    <CopyButton disabled={isReadOnly||isReadOnlyCopy} onClick={() => this.handleCopy() } />
                                }
                            </ButtonToolbar>
                        </div>

                    }
                    {helpText&&
                        <HelpBlock>{helpText}</HelpBlock>
                    }
                </div>
            </FormGroup>
        );
    }

    //#region イベント

    /**
     * クリアボタンクリックイベント
     */
     handleClear() {
        if (this.props.onClear) {
            this.props.onClear();
        }
    }

    /**
     * 検索ボタンクリックイベント
     */
    handleSearch() {
        if (this.props.onSearch) {
            this.props.onSearch();
        }
    }

    /**
     * コピーボタンクリックイベント
     */
    handleCopy() {
        if (this.props.onCopy) {
            this.props.onCopy();
        }
    }

    /**
     * 配線盤変更イベント
     * @param {number} patchboardId 配線盤ID
     * @param {array} patchCables 線番一覧
     */
    handleChangePatchborad(patchboardId, patchCables) {
        const patchCable = this.getPatchCable(patchboardId, patchCables);
        if (this.props.onChangePatchborad) {
            this.props.onChangePatchborad(patchboardId, patchCable && patchCable.patchboardName)
        }
    }

    /**
     * 線番変更イベント
     * @param {number} no 線番番号
     */
    handleChangePatchNo(no) {
        if (this.props.onChangePatchNo) {
            let updateNo = (no !== PATCHCABLE_NO_ALL) ? no : null;
            this.props.onChangePatchNo(updateNo);
        }
    }

    //#endregion
    
    //#region options作成

    /**
     * 配線盤の選択肢を取得する
     * @param {array} patchCables 線番一覧
     * @returns 
     */
    getPatchboardOptions(patchCables) {
        var options = [];
        if (patchCables) {
            options = patchCables.map((patchCable) => { return { value: patchCable.patchboardId, name: patchCable.patchboardName }; });
        }
        return options;        
    }

    /**
     * 線番の選択肢を取得する
     * @param {array} patchCables 線番一覧
     * @param {object} patchboardId 配線盤ID
     * @param {boolean} isRequiredAllChoice 「すべて」の線番選択肢が必要か
     * @returns 
     */
    getCableNoOptions(patchCables, patchboardId, isRequiredAllChoice) {
        const patchboard = this.getPatchCable(patchboardId, patchCables);
        var options = [];
        if (patchCables && patchboard) {
            options = patchboard.cableNos.map((cableNo) => { 
                return { value: cableNo.no, name: makePatchCableNoString(cableNo.no), notSearched: false }; 
            });
            isRequiredAllChoice && options.unshift({ value: PATCHCABLE_NO_ALL, name: '(すべて)', notSearched: true });    //最初に「すべて」を追加する
        }
        return options;
    }

    //#endregion

    //#region その他

    /**
     * 線番情報を取得する
     * @param {number} targetPatchboardId 対象の配線盤ID
     * @param {array} patchCables 線番一覧
     * @returns 
     */
    getPatchCable(targetPatchboardId, patchCables) {
        return patchCables.find((patchCable) => patchCable.patchboardId === targetPatchboardId)
    }

    /**
     * 選択中の線番を取得する
     * @param {*} no 線番
     * @param {boolean} isRequiredAllChoice 「すべて」の線番選択肢が必要か
     */
    getSelectedPatchNo (no, isRequiredAllChoice) {
        var patchNo = no;
        if (isRequiredAllChoice && patchNo === null) {
            patchNo = PATCHCABLE_NO_ALL;
        }
        return patchNo;
    }

    //#endregion
}

PatchCableSelectForm.propTypes = {
    className: PropTypes.string, 
    patchCables: PropTypes.array, 
    selectedPatchboardId: PropTypes.number, 
    selectedPatchNo: PropTypes.number, 
    claerButton: PropTypes.bool, 
    searchButton: PropTypes.bool, 
    validationState: PropTypes.string, 
    helpText: PropTypes.string, 
    isReadOnly: PropTypes.bool, 
    isReadOnlyClear: PropTypes.bool, 
    isReadOnlySearch: PropTypes.bool,
    isRequiredAllChoice: PropTypes.bool,
    onClear: PropTypes.func,
    onSearch: PropTypes.func,
    onChangePatchborad: PropTypes.func,
    onChangePatchNo: PropTypes.func
}

const ClearCircleButton = (props) => {
    const overlay = <Tooltip >クリア</Tooltip>
    return (
        <OverlayTrigger placement="bottom" overlay={overlay}>
            <span className={classNames('patchcable-clear-button-span', props.classNameSpan)}>
                <Button {...props} isCircle bsStyle="lightgray" >
                    <Icon className="fal fa-eraser" />
                </Button>
            </span>
        </OverlayTrigger>
    );
};
