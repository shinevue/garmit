/**
 * @license Copyright 2022 DENSO
 * 
 * IdfConnectSearchForm Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PatchCableSelectForm from 'Assets/Form/PatchCableSelectForm';
import RelConnectLabelForm from 'Project/Edit/Form/RelConnectLabelForm';
import { hasPatchCableSequence } from 'projectLineUtility';

/**
 * IDF線番選択＋中継線番フォーム（検索）
 * @param {array} patchCables 配線盤一覧（選択肢用）
 * @param {object} selectedPatchCable 選択中のIDF線番（PatchCableSequence型)
 * @param {array} relPatchCables 中継線番一覧（PatchCableSequence型)
 * @param {object} validate 入力検証
 * @param {boolean} searchButton 検索ボタンを表示するかどうか
 * @param {boolean} copyButton コピーボタンを表示するかどうか
 * @param {boolean} isReadOnly 読み取り専用かどうか
 * @param {boolean} isReadOnlySearch 検索ボタンが読み取り専用かどうか
 * @param {boolean} isReadOnlyCopy コピーボタンが読み取り専用かどうか
 * @param {function} onChangePatchborad 配線盤選択時に呼び出す
 * @param {function} onChangePatchNo 線番番号選択時に呼び出す
 * @param {function} onCopy コピーボタンクリック時に呼び出す
 * @param {function} onSearch 検索ボタンクリック時に呼び出す
 */
export default class IdfConnectSearchForm extends Component {
    
    /**
     * render
     */
    render() {
        const { patchCables, selectedPatchCable, relPatchCables, validate,  isReadOnly, isReadOnlySearch, isReadOnlyCopy, copyButton, searchButton } = this.props;
        return (
            <div>
                <label className="mb-05">IDF線番</label>
                <PatchCableSelectForm 
                    className="mb-05"
                    patchCables={patchCables}
                    selectedPatchboardId={selectedPatchCable&&selectedPatchCable.patchboardId}
                    selectedPatchNo={selectedPatchCable&&selectedPatchCable.patchCableNo&&selectedPatchCable.patchCableNo.no}
                    searchButton={searchButton}
                    copyButton={copyButton}
                    isReadOnly={isReadOnly}
                    isReadOnlySearch={isReadOnlySearch}
                    isReadOnlyCopy={isReadOnlyCopy}
                    validationState={validate&&validate.state}
                    helpText={validate&&validate.helpText}
                    onChangePatchborad={(patchboardId, patchboardName) => this.onChangePatchborad(patchboardId, patchboardName)}
                    onChangePatchNo={(patchCableNo) => this.onChangePatchNo(patchCableNo)}
                    onSearch={() => this.onSearch(selectedPatchCable)}
                    onCopy={() => this.onCopy(selectedPatchCable)}
                />
                {relPatchCables && relPatchCables.length > 0 &&                    
                    <RelConnectLabelForm patchCableSequences={relPatchCables} />
                }
            </div>
        );
    }

    /**
     * 配線盤変更
     * @param {number} patchboardId 配線盤ID
     * @param {string} patchboardName 配線盤名称
     */
    onChangePatchborad(patchboardId, patchboardName) {
        if (this.props.onChangePatchborad) {
            this.props.onChangePatchborad(patchboardId, patchboardName);
        }
    }

    /**
     * 線番変更
     * @param {number} no 線番番号
     */
    onChangePatchNo(no) {
        if (this.props.onChangePatchNo) {
            const { patchboardId, patchboardName } = this.props.selectedPatchCable;
            this.props.onChangePatchNo(no, patchboardId, patchboardName);
        }
    }

    /**
     * 検索ボタンクリック
     * @param {object} patchCableSequence 選択中の線番情報
     */
    onSearch(patchCableSequence) {    
        if (this.props.onSearch) {
            this.props.onSearch(patchCableSequence)
        }
    }

    /**
     * コピーボタンクリック
     * @param {object} patchCableSequence 
     */
    onCopy(patchCableSequence) {        
        if (this.props.onCopy && hasPatchCableSequence(patchCableSequence)) {
            const { patchboardName, patchCableNo } = patchCableSequence;
            this.props.onCopy(patchboardName, patchCableNo.no)
        }
    }
}