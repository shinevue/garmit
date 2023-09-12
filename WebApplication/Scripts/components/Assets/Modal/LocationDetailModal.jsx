/**
 * Copyright 2017 DENSO Solutions
 * 
 * LocationDetailModal Reactコンポーネント
 *  
 */
'use strict';

import React, { Component } from 'react';
import MessageModal from 'Assets/Modal/MessageModal';

const LocationDetailModal = ({ show, locationList, onCancel }) => {
    return (
        <MessageModal
            bsSize="md"
            buttonStyle="message"
            show={show}
            title="ロケーション"
            onCancel={onCancel}
        >
            {locationList && locationList.map((location) => {
                return <div>{location}</div>
            })}
        </MessageModal>
    );
}

export default LocationDetailModal;

LocationDetailModal.propTypes = {
    show: PropTypes.bool.isRequired,
    locationList: PropTypes.array,
    onCancel:PropTypes.func
}