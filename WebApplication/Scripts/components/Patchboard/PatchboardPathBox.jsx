'use strict';

import React, { Component } from 'react';

import PropTypes from 'prop-types';

import SelectForm from 'Common/Form/SelectForm';

import GarmitBox from 'Assets/GarmitBox';

import PatchboardPathTreeView from 'Patchboard/PatchboardPathTreeView';

export default class PatchboardPathBox extends Component {

    constructor(props) {
        super(props);
        this.state = {

        };
    }

    /**
     * render
     */
    render() {
        const { patchboardTrees, selectedPatchboard, isLoading, selectedPathIndex, selectedPathNo } = this.props;

        return (
            <GarmitBox title="配線盤経路" isLoading={isLoading}>
                <SelectForm
                    label="経路"
                    value={selectedPathIndex}
                    options={patchboardTrees && patchboardTrees.map((pt, i) => ({ value: i, name: '経路' + (i + 1) }))}
                    onChange={(value) => this.props.onChangeSelectedPathIndex(Number(value))}
                />
                <PatchboardPathTreeView
                    patchboardTree={patchboardTrees && selectedPathIndex >= 0 && patchboardTrees[selectedPathIndex]}
                    selectedPatchboard={selectedPatchboard}
                    selectedPathNo={selectedPathNo}
                    onPatchboardSelect={(pt) => this.props.onSelectPatchboard(pt)}
                />
            </GarmitBox>
        );
    }
}

PatchboardPathBox.propTypes = {
    patchboardTrees: PropTypes.array,
    selectedPatchboard: PropTypes.object,
    onSelectPatchboard: PropTypes.func,
    isLoading: PropTypes.bool,
    selectedPathIndex: PropTypes.number,
    onChangeSelectedPathIndex: PropTypes.func,
    selectedPathNo: PropTypes.number
};