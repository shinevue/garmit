/**
 * Copyright 2017 DENSO Solutions
 * 
 * WaitingMessage Reactコンポーネント
 *  
 */
'use strict';

import React, { Component } from 'react';
import { Modal, Image } from 'react-bootstrap';

export default class WaitingMessage extends Component {

    constructor(props) {
        super(props)
        this.state = {
            
        }
    }

    /**
     * 表示するメッセージを取得
     */
    getMessage() {
        switch (this.props.type) {
            case 'save':
                return '保存しています';

            case 'delete':
                return '削除しています';

            case 'update':
                return '更新しています';

            case 'export':
                return 'エクスポートしています';

            case 'import':
                return 'インポートしています';
            
            case 'lock':
                return '施錠信号を送信中です';

            case 'unlock':
                return '開錠信号を送信中です';

            default:
                return '';
        }
    }

    /**
     * render
     */
    render() {
        const { show } = this.props;
        const message = this.getMessage();

        return (
            <Modal autoFocus={false} show={show} bsSize="sm" style={{ backgroundcolor: 'transparent' }} animation={false} >
                <Modal.Body className="ta-c">
                    {message &&
                        <div className="mb-1">
                            {message}
                        </div>
                    }
                    <Image src="/Content/image/waiting_icon.svg" /> 
                </Modal.Body>
            </Modal>
        )
    }
}

WaitingMessage.propTypes = {
    show: PropTypes.bool.isRequired,
    type: PropTypes.oneOf(['save', 'delete', 'update', 'export', 'import', 'lock', 'unlock'])
}