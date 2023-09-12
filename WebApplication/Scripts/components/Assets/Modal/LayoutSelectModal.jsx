/**
 * Copyright 2017 DENSO Solutions
 * 
 * レイアウト選択モーダル Reactコンポーネント
 *  
 */

import React, { Component } from 'react';

import { Modal } from 'react-bootstrap';

import Button from 'Common/Widget/Button';
import Icon from 'Common/Widget/Icon';
import LayoutTreeView from 'Assets/TreeView/LayoutTreeView';
import { ApplyButton, CancelButton} from 'Assets/GarmitButton';

export default class LayoutSelectModal extends Component {

    constructor(props) {
        super(props);
        this.state = {
            selected: this.props.selectedLayout
        };
    }

    /**
     * 新しいpropsを受け取るときに呼び出されます。
     * propsによってstateを変更する場合はここでthis.setState()を行います。このsetStateでrenderを呼ぶことはありません。
     * @param {*} nextProps 新しいprops
     */
    componentWillReceiveProps(nextProps) {
        if ((!this.props.showModal && nextProps.showModal)
            && (this.state.selected !== nextProps.selectedLayout)) {
            this.setState({ selected: nextProps.selectedLayout });
        }
    }

    //#region イベントハンドラ
    /**
     * レイアウト選択
     */
    handleSelectLayout = (selected) => {
        this.setState({ selected: selected });
    }

    /**
     * 適用ボタンクリック
     */
    handleApply=() =>{
        if (this.props.onSelect) {
            this.props.onSelect(this.state.selected);
        }
    }

    /**
     * キャンセルボタンクリック
     */
    handleCancel=()=> {
        if (this.props.onCancel) {
            this.props.onCancel();
        }
        this.setState({ selected: null });
    }
    //#endregion

    render() {

        const { showModal, layoutList, selectedLayout } = this.props;
        const { tree, selected, checkedLocations } = this.state;
        return (
            <Modal show={this.props.showModal} backdrop="static" onHide={() => this.handleCancel()}>
                <Modal.Header closeButton>
                    <Modal.Title>レイアウト選択</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <LayoutTreeView
                        layoutList={layoutList}
                        selectLayout={selectedLayout}
                        onSelectLayout={this.handleSelectLayout}
                    />
                </Modal.Body>
                <Modal.Footer>
                    <ApplyButton disabled={!selected} onClick={() => this.handleApply()} />
                    <CancelButton onClick={this.handleCancel} />
                </Modal.Footer>
            </Modal>
        )
    }
}

LayoutSelectModal.propTypes = {
    showModal: PropTypes.bool,
    layoutList: PropTypes.array,
    selectedLayout: PropTypes.object,
    onSelect: PropTypes.func,
    onCancel: PropTypes.func
}

LayoutSelectModal.defaultProps = {
    showModal: false,
    layoutList: [],
    selectedLayout: {},
    onSelect: () => { },
    onCancel: () => { }
}