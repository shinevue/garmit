/**
 * @license Copyright 2018 DENSO Solutions
 * 
 * メインサイドバー（メニューバー）
 * 
 * 画面のコンテナとして。Reduxに依存したコードを記述します。
 * 画面のロジックはここに記述します。（適宜ファイル分割は行うこと）
 * 
 */
'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { setMenuInfo } from './actions.js';
import ExpandedMenu from 'MainSidebar/ExpandedMenu';
import MenuNavigation from 'MainSidebar/MenuNavigation';
import UserStateMenu from 'MainSidebar/UserStateMenu';
import { sendData, EnumHttpMethod } from 'http-request';
import { compareAscending } from 'sortCompare';

const EXPANDED_MENU_ID = 1;

/**
 * MainSidebarPanelのコンポーネント
 */
class MainSidebarPanel extends Component {

    /**
     * コンストラクタ
     */
    constructor(){
        super();
        this.state = { networkError: false }
    }

    /**
     * 最初のレンダリング時にクライアントに一度だけ呼び出されます。
     * Componentがレンダリングされた直後に呼び出されるメソッドです。
     * ここでsetStateを行うと、renderがもう一度呼び出されるためあまり行わないほうがよいです。
     */
    componentDidMount() {
        this.loadInfo();
    }

    /**
     * 再レンダリングされた直後に呼び出されます。
     */
    componentDidUpdate(){
        garmitFrame.activateMenuHoverAction();
    }

    /**
     * 画面の初期データを非同期で読み込む
     */
    loadInfo () {
        sendData(EnumHttpMethod.get, '/api/menu', null, (info, networkError) => {
            this.props.setMenuInfo(info);
            this.setState({ networkError });
        });
    }
    
    /**
     * render
     */
    render() {
        const { loginUser, menus } = this.props.menuInfo;
        const { networkError } = this.state;
        const expandedMenu = menus.find((menu) => menu.menuId === EXPANDED_MENU_ID);
        const navMenus = menus.filter((menu) => menu.menuId !== EXPANDED_MENU_ID)
                              .sort((current, next) => compareAscending(current.dispIndex, next.dispIndex));

        return (
            <div className="main-sidebar__content">
                {expandedMenu&&<ExpandedMenu menu={expandedMenu} />}
                {navMenus&&<MenuNavigation menus={navMenus} />}
                {loginUser&&<UserStateMenu user={loginUser} networkError/>}
            </div>
        );
    }
}

// Which props do we want to inject, given the global state?
// Note: use https://github.com/faassen/reselect for better performance.

/**
 * storeからstateを受け取り、propsに入れ込みます。
 */
const mapStateToProps = (state) => {
    return {
        menuInfo: state.menuInfo
    };
};

/**
 * 画面更新のアクションを設定します。
 * storeからActionを受け取り、propsに入れ込みます。
 */
const mapDispatchToProps = (dispatch) => {
    return {
        setMenuInfo:(info) => dispatch(setMenuInfo(info))
    };
};

// Wrap the component to inject dispatch and state into it
/**
 * mapStateToProps, mapDispatchToPropsをReduxと連携させる
 */
export default connect(mapStateToProps, mapDispatchToProps)(MainSidebarPanel);

 