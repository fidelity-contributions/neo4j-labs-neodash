import React from 'react';
import Card from '@material-ui/core/Card';
import AlertNodeInspectionModal from './AlertNodeInspectionModal';
import { CardContent } from '@material-ui/core';
/**
 *
 * "colorProperty": "cazzo",
 *      "titleProperty": "ciao",
 *      "bodyProperty": "apdmapwdpoawjdpjwapdjpwajdp",
 *      "refreshButtonEnabled": true
 * @returns
 */
// TODO: Understand what to show (probably an option (maybe first three fields by default))
export const AlertNodeCard = ({ entity, extensionSettings }) => {
  const [modalOpen, setModalOpen] = React.useState(false);
  // TODO: understand how to bind colors
  const colorProperty = extensionSettings.colorProperty ? extensionSettings.colorProperty : 'color';
  const titleProperty = extensionSettings.titleProperty ? extensionSettings.titleProperty : 'title';
  const bodyProperty = extensionSettings.bodyProperty ? extensionSettings.bodyProperty : 'body';
  console.log(titleProperty);
  const content = (
    <>
      <Card
        style={{ height: '120px', width: '200px', cursor: 'pointer' }}
        onClick={() => {
          setModalOpen(true);
        }}
      >
        <CardContent>
          <h3 style={{ margin: 0 }}>
            {' '}
            {entity.properties && entity.properties[titleProperty]
              ? entity.properties[titleProperty]
              : 'unknown title'}{' '}
          </h3>
          <p style={{ margin: 0 }}>
            {' '}
            {entity.properties && entity.properties[bodyProperty] ? entity.properties[bodyProperty] : '...'}{' '}
          </p>
        </CardContent>
      </Card>
      <AlertNodeInspectionModal
        entity={entity}
        modalOpen={modalOpen}
        setModalOpen={setModalOpen}
      ></AlertNodeInspectionModal>
    </>
  );
  return content;
};

export default AlertNodeCard;
