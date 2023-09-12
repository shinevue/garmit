/**
 * Copyright 2017 DENSO Solutions
 * 
 *  電源系統ポップオーバーコンテンツ　Reactコンポーネント
 *
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

/**
 * 電源系統ポップオーバーコンテントオブジェクト
 * <EGroupPopoverContent></EGroupPopoverContent>
 * @param {string} name 分電盤名称
 * @param {number} rating 定格値
 * @param {number} value 計測値
 */
export default class EGroupPopoverContent extends Component {

    constructor(props) {
        super(props);
        this.state = {
        };
    }

    /**
     * コンポーネントをアップデートするかどうか
     */
    shouldComponentUpdate(nextProps, nextState) {
        if (this.props.rating !== nextProps.rating) {
            //定格値が変更された場合
            return true;
        }
        if (this.state.value !== nextState.value) {
            //計測値変更時
            return true;
        }
    }


    /**
     * render
     */
    render() {
        const { rating, value } = this.props;

        return (
            <span>
                <p>定格値：{rating}A</p>
                <p>計測値：{value}</p>
            </span>
        );
    }
}

EGroupPopoverContent.propTypes = {
    rating:PropTypes.number,
    value: PropTypes.number
};

