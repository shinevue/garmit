/**
 * @license Copyright 2017 DENSO
 * 
 * ColorPicker Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

/**
 * カラーピッカーコンポーネント
 * @param {string} color 色（hex値で指定）
 * @param {boolean} isReadOnly 読取専用かどうか
 * @param {function} onChange 色が変更したときに呼び出されます
 */
export default class ColorPicker extends Component {
    
    //MEMO 任意のstaticメソッドはここに追加します。

    /**
     * コンストラクタ
     */
    constructor(props) {
        super(props);
        //TODO：stateの初期化処理などをここに記述します
        this.state = { message: 'Hello' };
    }

    /**
     * 最初のレンダリング時にクライアントに一度だけ呼び出されます。
     * Componentがレンダリングされた直後に呼び出されるメソッドです。
     */
    componentDidMount() {
        $(this.refs.myColorpicker).spectrum({
            showInput: true,                    // コードの入力欄を表示する
            showPalette: true,                  // パレットを表示する
            showPaletteOnly: true,              // true の場合、パレットのみの表示にする
            togglePaletteOnly: true,            // true の場合、パレット以外の部分はボタンで表示切替する
            togglePaletteMoreText: '>',         // togglePaletteOnlyがtrueの場合のボタン名(開く)
            togglePaletteLessText: '<',         // togglePaletteOnlyがtrueの場合のボタン名(閉じる)
            showSelectionPalette: true,         // ユーザーが前に選択した色をパレットに表示する
            hideAfterPaletteSelect: true,       // true の場合、パレットを選んだ時点でピッカーを閉じる
            maxPaletteSize: 10,                 // 選択した色を記憶する数の上限
            showInitial: true,                  // 初期の色と選択した色を見比べるエリアを表示する
            allowEmpty: false,                  // 「指定なし」を許可する
            chooseText: '選択',                  // 選択ボタンのテキスト
            cancelText: 'キャンセル',            // キャンセルボタンのテキスト
            preferredFormat: 'name',            // カラーコード形式（hexなども可能）
            disabled: this.props.isReadOnly,    // trueの場合、ピッカーを無効にする
            palette: [
                ['black', 'gray', 'darkgray' , 'lightgray', 'white'],
                ['pink', 'red', 'orange', 'yellow', 'lime', 'green', 'cyan', 'blue', 'purple']
            ],
            change: (color) => {
                this.handleChanged(color);
            }
        });

        this.setColor(this.props.color);
    }

    /**
     * コンポーネントが更新された時に呼び出します。
     * @param {*} prevProps 更新前のprops
     * @param {*} prevState 更新前のstate
     */
    componentDidUpdate(prevProps, prevState){
        if (this.props.color !== prevProps.color) {
            this.setColor(this.props.color);
        }
    }

    /**
     * 新しいpropsを受け取るときに呼び出されます。
     * propsによってstateを変更する場合はここでthis.setState()を行います。このsetStateでrenderを呼ぶことはありません。
     * @param {*} nextProps 新しいprops
     */
    componentWillReceiveProps( nextProps ){
        if (nextProps.isReadOnly) {
            this.disableColorPicker();
        }
        else {
            this.enableColorPicker();
        }
    }

    /**
     * カラーピッカーを読取専用にする
     */
    disableColorPicker() {
        $(this.refs.myColorpicker).spectrum('disable');
    }

    /**
     * カラーピッカーを読取可能とする
     */
    enableColorPicker() {
        $(this.refs.myColorpicker).spectrum('enable');
    }
    
    /**
     * カラーを設定する
     * @param {*} color 設定する色
     */
    setColor(color) {
        $(this.refs.myColorpicker).spectrum('set', color)
    }

    /**
     * 色変更（確定時）イベント
     * @param {*} color 変更後の色
     */
    handleChanged(color){
        const hexValue = color.toHexString();
        if ( this.props.onChange ) {
            this.props.onChange(hexValue);
        }
    }

    /**
     * render
     */
    render() {
        return (
            <input ref='myColorpicker' type="text" />
        );
    }
}

ColorPicker.propTypes = {
    color: PropTypes.string.isRequired,                 //hexの色を指定
    onChange: PropTypes.func,
    isReadOnly: PropTypes.bool
}