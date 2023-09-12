/**
 * Copyright 2017 DENSO Solutions
 * 
 * ラック電源情報ボックス Reactコンポーネント
 *  
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Button } from 'react-bootstrap';

import GarmitBox from 'Assets/GarmitBox';
import ListDisplayTable from 'Assets/ListDisplayTable';

/**
 * ラック電源情報ボックス
 */
export default class RackDetailInfoBox extends Component {

    constructor() {
        super();
        this.state = {
        };
    }

    /**********************************
    * 
    * イベントハンドラ
    * 
    **********************************/

    /**
     * render
     */
    render() {
        const { display, rackPowerInfo, isLoading } = this.props;

        if (display) {
            return (
                <GarmitBox isLoading={isLoading} title="電源情報">
                    {rackPowerInfo &&
                        <ListDisplayTable
                            id="rackPowerTable"
                            data={rackPowerInfo.rows}
                            headerSet={rackPowerInfo.headers}
                            useCheckbox={false}
                            selectable={false}
                        />
                    }
                </GarmitBox>
            );
        }
        return null;
    }

}

RackDetailInfoBox.propTypes = {
    display: PropTypes.bool,
    rackPowerInfo: PropTypes.array,
    isLoading: PropTypes.bool
};
