/**
 * @license Copyright 2022 DENSO
 * 
 * IdfConnectLabelForm Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PatchCableLabelForm from 'Project/Edit/Form/PatchCableLabelForm';
import RelConnectLabelForm from 'Project/Edit/Form/RelConnectLabelForm';
import { getRelPatchCableSequences, getIdfPatchCableSequence } from 'projectLineUtility'

/**
 * IDF線番＋中継線番ラベルフォーム
 * @param {object} selectedPatchCable 選択中のIDF線番（PatchCableSequence型)
 * @param {array} relPatchCables 中継線番一覧（PatchCableSequence型)
 * @param {boolean} copyButton コピーボタンを表示するかどうか
 * @param {boolean} isReadOnly 読み取り専用かどうか
 * @param {string} addIdfLabelText IDF線番ラベルに追記する文字列
 * @param {function} onCopy コピーボタンクリック時に呼び出す
 */
export default class IdfConnectLabelForm extends Component {
        
    /**
     * render
     */
    render() {
        const { isReadOnly, copyButton, addIdfLabelText, patchCableSequences } = this.props;
        const addText = addIdfLabelText || '';
        const idfSequence = getIdfPatchCableSequence(patchCableSequences);
        const relSequences = getRelPatchCableSequences(patchCableSequences);
        return (
            <div>
                <PatchCableLabelForm
                    label={'IDF線番' + addText}
                    isReadOnly={isReadOnly}
                    copyButton={copyButton}
                    patchCableSequence={idfSequence}
                    onCopy={(patchboardName, no) => this.onCopy(patchboardName, no)}
                />
                {relSequences && relSequences.length > 0 &&                    
                    <RelConnectLabelForm
                        patchCableSequences={relSequences}
                        addLabelText={addText}
                    />
                }
            </div>
        );
    }

    /**
     * コピーイベントを呼び出す
     * @param {string} patchboardName 配線盤名
     * @param {number} no 線番番号
     */
    onCopy(patchboardName, no) {
        if (this.props.onCopy) {
            this.props.onCopy(patchboardName, no);
        }
    }
}