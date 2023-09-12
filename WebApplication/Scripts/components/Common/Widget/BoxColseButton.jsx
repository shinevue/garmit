/**
 * Copyright 2017 DENSO Solutions
 * 
 * ボックスの閉じるボタン Reactコンポーネント
 * ボックスヘッダのboxToolsに指定する
 * 
 */
'use strict';

import React, { Component } from 'react';
import { Button } from 'react-bootstrap';
import Icon from '../Widget/Icon';

/**
 * ボックスの閉じるボタン
 * <BoxColseButton ></BoxColseButton>
 */
export default class BoxColseButton extends Component {

    /**
     * render
     */
    render() {
        return (
            <Button className='btn-box-tool' bsStyle='' data-widget='collapse' ><Icon className='fa fa-minus' /></Button>
        );
    }


}
