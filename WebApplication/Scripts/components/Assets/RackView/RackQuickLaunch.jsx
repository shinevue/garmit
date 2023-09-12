/**
 * @license Copyright 2018 DENSO
 * 
 * ラック搭載図に表示するクイックランチャーコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import QuickLauncher from 'Assets/QuickLauncher';

/**
 * ラック搭載図に表示するクイックランチャーコンポーネント
 * @param {boolean} isReadOnly 読み取り専用かどうか
 * @param {boolean} specifyContainer ツールチップのコンテナを指定するかどうか
 * @param {object} container ツールチップのコンテナ
 * @param {function} onButtonEventTrigger ツールチップを表示するボタンのイベントが発生したときに呼び出す（ポップアップ用）
 * @param {array} links リンクするリスト
 */
export default class RackQuickLaunch extends Component {
    
    render() {
        const { isReadOnly, links, container, specifyContainer, className } = this.props;
        return (links&&links.length>0&&
                <span className={classNames("rack-quick-launcher", className)}>
                    <QuickLauncher className="racktable-quick-launcher"
                                　 buttonClass="rack-btn"
                                   buttonBsStyle={null} isReadOnly={isReadOnly}
                                   container={container}
                                   specifyContainer={specifyContainer}
                                   pages={[
                                   { links: links }
                                   ]}
                                   onButtonEventTrigger={() => this.onButtonEventTrigger()}
                    />
                </span>
                ); 
    }
    
    /**
     * クイックランチャーを表示するボタンのイベント発生をお知らせする
     */
    onButtonEventTrigger() {
        if (this.props.specifyContainer && this.props.onButtonEventTrigger) {
            this.props.onButtonEventTrigger();
        }
    }

}

RackQuickLaunch.propTypes = {
    isReadOnly: PropTypes.bool,
    links: PropTypes.arrayOf(PropTypes.shape({
        title: PropTypes.string.isRequired,
        url: PropTypes.string.isRequired
    })),
    specifyContainer: PropTypes.bool,
    container: PropTypes.object,
    onButtonEventTrigger: PropTypes.func
}