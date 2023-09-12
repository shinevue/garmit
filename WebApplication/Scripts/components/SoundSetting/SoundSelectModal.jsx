/**
 * Copyright 2017 DENSO Solutions
 * 
 * SoundSelectModal Reactコンポーネント
 *  
 */
'use strict';

import React, { Component } from 'react';
import { Modal, Form, FormControl, ButtonToolbar } from 'react-bootstrap';

import Button from 'Common/Widget/Button';
import Icon from 'Common/Widget/Icon';
import DataTable from 'Common/Widget/DataTable';

export default class SoundSelectModal extends Component {

    constructor(props) {
        super(props)
        this.state = {
            currentPage: 1,
            pageSize: 10,
            selected: '',
            fileList: [],
            isLoading: false
        };
        this.audio;
    }

    /**
     * コンポーネントが新しいpropsを受け取ったとき
     * @param {any} nextProps
     */
    componentWillReceiveProps(nextProps) {
        if (nextProps.showModal !== this.props.showModal && nextProps.showModal) {
            this.setState({ selected: nextProps.selected || '' });
        }
    }

    /**
     * ファイルが選択された時
     */
    onFileSelect() {
        if (this.props.onAddFile) {
            const file = this.refs.file.files[0];
            this.props.onAddFile(file);
            this.refs.file.value = null;
        }
    }

    /**
     * ファイル削除ボタンがクリックされた時
     * @param {any} fileName
     */
    onDeleteClick(fileName) {
        if (this.props.onDeleteFile) {
            this.props.onDeleteFile(fileName);
        }
    }

    /**
     * 音を鳴らす
     * @param {any} fileName
     */
    playSound(fileName) {
        this.audio = new Audio(this.props.directory + '/' + fileName);
        this.setState({ playingFile: fileName }, () => {
            this.audio.play();
            this.audio.addEventListener('ended', () => {
                this.setState({ playingFile: '' });
            });
        });
    }

    /**
     * 再生を停止する
     */
    stopSound() {
        this.audio.pause();
        this.audio = new Audio();

        this.setState({ playingFile: '' });
    }

    /**
     * render
     */
    render() {
        const { showModal, onCancel, onSelect, fileList } = this.props;
        const { currentPage, pageSize, selected, isLoading } = this.state;

        const currentPageFileList = fileList.slice((currentPage - 1) * pageSize, currentPage * pageSize);

        return (
            <Modal show={showModal} onHide={() => onCancel()} backdrop="static">
                <Modal.Header closeButton>
                    <Modal.Title>サウンド選択</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <span className="pull-left">
                        <label className="btn btn-primary">
                            <input
                                ref="file"
                                type="file"
                                accept="audio/*"
                                style={{ display: 'none' }}
                                onChange={() => this.onFileSelect()}
                            />
                            <Icon className="fal fa-folder-open mr-05" />
                            <span>追加</span>
                        </label>
                    </span>
                    <span className="pull-right">
                        <Form inline>
                            <FormControl
                                componentClass="select"
                                value={pageSize}
                                onChange={(e) => this.setState({ pageSize: e.target.value, currentPage: 1 })}
                                bsSize="sm"
                            >
                                <option value="5">5</option>
                                <option value="10">10</option>
                                <option value="25">25</option>
                                <option value="50">50</option>
                            </FormControl> 件を表示
                        </Form>
                    </span>
                    <DataTable hover responsive
                        currentPage={currentPage}
                        pageSize={pageSize}
                        totalItemCount={fileList.length || 0}
                        onPageClick={(no) => this.setState({ currentPage: no })}
                    >
                        <DataTable.Header>
                            <DataTable.Row>
                                <DataTable.HeaderCell invalidSorting>ファイル名</DataTable.HeaderCell>
                                <DataTable.HeaderCell invalidSorting>操作</DataTable.HeaderCell>
                            </DataTable.Row>
                        </DataTable.Header>
                        <DataTable.Body>
                            {(currentPageFileList && currentPageFileList.length) ?
                                currentPageFileList.map((name) => {
                                    const playing = this.state.playingFile == name;

                                    return (
                                        <DataTable.Row
                                            className={selected === name && 'datatable-select-row'}
                                            onClick={() => this.setState({ selected: name })}
                                        >
                                            <DataTable.Cell>{name}</DataTable.Cell>
                                            <DataTable.Cell>
                                                <ButtonToolbar>
                                                    <Button
                                                        isCircle={true}
                                                        bsStyle={playing ? 'danger' : 'success'}
                                                        onClick={(e) => {
                                                            if (playing) {
                                                                this.stopSound();
                                                            } else {
                                                                this.playSound(name);
                                                            }
                                                            e.stopPropagation();
                                                        }}
                                                    >
                                                        <Icon className={playing ? 'fal fa-stop' : 'fal fa-play'} />
                                                    </Button>
                                                    <Button
                                                        iconId="delete"
                                                        isCircle={true}
                                                        onClick={(e) => {
                                                            this.onDeleteClick(name);
                                                            e.stopPropagation();
                                                        }}
                                                    />
                                                </ButtonToolbar>
                                            </DataTable.Cell>
                                        </DataTable.Row>    
                                    );
                                })
                                :
                                <DataTable.Row>
                                    <DataTable.Cell colSpan={2} className="ta-c">ファイルが見つかりません</DataTable.Cell>
                                </DataTable.Row>
                            }
                        </DataTable.Body>
                    </DataTable>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        bsStyle="primary"
                        onClick={() => onSelect(selected)}
                        disabled={!selected}
                    >
                        <Icon className="fal fa-circle mr-05" />
                        <span>適用</span>
                    </Button>
                    <Button
                        iconId="uncheck"
                        bsStyle="lightgray"
                        onClick={() => onCancel()}
                    >
                        <span>キャンセル</span>
                    </Button>
                </Modal.Footer>
            </Modal>
        )
    }
}