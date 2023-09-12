/**
 * @license Copyright 2022 DENSO
 * 
 * RelConnectLabelForm Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import LabelForm from 'Common/Form/LabelForm';
import { makePatchCableName } from 'lineUtility';
import { hasPatchCableSequence, START_SEQ_NO_IDF_PATCHCABLE } from 'projectLineUtility';

/**
 * 中継線番ラベルフォーム
 * @param {array} patchCableSequences 回線線番情報（PatchCableSequence型)
 * @param {string} className クラス名
 * @param {string} addLabelText ラベルに追記する文字列
 */
export default class RelConnectLabelForm extends Component {
    
    /**
     * render
     */
    render() {
        const { patchCableSequences, className, addLabelText } = this.props;
        const addText = addLabelText || '';
        return (
            <LabelForm className={className} label={'中継線番' + addText} value={this.makeRelConnectsName(patchCableSequences)} />
        );
    }

    /**
     * 中継線番名称を作成する
     * @param {array} patchCableSequences 中継線番一覧
     */
     makeRelConnectsName(patchCableSequences) {
        var name = '';
        if (patchCableSequences && patchCableSequences.length > 0) {
            patchCableSequences.forEach((sequence) => {
                if (hasPatchCableSequence(sequence)) {
                    if (sequence.seqNo > START_SEQ_NO_IDF_PATCHCABLE) {
                        name += ' - ';
                    }
                    name += '(' + (sequence.seqNo - 1) + ') ' + this.getPatchCableName(sequence);
                }                
            })
        }
        return name;
    }
    
    /**
     * 線番名称を取得する
     * @param {object} patchCableSequence 回線線番情報
     */
    getPatchCableName(patchCableSequence) {
        const { patchboardName, patchCableNo } = patchCableSequence;
        return makePatchCableName(patchboardName, patchCableNo.no);
    }

}