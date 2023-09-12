/**
 * @license Copyright 2018 DENSO
 * 
 * ロケーションのパンくずリスト Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Breadcrumb } from 'react-bootstrap';

/**
 * ロケーションのパンくずリストコンポーネント
 * ロケーションの配列を渡すこと。ロケーションの配列がnullもしくはundefinedの場合は非表示。
 * [{id:1, name:'東京第一センター'},{id:11, name:'A棟'},{id:111, name:'1階'},{id:1111, name:'1列'},{id:11111, name:'RackA1101'}]
 * @param {array} locationList ロケーション配列
 */
export default class LocationBreadcrumb extends Component {
    /**
     * render
     */
    render() {
        const { locationList, className } = this.props;
        return (
            <ol className={classNames('location-breadcrumb', className)} >        
                {locationList&&locationList.map((location) => 
                    <li tag={location.id}>{location.name}</li>
                )}
            </ol>
        );
    }
}

LocationBreadcrumb.propTypes = {
    locationList: PropTypes.arrayOf({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired
    })
};