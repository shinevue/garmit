/**
 * @license Copyright 2018 DENSO
 * 
 * UnitQuickLaunch Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import QuickLauncher from 'Assets/QuickLauncher';

/**
 * ラック搭載図の表示ユニット内に表示するクイックランチャーコンポーネント
 * @param {boolean} isReadOnly 読み取り専用かどうか
 * @param {boolean} specifyContainer ツールチップのコンテナを指定するかどうか
 * @param {object} container ツールチップのコンテナ
 * @param {function} onButtonEventTrigger ツールチップを表示するボタンのイベントが発生したときに呼び出す（ポップアップ用）
 * @param {array} units リンクを表示するユニット一覧
 */
export default class UnitQuickLaunch extends Component {

    render() {
        const { units, isReadOnly, container, specifyContainer } = this.props;

        var linkPages = [];
        if (units&&units.length > 0) {
            units.forEach(item => {
                if (item.links&&item.links.length > 0) {
                    linkPages.push(
                        {
                            no: item.unitNo,
                            name: item.name,
                            links : Object.assign([], item.links) 
                        }
                    )
                }
            });
        }

        return (linkPages.length > 0 ?
                    <QuickLauncher className="racktable-quick-launcher"
                                   isReadOnly={isReadOnly} 
                                   pages={linkPages}
                                   container={container}
                                   specifyContainer={specifyContainer}
                                   onButtonEventTrigger={() => this.onButtonEventTrigger()}
                    />
                    :
                    null
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

UnitQuickLaunch.propTypes = {
    isReadOnly: PropTypes.bool,
    units: PropTypes.arrayOf(PropTypes.shape({
        unitId: PropTypes.string.isRequired,
        unitNo: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        type: PropTypes.shape({
            name: PropTypes.string.isRequired
        }),
        position: PropTypes.shape({
            x: PropTypes.number.isRequired,
            y: PropTypes.number.isRequired
        }).isRequired,
        size: PropTypes.shape({
            height: PropTypes.number.isRequired,
            width: PropTypes.number.isRequired
        }).isRequired,
        links: PropTypes.arrayOf(PropTypes.shape({
            title: PropTypes.string.isRequired,
            url: PropTypes.string.isRequired
        }))
    })),
    specifyContainer: PropTypes.bool,
    container: PropTypes.object,
    onButtonEventTrigger: PropTypes.func
}