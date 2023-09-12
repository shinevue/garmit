/**
 * @license Copyright 2018 DENSO
 * 
 * RackTableHeader Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import LocationBreadcrumb from 'Assets/LocationBreadcrumb';
import RackQuickLaunch from './RackQuickLaunch';
import SwichPlaneButton from './SwichPlaneButton';

/**
 * ラック搭載図のヘッダーコンポーネント
 * @param {string} rackName ラック名称
 * @param {array} locationList ロケーションリスト
 * @param {array} links リンク情報リスト
 * @param {boolean} isFront 前面か背面か
 * @param {boolean} isRackView ラック搭載図があるかどうか
 * @param {boolean} showQuickLauncher クイックランチャを表示するかどうか
 * @param {boolean} showLocation ロケーションを表示するかどうか
 * @param {boolean} isReadOnly 読み取り専用かどうか
 * @param {function} onFlipPlane 前面背面を反転させる
 * @param {boolean} isPopout ポップアウトで表示するか
 */
export default class RackTableHeader extends Component {
    
    /**
     * render
     */
    render() {
        const { rackName, locationList, links, isFront, isRackView, showQuickLauncher, showLocation, isReadOnly, toolipContainer, isPopout } = this.props;
        return (
            <div class="rack-header">
                <span class="rack-name">{rackName}</span>
                <div class="rack-tools">
                    {isRackView&&
                        <SwichPlaneButton 
                            isFront={isFront} 
                            isPopout={isPopout}
                            onChange={(isFront) => this.handlePlaneChanged(isFront)} 
                        />}
                    {showQuickLauncher&&
                        <RackQuickLaunch 
                            container={toolipContainer}
                            isReadOnly={isReadOnly} 
                            links={links} 
                            specifyContainer={true}
                            onButtonEventTrigger={() => this.onButtonEventTrigger()}
                        />}
                </div>
                {showLocation&&locationList&&locationList.length > 0&&
                    <LocationBreadcrumb className="location-path" locationList={locationList} />
                }
            </div>
        );       
    }

    /**
     * 前面背面変更イベント
     * @param {boolean} isFront 前面か背面か 
     */
    handlePlaneChanged(isFront) {
        if (this.props.onFlipPlane) {
            this.props.onFlipPlane(isFront);
        }
    }

    /**
     * クイックランチャーを表示するボタンのイベント発生をお知らせする
     */
    onButtonEventTrigger() {
        if (this.props.onButtonEventTrigger) {
            this.props.onButtonEventTrigger();
        }
    }
    
}

RackTableHeader.propTypes = {
    rackName: PropTypes.string.isRequired,
    locationList: PropTypes.arrayOf({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired
    }),
    links: PropTypes.arrayOf(PropTypes.shape({
        title: PropTypes.string.isRequired,
        url: PropTypes.string.isRequired
    })),
    isFront: PropTypes.bool,
    isRackView: PropTypes.bool,
    isReadOnly: PropTypes.bool,
    showQuickLauncher: PropTypes.bool,
    showLocation: PropTypes.bool,
    onFlipPlane: PropTypes.func,
    isPopout: PropTypes.bool
}