import React from "react";
import { Form, Container, Row, Col } from "react-bootstrap";
import { formatDate } from 'common/utilities'
import { ICreatedModifiedProps } from './types'

export const CreatedModifiedForm = ({ created, createdBy, modified, modifiedBy, classes }: ICreatedModifiedProps) => {
  return (
    <Container className="metadata-container my-2">
      <Row>
        <Col>
          {created &&
            <div className="metadata-field">
              <Form.Label className="metadata-label mb-0">Created By:</Form.Label>
              <div className={`metadata-value ${classes}`}>{createdBy}, {formatDate(created.date)}</div>
            </div>
          }

          {modified &&
            <div className="metadata-field mt-2">
              <Form.Label className="metadata-label mb-0">Modified By:</Form.Label>
              <div className={`metadata-value ${classes}`}>{modifiedBy}, {formatDate(modified.date)}</div>
            </div>
          }
        </Col>
      </Row>
    </Container>
  );
};
