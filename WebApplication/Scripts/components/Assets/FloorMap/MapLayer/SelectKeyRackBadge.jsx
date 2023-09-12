/**
 * @license Copyright 2019 DENSO
 * 
 * 電気錠ラック選択レイヤ Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

/**
 * コンポーネントを定義します。
 * <ContentHeader></ContentHeader>
 */
export default class CheckObjectBadge extends Component {
    
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
        return (
            <g id="selectKeyRackObjects">
                {checkObjects.map((obj) => {
                    return <SelectKeyRackBadge selectObject={obj} />
                })
                }
            </g>
        );
    }
}

CheckObjectBadge.propTypes = {
    checkObjects: PropTypes.array,    //レイアウトオブジェクトの配列
    show: PropTypes.bool                     //アラーム表示するかどうか
};
