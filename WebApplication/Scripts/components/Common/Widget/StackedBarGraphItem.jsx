/**
 * @license Copyright 2017 DENSO
 * 
 * StackedBarGraphItem Reactコンポーネント
 * <StackedBarGraphItem name='denso'/>
 *  
 * Reactに関する情報は、 https://reactjs.org/ を参照してください。
 * 
 * Componentのライフサイクルは、下記を参考にしてください。
 * http://qiita.com/kawachi/items/092bfc281f88e3a6e456
 * https://qiita.com/yukika/items/1859743921a10d7e3e6b
 * https://reactjs.org/docs/react-component.html （公式サイト）
 * 
 * React-Bootstrapについては下記を参考にしてください。
 * https://react-bootstrap.github.io/components.html
 * 
 * コーディング規約は、http://qiita.com/koukun/items/e64762e407b8dd5e0247 を参考にしてください。
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ProgressBar } from 'react-bootstrap';

/**
 * 積み上げ式のバーグラフアイテム
 * @param value {number} 値
 * @param label {string} バーに表示するラベル
 * @param max {number} バーの最大値（指定がない場合は100）
 * @param min {number} バーの最小値（指定がない場合は0）
 * @param barStyle {oneOf} バーのスタイル（'success', 'warning', 'danger', 'info'のいずれか）
 */
export default class StackedBarGraphItem extends Component {

    /**
     * render
     */
    render() {
        const { value, barStyle } = this.props;

        return (
            <ProgressBar bsStyle={barStyle} now={value} {...this.props} />
        );
    }

}

StackedBarGraphItem.propTypes = {
    value: PropTypes.number.isRequired,
    max: PropTypes.number,
    min: PropTypes.number,
    label: PropTypes.string,
    barStyle: PropTypes.oneOf(['success', 'warning', 'danger', 'info'])
}