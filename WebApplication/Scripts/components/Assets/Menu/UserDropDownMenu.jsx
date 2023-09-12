/**
 * @license Copyright 2017 DENSO
 * 
 * ユーザー情報ドロップダウン Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import { NavDropdown, MenuItem } from 'react-bootstrap';

/**
 * ユーザー情報ドロップダウンコンポーネント
 * @param name ユーザー名称
 */
export default class UserDropDownMenu extends Component {
    
    /**
     * render
     */
    render () {
        const { name, belonging } = this.props;
        return (
            <NavDropdown title={name} >
                <MenuItem eventKey={1}>パスワード変更</MenuItem>
                <MenuItem eventKey={2} href='/Logout'>ログアウト</MenuItem>
            </NavDropdown>
        );
    }
}
