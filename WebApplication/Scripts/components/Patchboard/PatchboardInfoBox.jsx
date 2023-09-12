'use strict';

import React, { Component } from 'react';

import PropTypes from 'prop-types';

import InputForm from 'Common/Form/InputForm';
import LabelForm from 'Common/Form/LabelForm';
import GarmitBox from 'Assets/GarmitBox';

import { createLocationDisplayString } from 'locationUtility';

export default class PatchboardInfoBox extends Component {

    constructor(props) {
        super(props);
        this.state = {

        };
    }

    render() {
        const { patchboard, isLoading } = this.props;

        return (
            <GarmitBox title="配線盤情報" isLoading={isLoading} >
                <InputForm>
                    <InputForm.Row>
                        <InputForm.Col label="種別" columnCount={2} >
                            <LabelForm value={patchboard && patchboard.patchboardType && patchboard.patchboardType.name} />
                        </InputForm.Col>
                        <InputForm.Col label="メタル/光" columnCount={2} >
                            <LabelForm value={patchboard && patchboard.patchboardType && patchboard.patchCableType.name} />
                        </InputForm.Col>
                    </InputForm.Row>
                    <InputForm.Row>
                        <InputForm.Col label="名称" columnCount={1} >
                            <LabelForm value={patchboard && patchboard.patchboardName} />
                        </InputForm.Col>
                    </InputForm.Row>
                    <InputForm.Row>
                        <InputForm.Col label="ロケーション" columnCount={1} >
                            <LabelForm value={patchboard && patchboard.location && createLocationDisplayString(patchboard.location)} />
                        </InputForm.Col>
                    </InputForm.Row>
                    <InputForm.Row>
                        <InputForm.Col label="開始線番" columnCount={2} >
                            <LabelForm value={patchboard && patchboard.startNo} />
                        </InputForm.Col>
                        <InputForm.Col label="終了線番" columnCount={2} >
                            <LabelForm value={patchboard && patchboard.endNo} />
                        </InputForm.Col>
                    </InputForm.Row>
                    <InputForm.Row>
                        <InputForm.Col label="備考" columnCount={1} >
                            <LabelForm value={patchboard && patchboard.memo && patchboard.memo.split(/\r\n|\n/).map((str) => <div>{str}</div>)} />
                        </InputForm.Col>
                    </InputForm.Row>
                </InputForm>
            </GarmitBox>
        );
    }
}

PatchboardInfoBox.propTypes = {
    patchboard: PropTypes.object,
    isLoading: PropTypes.bool
};