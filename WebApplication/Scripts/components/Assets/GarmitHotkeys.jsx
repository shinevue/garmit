/**
 * @license Copyright 2022 DENSO
 * 
 * GarmitHotkeys Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import Hotkeys from 'react-hot-keys';
import { HOT_KEYS } from 'constant';

const HOT_KEYS_OPTIONS = [
    { key: HOT_KEYS.add, funcName: "onAdd" },                           //新規登録
    { key: HOT_KEYS.search, funcName: "onSearch" },                     //検索
    { key: HOT_KEYS.clearCond, funcName: "onClearCond" },               //検索条件クリア
    { key: HOT_KEYS.edit, funcName: "onEdit" },                         //（一括）編集
    { key: HOT_KEYS.delete, funcName: "onDelete" },                     //（一括）削除
    { key: HOT_KEYS.upload, funcName: "onUpload" },                     //（一括）アップロード
    { key: HOT_KEYS.confirm, funcName: "onConfirm" },                   //（一括）確認
    { key: HOT_KEYS.outputReport, funcName: "onOutputReport" },         //レポート出力
    { key: HOT_KEYS.save, funcName: "onSave" },                         //保存
    { key: HOT_KEYS.update, funcName: "onUpdate" }                      //手動更新
]

/**
 * ショートカットコンポーネント（各イベントのfunctionは上記の定数を確認）
 * @param {boolean} disabled ショートカットを無効にするかどうか
 */
export default class GarmitHotkeys extends Component {
    
    /**
     * render
     */
    render() {
        const { children, disabled }  = this.props;
        const keyName = HOT_KEYS_OPTIONS.map((k) => k.key).join(",");
        return (
            <Hotkeys
                keyName={keyName}
                filter={(event) => {
                    let target = event.target || event.srcElement;
                    let tagType = target.type;
                    let tagName = target.tagName;
                    if (tagType == 'checkbox') {
                        return true;
                    } else if (tagName == 'INPUT' || tagName == 'SELECT' || tagName == 'TEXTAREA') {
                        return false;
                    }
                    return true;
                }}
                onKeyDown={(keyName) => this.handleKeyDown(keyName)}
                disabled={disabled}
            >
                {children}
            </Hotkeys>
        );
    }

    /**
     * 
     * @param {string} keyName キー名
     */
    handleKeyDown(keyName) {
        const hotkey = HOT_KEYS_OPTIONS.find((k) => k.key === keyName);
        if (hotkey && this.props[hotkey.funcName]) {
            this.props[hotkey.funcName]();
        }
    }
}