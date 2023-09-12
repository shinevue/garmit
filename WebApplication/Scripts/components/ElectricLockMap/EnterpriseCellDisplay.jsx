/**
 * @license Copyright 2019 DENSO
 * 
 * 所属 一覧表示用 Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Icon from 'Common/Widget/Icon';
import MessageModal from 'Assets/Modal/MessageModal';

/**
 * 所属一覧表示用コンポーネント
 */
export default class EnterpriseCellDisplay extends Component {
    
    /**
     * コンストラクタ
     */
    constructor(props) {
        super(props);
        this.state = {
            show:false  //所属一覧モーダル表示状態
        };
    }

    /**
     * 所属一覧モーダル表示状態変更イベント
     */
    handleChangeModalState = (state) => {
        this.setState({ show: state });
    }

    /**
     * render
     */
    render() {
        const { enterpriseNames } = this.props;
        const { show } = this.state;

        if (_.size(enterpriseNames) <= 0) {
            return <div />;
        }
        else if (_.size(enterpriseNames) <= 1) {
            return (
                <div>
                    <EnterpriseName enterpriseName={enterpriseNames[0]} />
                </div>
            );
        }
        else {
            return (
                <div>
                    <EnterpriseName enterpriseName={enterpriseNames[0]} />...
                    <Icon
                        className="icon-garmit-detail pull-right hover-icon"
                        onClick={this.handleChangeModalState.bind(this, true)}
                    />
                    <MessageModal
                        bsSize="sm"
                        buttonStyle="message"
                        show={show}
                        title="所属"
                        onCancel={this.handleChangeModalState.bind(this, false)}
                    >
                        <div>
                            {enterpriseNames.map((entName) => {
                                return <div className="mb-1"><EnterpriseName enterpriseName={entName} /></div>
                            })}
                        </div>
                    </MessageModal>
                </div>
            );
        }
    }
}

EnterpriseCellDisplay.propTypes = {
    enterpriseNames: PropTypes.array    //所属名称の配列
}

/**
* 所属名称表示
*/
const EnterpriseName = ({ enterpriseName }) => {
    return (
        <span>
            {enterpriseName}
        </span>
    );
}