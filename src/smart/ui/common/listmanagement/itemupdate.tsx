/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { FormGroup } from '@blueprintjs/core';
import { jsx } from '@emotion/react';
import React from 'react';
import MGDButton from '../../../MGDComponents/MGDButton';
import MGDButtonGroup from '../../../MGDComponents/MGDButtonGroup';
import MGDDisplayPane from '../../../MGDComponents/MGDDisplayPane';
import { IUpdateInterface } from '../fields';

const ItemUpdatePane = <T extends Object>(props: IUpdateInterface<T>) => {
  const {
    Content,
    object,
    setObject,
    model,
    table,
    updateButtonLabel,
    updateButtonIcon,
    updateClicked,
    cancelClicked,
    isVisible,
  } = props;
  if (isVisible) {
    return (
      <MGDDisplayPane>
        <FormGroup>
          <Content
            object={object}
            setObject={setObject}
            model={model}
            table={table}
          />
          <MGDButtonGroup>
            <MGDButton icon={updateButtonIcon} onClick={() => updateClicked()}>
              {updateButtonLabel}
            </MGDButton>
            <MGDButton icon="disable" onClick={() => cancelClicked()}>
              Cancel
            </MGDButton>
          </MGDButtonGroup>
        </FormGroup>
      </MGDDisplayPane>
    );
  } else {
    return <></>;
  }
};

export default ItemUpdatePane;
