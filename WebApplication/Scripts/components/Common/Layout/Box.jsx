/**
 * @license Copyright 2018 DENSO
 * 
 * ボックス Reactコンポーネント
 * 
 * <Box clssName='mr-1' boxStyle='info' isSolid={false} isLoading={false} isCollapsible={true} defaultClose={false} isSearch={false} >
 *  <Box.Header>
 *      <Box.Title>...title</Box.Title>
 *  </Box.Header>
 *  <Box.Body>...</Box.Body>
 *  <Box.Footer></Box.Footer>
 * </Box>
 *  
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import BoxHeader from './BoxHeader';
import BoxBody from './BoxBody';
import BoxFooter from './BoxFooter';
import BoxTitle from './BoxTitle';
import BoxTools from './BoxTools';

/**
 * ボックス
 * <Box clssName={} boxStyle={} isSolid={} isLoading={}></Box>
 * @param {string} className クラス
 * @param  {*} boxStyle ボックスのスタイル（default, primary, info, warning, success, danger）
 * @param {boolean} isSolid ボックスヘッダを塗りつぶすかどうか
 * @param {boolean} isLoading ロード中かどうか
 * @param {boolean} defaultClose デフォルトでボックスを閉じるかどうか
 * @param {boolean} isSearch 検索条件のボックスかどうか
 * @param {boolean} isCollapsible 折りたためるかどうか
 */
export default class Box extends Component {

    /**
     * render
     */
    render() {
        const { boxStyle, isSolid, isLoading, className, defaultClose, isSearch, isCollapsible } = this.props;
        const classes = this.makeClassName(boxStyle, isSolid, isCollapsible, defaultClose, isSearch);
        
        //ロード中表示
        var timer = this.makeTimer(isLoading);
        
        return (
            <div className={classNames(className, classes)}>
                {this.props.children}
                {timer}
            </div>
        );
    }

    /**
     * クラスを作成する
     * @param {*} boxStyle ボックスのスタイル（default, primary, info, warning, success, danger）
     * @param {boolean} isSolid ボックスヘッダを塗りつぶすかどうか
     * @param {boolean} isCollapsible 折りたためるかどうか
     * @param {boolean} defaultClose ボックスを閉じるかどうか
     * @param {boolean} isSearch 検索条件ボックスかどうか
     * @returns {string} 作成したクラス
     */
    makeClassName(boxStyle, isSolid, isCollapsible, defaultClose, isSearch){
        const classes = {
            box: true,
            'box-collapsible': isCollapsible
        };

        if (boxStyle) {
            classes[`box-${boxStyle}`] = true;
        }

        if (!isSearch&&isSolid){
            classes['box-solid'] = true;
        }

        if (defaultClose) {
            classes['collapsed-box'] = true
        }

        if (isSearch) {
            classes['box-search'] = true;
        }

        return classes;
    }

    /**
     * タイマーを作成する
     * @param {boolean} isLoading ロード中かどうか 
     * @returns {string} タイマー
     */
    makeTimer(isLoading){
        var timer = "";
        if (isLoading) {
            timer = <div className="overlay"><i className="fa fa-sync-alt fa-spin"></i></div>;
        }
        return timer;
    }
}

Box.propTypes = {
    className: PropTypes.string,
    boxStyle: PropTypes.oneOf(['default', 'primary', 'success', 'warning', 'danger']),
    isSolid: PropTypes.bool,
    isLoading: PropTypes.bool,
    defaultClose : PropTypes.bool,
    isSearch: PropTypes.bool,
    isCollapsible: PropTypes.bool
};

Box.defaultProps = {
    className: '',
    boxStyle: 'default',
    isSolid: true,
    isLoading: false,
    defaultClose : false,
    isSearch: false,
    isCollapsible: true
}

Box.Header = BoxHeader;
Box.Body = BoxBody;
Box.Footer = BoxFooter;
Box.Title = BoxTitle;
Box.Tools = BoxTools;
