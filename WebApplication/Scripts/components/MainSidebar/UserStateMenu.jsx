/**
 * @license Copyright 2018 DENSO
 * 
 * UserStateMenu Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import FunctionListItem from './FunctionListItem';
import HelpMenu from './HelpMenu';
import PasswordChangeModal from 'Assets/Modal/PasswordChangeModal';

/**
 * ユーザーメニューコンポーネント
 * @param {object} user ユーザー情報
 */
export default class UserStateMenu extends Component {

    /**
     * ログアウトメニュー
     */
    static get LOGOUT_MENU() {
        return { functionId: 100001, name: 'ログアウト', url:'/Logout', iconClass: 'icon-garmit-logout' };
    }

    /**
     * コンストラクタ
     */
    constructor(props) {
        super(props);
        this.state = {
            showModal: false
        };
    }

    /**
     * render
     */
    render() {
        const { user } = this.props;
        const { showModal } = this.state;
        const userMenu = this.makeUserMenu();
        return (
            <div className="main-sidebar__state">
                <div className="main-sidebar__state-inner">
                    <ul className="main-sidebar-user">
                        {userMenu&&
                            <UserMenuListItem name={userMenu.name} 
                                          iconClass={userMenu.iconClass} 
                                          function={userMenu.function} 
                                          functions={userMenu.functions} 
                            />
                        }
                    </ul>
                    <ul className="main-sidebar-logout">
                        <FunctionListItem function={UserStateMenu.LOGOUT_MENU} />
                    </ul>
                    <HelpMenu />
                </div>
                <PasswordChangeModal show={showModal} user={user} onHide={() => this.changePasswordModalShow()} />
            </div>
        );
    }

    /**
     * ユーザーメニューを作成する
     */
    makeUserMenu() {
        const { user, networkError } = this.props;
        return {
            name: user.userName ? user.userName : ( networkError ? '(通信エラー発生...)' :'(読み込み中...)'),
            iconClass: 'icon-garmit-user',
            function: null,
            functions: this.makeUserFunctions()
        };
    }

    /**
     * ユーザーメニューの機能を作成する
     */
    makeUserFunctions () {
        return [ 
            { functionId: 100000, name: 'パスワード変更', url:'', iconClass: '', onClick: () => this.changePasswordModalShow() },
        ];
    }

    /**
     * パスワードモーダルの表示/非表示を切り替える ※今後実装予定
     */
    changePasswordModalShow() {
        if (!this.state.showModal) {
            garmitFrame.mainBarClose();             //モーダル表示時はメインバーを閉じる
        }
        this.setState({ showModal: !this.state.showModal });
        
    }
}

UserStateMenu.propTypes = {
    user: PropTypes.shape({
        userId: PropTypes.string.isRequired,
        userName: PropTypes.string.isRequired
    })
}

/**
 * ユーザーメニューアイテム
 */
const UserMenuListItem = ({name, iconClass, function: menuFunction, functions}) => {
    const hasFunctions = (functions&&functions.length>0) ? true : false;
    return (
        <li className={hasFunctions?'gnav-parent': ''}>
            <a href={menuFunction&&menuFunction.url?menuFunction.url:'#'} 
               className={classNames('garmit-menu-item', 'garmit-menu-item-user')}>
                <span className={iconClass}>{name}</span>
            </a>
            {hasFunctions&&
                <ul className="gnav-child">
                    {functions.map((func) => 
                        <FunctionListItem key={func.functionId} 
                                          function={func} 
                                          onClick={() => func.onClick&&func.onClick()} />)}
                </ul>
            }
        </li>                  
    );
}