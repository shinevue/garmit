/**
 * Copyright 2017 DENSO Solutions
 * 
 * ImageSelectModal Reactコンポーネント
 *  
 */
'use strict';

import React, { Component } from 'react';
import { Modal } from 'react-bootstrap';

import ListDisplayTable, { makeComponentColumn} from 'Assets/ListDisplayTable';
import { CancelButton, ApplyButton } from 'Assets/GarmitButton';
import MessageModal from 'Assets/Modal/MessageModal';

import { sendData, EnumHttpMethod } from 'http-request';
import { showErrorModalInfo, closeModalInfo } from 'messageModalUtility';

const HEADER_SET = ["ファイル名", "画像"];

const Image = (props) => (
    <img border="0" src={props.url} width="128" height="128" alt={props.value} />
)

const ImageCol = makeComponentColumn(Image);

export default class ImageSelectModal extends Component {

    constructor(props) {
        super(props)
        this.state = {
            imageFileList: [],  //画像ファイル一覧
            tableData:[],       //テーブル表示用データ
            selected: props.selected,     //選択中画像情報
            selectedRowIndex: -1,          //選択中行初期値
            isLoading:false,
            messageModalInfo: {
                show: false,
                title: null,
                message: null,
                buttonStyle: null
            }
        };
    }

    /**
     * コンポーネントが新しいpropsを受け取ったとき
     * @param {any} nextProps
     */
    componentWillReceiveProps(nextProps) {
        if (!this.props.showModal && nextProps.showModal) {
            this.loadImageFileList(nextProps.selected);   //モーダル表示時に画像一覧取得
        }
    }

    /**
     * FloorMapImageファイルのリストを読み込む
     */
    loadImageFileList(selected) {
        this.setState({isLoading:true});
        sendData(EnumHttpMethod.get, '/api/floorMap/graphic/getImageList', null, (imageFileList, networkError) => {
            let tableData = [];
            if (imageFileList && imageFileList.length >0) {
                imageFileList.map((info) => {
                    tableData.push({ cells: [{ value: info.fileName }, { Component: ImageCol, url: info.url, fileName: info.fileName }] });
                })
            }
            this.setState({
                imageFileList: imageFileList, 
                tableData: tableData, 
                isLoading: false,  
                messageModalInfo: networkError ? showErrorModalInfo(NETWORKERROR_MESSAGE) : closeModalInfo()
            });
            //選択中画像がある場合は選択状態にする
            if (_.get(selected, 'fileName') && _.get(selected, 'url')) {
                const selectIndex = _.findIndex(imageFileList, { 'fileName':selected.fileName, 'url': selected.url });
                this.setState({ selected:selected, selectedRowIndex: selectIndex >= 0 ? selectIndex : null });
            }
        });
    }

    /**
     * 行クリックイベント
     */
    handleSelectRow = (rowIndex) => {
        const fileInfo = _.get(this.state.imageFileList, [rowIndex]);
        this.setState({ selected: fileInfo });
    }

    /**
     * 適用ボタンクリックイベント
     */
    handleClickApply = () => {
        this.setState({ selected: null, selectedRowIndex: null });
        if (this.props.onApply) {
            this.props.onApply(this.state.selected);
        }
    }

    /**
     * モーダルクローズイベント
     */
    handleCloseModal = () => {
        this.setState({ selected: null, selectedRowIndex:null });
        if (this.props.onClose) {
            this.props.onClose();
        }
    }

    /**
     * render
     */
    render() {
        const { showModal, onCancel, onSelect } = this.props;
        const { selected, selectedRowIndex, isLoading, tableData, messageModalInfo } = this.state;

        return (
            <Modal show={showModal} backdrop="static" onHide={this.handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>背景画像選択</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <ListDisplayTable
                        id="imageTable"
                        useCheckBox={false}
                        selectable={true}
                        selected={selectedRowIndex}
                        headerSet={HEADER_SET}
                        data={tableData}
                        zeroRecords="画像がありません。"
                        onSelectRow={this.handleSelectRow}
                    />
                </Modal.Body>
                <Modal.Footer>
                    <ApplyButton disabled={!selected} onClick={this.handleClickApply} />
                    <CancelButton onClick={this.handleCloseModal} />
                </Modal.Footer>
                <MessageModal
                    {...messageModalInfo}
                    bsSize={"sm"}
                    onCancel={() => this.setState({ messageModalInfo: closeModalInfo() })}
                >{messageModalInfo.message}
                </MessageModal>
            </Modal>
        )
    }
}
ImageSelectModal.propTypes = {
    showModal: PropTypes.bool,
    selected:PropTypes.obj,
    onSelect: PropTypes.func,
    onCancel: PropTypes.func
};