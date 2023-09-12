/**
 * Copyright 2017 DENSO Solutions
 * 
 * MaintenanceScheduleModal Reactコンポーネント
 *  
 */

import React, { Component } from 'react';
import { Button, Modal, FormControl, FormGroup, Checkbox, Grid, Row, Col, Table } from 'react-bootstrap';

import SelectForm from 'Common/Form/SelectForm';
import LabelForm from 'Common/Form/LabelForm';
import TextForm from 'Common/Form/TextForm';
import DateTimePicker from 'Common/Widget/DateTimePicker';

export default class MaintenanceScheduleModal extends Component {

    constructor(props) {
        super(props)
        this.state = {

        }
    }

    /**
     * render
     */
    render() {
        const { showModal, onHide, maintenanceSchedules, pointNo } = this.props;
        const { datagate, address } = this.state; 


        return (
            <Modal show={showModal} onHide={() => onHide()}>
                <Modal.Header closeButton>
                    <Modal.Title>メンテナンススケジュール</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {maintenanceSchedules &&
                        <Table bordered responsive>
                            <thead>
                                <tr>
                                    <th>スケジュール名</th>
                                    <th>開始日時</th>
                                    <th>終了日時</th>
                                    <th>アラーム監視</th>
                                </tr>
                            </thead>
                            <tbody>
                            {maintenanceSchedules.map((schedule) => {
                                const point = schedule.points.find((p) => p.pointNo == pointNo);

                                return (
                                    <tr>
                                        <td>{schedule.name}</td>
                                        <td>{moment(schedule.startDate).format('YYYY/MM/DD HH:mm')}</td>
                                        <td>{moment(schedule.endDate).format('YYYY/MM/DD HH:mm')}</td>
                                        <td>{point.maintMode ? '監視しない' : '監視する'}</td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </Table>
                    }
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={() => onHide()}>閉じる</Button>
                </Modal.Footer>
            </Modal>
        )
    }
}