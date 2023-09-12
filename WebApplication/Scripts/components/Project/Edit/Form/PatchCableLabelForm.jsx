/**
 * @license Copyright 2022 DENSO
 * 
 * PatchCableLabelForm Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import { FormGroup, ControlLabel, FormControl } from 'react-bootstrap';
import Icon from 'Common/Widget/Icon';
import Button from 'Common/Widget/Button';
import { makePatchCableName } from 'lineUtility';
import { hasPatchCableSequence } from 'projectLineUtility';

/**
 * 線番ラベルフォーム
 * @param {object} patchCableSequence 回線線番情報（PatchCableSequence型)
 * @param {string} label ラベルに表示する文字列
 * @param {string} className クラス名
 * @param {boolean} copyButton コピーボタンを表示するかどうか
 * @param {boolean} isReadOnly 読み取り専用かどうか
 * @param {function} onCopy コピーボタンクリック時に呼び出す 
 */
export default class PatchCableLabelForm extends Component {
    
    /**
     * render
     */
    render() {
        const { className, label, isReadOnly, copyButton, patchCableSequence } = this.props;
        const patchCableName = this.getPatchCableName(patchCableSequence);
        const text = patchCableName||'(未検索)';
        return (
            <div className={className}>
                <FormGroup className="patchcable-label-form" validationState={!patchCableName&&'error'}>
                    {label&&<ControlLabel >{label}</ControlLabel>}
                    {copyButton ?     
                        <div className='garmit-input-group'>
                            <div className='garmit-input-item'>
                                <FormControl.Static>{text}</FormControl.Static >
                            </div>
                            <div className='garmit-input-item va-t'>
                                <Button className='ml-05' bsStyle="primary" disabled={isReadOnly} onClick={() => this.onCopy(patchCableSequence)} >                                                
                                    <Icon className="fal fa-copy mr-05" />コピー
                                </Button>
                            </div>
                        </div>
                    : 
                        <FormControl.Static>{text}</FormControl.Static >
                    }
                </FormGroup>
            </div>
        );
    }

    /**
     * コピーイベントを呼び出す
     * @param {*} patchCableSequence 
     */
    onCopy(patchCableSequence) {        
        if (this.props.onCopy && hasPatchCableSequence(patchCableSequence)) {
            const { patchboardName, patchCableNo } = patchCableSequence;
            this.props.onCopy(patchboardName, patchCableNo.no)
        }
    }
    
    /**
     * 線番名称を取得する
     * @param {object} patchCableSequence 回線線番情報
     */
    getPatchCableName(patchCableSequence) {
        var patchCableName = '';
        if (hasPatchCableSequence(patchCableSequence)) {
            const { patchboardName, patchCableNo } = patchCableSequence;
            patchCableName = makePatchCableName(patchboardName, patchCableNo.no)
        }
        return patchCableName;
    }

}