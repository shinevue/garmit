/**
 * @license Copyright 2022 DENSO
 * 
 * FixSearchTypeRow Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import InputForm from 'Common/Form/InputForm';
import PatchCableSelectForm from 'Assets/Form/PatchCableSelectForm';
import TypeSwitch from './TypeSwitch';
import { LINE_FIX_SEARCH_TYPE_OPTIONS } from 'constant';
import { validatePatchboard, validatePatchCableNo } from 'projectLineUtility';
import { VALIDATE_STATE, errorResult } from 'inputCheck';

/**
 * 検索種別コンポーネント（工事種別：修正（仮登録）/修正（残置））
 * @param {number} searchType 検索方法
 * @param {array} patchCables 線番一覧
 * @param {object} selectedPatchCable 選択中の線番情報
 * @param {array} usedPatchCables 使用中の回線一覧
 * @param {boolean} isReadOnly 読み取り専用かどうか
 * @param {boolean} isReadOnlySearch 検索ボタンが読み取り専用かどうか
 * @param {function} onChangeType 検索方法スイッチ値変更時に呼び出す
 * @param {function} onChange 配線盤/線番変更時に呼び出す
 * @param {function} onSearch 検索ボタンクリック時に呼び出す
 */
export default class FixSearchTypeRow extends Component {
    
    /**
     * コンストラクタ
     */
    constructor(props) {
        super(props);
        this.state = { 
            selectedPatchCable: props.selectedPatchCable && _.cloneDeep(props.selectedPatchCable),
            validate: this.validate(props.selectedPatchCable)
        };
    }

    /**
     * 新しいpropsを受け取るときに呼び出されます。
     * propsによってstateを変更する場合はここでthis.setState()を行います。このsetStateでrenderを呼ぶことはありません。
     * @param {*} nextProps 新しいprops
     */
    componentWillReceiveProps( nextProps ){
        if (JSON.stringify(nextProps.selectedPatchCable) !== JSON.stringify(this.props.selectedPatchCable)) {
            this.setState({
                selectedPatchCable: nextProps.selectedPatchCable && _.cloneDeep(nextProps.selectedPatchCable),
                validate: this.validate(nextProps.selectedPatchCable)
            })
        }
    }

    /**
     * render
     */
    render() {
        const { searchType, patchCables, isReadOnly, isReadOnlySearch } = this.props;
        const { validate, selectedPatchCable } = this.state;
        return (
            <InputForm.Row>
                <InputForm.Col label="検索" columnCount={1} isRequired>
                    <TypeSwitch
                        type={searchType}
                        name="fixSearchType"
                        isReadOnly={isReadOnly}
                        options={LINE_FIX_SEARCH_TYPE_OPTIONS} 
                        onChange={(value) => this.onChangeType(value)} 
                    />
                    <PatchCableSelectForm searchButton
                        className="mt-05"
                        patchCables={patchCables}
                        selectedPatchboardId={selectedPatchCable&&selectedPatchCable.patchboardId}
                        selectedPatchNo={selectedPatchCable&&selectedPatchCable.patchCableNo&&selectedPatchCable.patchCableNo.no}
                        isReadOnly={isReadOnly}
                        isReadOnlySearch={isReadOnlySearch || this.invalid(validate)}
                        validationState={validate&&validate.state}
                        helpText={validate&&validate.helpText}
                        onChangePatchborad={(patchboardId, patchboardName) => this.changePatchborad(patchboardId, patchboardName)}
                        onChangePatchNo={(patchCableNo) => this.changePatchNo(patchCableNo)}
                        onSearch={() => this.onSearch(selectedPatchCable)}
                    />
                </InputForm.Col>
            </InputForm.Row>
        );
    }

    /**
     * 配線盤選択の変更
     * @param {number} patchboardId 配線盤ID
     * @param {string} patchboardName 配線盤名
     */
    changePatchborad(patchboardId, patchboardName) {
        let update = {
            patchboardId: patchboardId,
            patchboardName: patchboardName,
            patchCableNo: null
        }
        this.setState({
            selectedPatchCable: update,
            validate: this.validate(update)
        }, this.onChange());
    }

    /**
     * 回線線番選択の変更
     * @param {number} patchCableNo 回線線番
     */
    changePatchNo(patchCableNo) {
        let update = _.cloneDeep(this.state.selectedPatchCable);
        update.patchCableNo = { no: patchCableNo }
        this.setState({
            selectedPatchCable: update,
            validate: this.validate(update)
        }, this.onChange());
    }

    /**
     * 入力検証
     * @param {object} sequence 回線線番情報
     */
    validate(sequence) {
        const { usedPatchCables } = this.props;
        var validate = validatePatchboard(sequence);
        if (validate.state === VALIDATE_STATE.success) {
            validate = validatePatchCableNo(sequence);
        }
        if (validate.state === VALIDATE_STATE.success && sequence.patchCableNo) {
            if (usedPatchCables && usedPatchCables.some((cable) =>  cable.patchboardId === sequence.patchboardId && cable.patchCableNo && cable.patchCableNo.no === sequence.patchCableNo.no)) {
                validate = errorResult('他回線で使用中の線番です。');
            }
        }
        validate = _.cloneDeep(validate);
        return validate;
    }

    /**
     * 検索ボタンが無効かどうか
     * @param {string} validate 入力検証
     * @returns 
     */
    invalid(validate) {
        return validate.state !== VALIDATE_STATE.success
    }

    /**
     * 検索ボタンクリック
     * @param {object} sequence 回線線番情報
     */
    onSearch(sequence) {
        if (this.props.onSearch) {
            this.props.onSearch(sequence);
        }
    }

    /**
     * 検索方法変更
     * @param {*} value 変更後の種別
     */
    onChangeType(value) {
        if (this.props.onChangeType) {
            this.props.onChangeType(value);
        }
    }

    /**
     * 配線盤/線番選択変更
     */
    onChange() {
        if (this.props.onChange) {
            this.props.onChange();
        }
    }
}