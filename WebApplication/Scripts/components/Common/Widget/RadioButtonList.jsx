/**
 * @license Copyright 2021 DENSO
 * 
 * RadioButtonList Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import { Radio } from 'react-bootstrap';

/**
 * RadioButtonList
 * @param {array} items 選択肢の配列[{key: "...", name: "...", color: "..."}, ...]
 * @param {object} selectedItem 選択中のチェックするkeyの配列["key1", "key2", ...]
 * @param {func} onChange チェック状態変化時に呼ぶ関数
 */
export default class RadioButtonList extends Component {
    
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
     * ここでsetStateを行うと、renderがもう一度呼び出されるためあまり行わないほうがよいです。
     */
    componentDidMount() {
    }

    /**
     * 新しいpropsを受け取るときに呼び出されます。
     * propsによってstateを変更する場合はここでthis.setState()を行います。このsetStateでrenderを呼ぶことはありません。
     * @param {*} nextProps 新しいprops
     */
    componentWillReceiveProps( nextProps ){

    }

    /**
     * Componentがアンマウントされるときに呼び出されます。
     * リソースの開放などを記述します。
     */
    componentWillUnmount() {
    }


    //MEMO onClickSubmit()のようなイベントハンドラをここに記述します。

    //MEMO getSelectReason()のようなrender用のゲッターメソッドはここに記述します。

    //MEMO renderNavigation()のような任意のレンダリングメソッドはここに記述します。


    /**
     * render
     */
    render() {
        const { items, selectedItem, inline, maxHeight } = this.props;        
        return (
            <div>
                {this.makeRadioButtonList(items)}
            </div>
        );
    }

    /**
     * ラジオボタンリストを作成する
     * @param {array} items ラジオボタンItemリスト
     * @returns ラジオボタンリスト
     */
    makeRadioButtonList(items) {
        return items.map((item, index, items) => {
            // let className = "";
            // if (index === 0 && !this.props.useAll) {
            //     className = "mt-0";
            // } else if (index === (items.length - 1)) {
            //     className = "mb-0";
            // }
            const selected = this.props.selectedItem ? (item.key === this.props.selectedItem) : false;
            return (
                <Radio 
                    //className={className}
                    onClick={() => this.handleClick(item.key)}
                    checked={selected}
                    inline={this.props.inline}
                >
                    {item.name}
                </Radio>
            )
        })
    }

    /**
     * ラジオボタンクリック
     * @param {*} key キーワード
     */
    handleClick(key) {
        if (this.props.onChange) {
            this.props.onChange(key);
        }
    }
}