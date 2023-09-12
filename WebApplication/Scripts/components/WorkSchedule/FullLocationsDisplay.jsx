/**
 * @license Copyright 2018 DENSO
 * 
 * フルロケーション一覧表示用 Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Icon from 'Common/Widget/Icon';
import MessageModal from 'Assets/Modal/MessageModal';

/**
 * フルロケーション一覧表示用コンポーネント
 */
export default class FullLocationsDisplay extends Component {
    
    /**
     * コンストラクタ
     */
    constructor(props) {
        super(props);
        this.state = {
            show:false  //ロケーション一覧モーダル表示状態
        };
    }

    /**
     * ロケーション一覧モーダル表示状態変更イベント
     */
    handleChangeModalState = (state) => {
        this.setState({ show: state });
    }

    /**
     * render
     */
    render() {
        const { locationStrings } = this.props;
        const { show } = this.state;

        if (_.size(locationStrings) < 1) {
            return <div />;
        }
        else if (_.size(locationStrings) < 2) {
            return (
                <div>
                    <FullLocationName fullLocationNameList={locationStrings[0]} />
                </div>
            );
        }
        else {
            return (
                <div>
                    <FullLocationName fullLocationNameList={locationStrings[0]} />...
                    <Icon
                        className="icon-garmit-detail pull-right hover-icon"
                        onClick={this.handleChangeModalState.bind(this, true)}
                    />
                    <MessageModal
                        bsSize="sm"
                        buttonStyle="message"
                        show={show}
                        title="所属ロケーション"
                        onCancel={this.handleChangeModalState.bind(this, false)}
                    >
                        <div>
                            {locationStrings.map((fullLoc) => {
                                return <div className="mb-1"><FullLocationName fullLocationNameList={fullLoc} /></div>
                            })}
                        </div>
                    </MessageModal>
                </div>
            );
        }
    }
}

FullLocationsDisplay.propTypes = {
    locationStrings: PropTypes.array    //ロケーション名称の配列
}

/**
* フルロケーション名称表示
*/
const FullLocationName = ({ fullLocationNameList }) => {
    return (
        <span>
            {_.join(fullLocationNameList, '>')}
        </span>
    );
}