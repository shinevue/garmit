/**
 * Copyright 2017 DENSO Solutions
 * 
 * PatchboardTypeSelectModal Reactコンポーネント
 *  
 */

import React, { Component } from 'react';
import { Modal } from 'react-bootstrap';

import Button from 'Common/Widget/Button';
import Icon from 'Common/Widget/Icon';
import CheckboxList from 'Common/Widget/CheckboxList';


export default class PatchboardTypeSelectModal extends Component {

    constructor(props) {
        super(props)
        this.state = {
            checkedPatchboardTypes: this.props.checkedPatchboardTypes
        }
    }

    /**
     * 新しいpropsを受け取るときに呼び出されます。
     * propsによってstateを変更する場合はここでthis.setState()を行います。このsetStateでrenderを呼ぶことはありません。
     * @param {*} nextProps 新しいprops
     */
    componentWillReceiveProps(nextProps) {
        if (this.props.checkedPatchboardTypes !== nextProps.checkedPatchboardTypes
            || this.props.showModal !== nextProps.showModal) {
            this.setState({ checkedPatchboardTypes: nextProps.checkedPatchboardTypes });
        }
    }

    /**
     * 選択肢を生成する
     */
    makeOptions() {
        const options = this.props.patchboardTypeList.map((type) => {
            return { key: type.typeId, name: type.name};
        });
        return options;
    }

    render() {
        return (
            <Modal show={this.props.showModal} backdrop="static" onHide={() => this.props.onCancel()} bsSize="sm">
                <Modal.Header closeButton>
                    <Modal.Title>配線盤種別選択</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <CheckboxList
                        items={this.makeOptions()}
                        checkedItems={this.state.checkedPatchboardTypes.map((type) => type.typeId)}
                        onChange={(val) => this.onHandleChange(val)}
                    />
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        bsStyle="primary"
                        onClick={() => this.props.onSubmit(this.state.checkedPatchboardTypes)}
                    >
                        <Icon className="fal fa-circle mr-05" />
                        <span>適用</span>
                    </Button>
                    <Button
                        iconId="uncheck"
                        bsStyle="lightgray"
                        onClick={() => this.props.onCancel()}
                    >
                        <span>キャンセル</span>
                    </Button>
                </Modal.Footer>
            </Modal>
        )
    }

    onHandleChange(val){
        const checkedTypes = val.map((key) => {
            return this.props.patchboardTypeList.find((type) => type.typeId == key);
        });
        this.setState({ checkedPatchboardTypes: checkedTypes })
    }
}

PatchboardTypeSelectModal.propTypes = {
    showModal: PropTypes.bool,
    checkedPatchboardTypes: PropTypes.array,
    onSubmit: PropTypes.func,
    onCancel: PropTypes.func
}

PatchboardTypeSelectModal.defaultProps = {
    showModal: false,
    checkedPatchboardTypes: [],
    onSubmit: () => { },
    onCancel: () => { }
}