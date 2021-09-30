/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { FormGroup } from '@blueprintjs/core';
import { jsx } from '@emotion/react';
import React, { useEffect, useState } from 'react';
import MGDDisplayPane from '../../MGDComponents/MGDDisplayPane';
import { EditorModel, EditorTimerEvent } from '../../model/editormodel';
import { ModelWrapper } from '../../model/modelwrapper';
import {
  checkId,
  removeSpace,
  updatePageElement,
} from '../../utils/ModelFunctions';
import { TimerType } from '../../utils/constants';
import { NormalComboBox, NormalTextField } from '../common/fields';
import { EditPageButtons } from './commons';
import { DescriptionItem } from '../common/description/fields';

interface CommonTimerEditProps {
  onUpdateClick: () => void;
  editing: EditorTimerEvent;
  setEditing: (x: EditorTimerEvent) => void;
  onFullEditClick?: () => void;
  onDeleteClick?: () => void;
}

const EditTimerPage: React.FC<{
  modelWrapper: ModelWrapper;
  setModel: (m: EditorModel) => void;
  id: string;
  closeDialog?: () => void;
  minimal?: boolean;
  onFullEditClick?: () => void;
  onDeleteClick?: () => void;
}> = function ({
  modelWrapper,
  setModel,
  id,
  minimal,
  closeDialog,
  onDeleteClick,
  onFullEditClick,
}) {
  const model = modelWrapper.model;
  const timer = model.elements[id] as EditorTimerEvent;

  const [editing, setEditing] = useState<EditorTimerEvent>({ ...timer });

  function onUpdateClick() {
    const updated = save(id, editing, modelWrapper.page, model);
    if (updated !== null) {
      setModel({ ...updated });
      if (closeDialog !== undefined) {
        closeDialog();
      }
    }
  }

  const commonProps: CommonTimerEditProps = {
    onUpdateClick,
    editing,
    setEditing,
    onDeleteClick,
    onFullEditClick,
  };

  const fullEditProps = { closeDialog };

  useEffect(() => setEditing(timer), [timer]);

  return minimal ? (
    <QuickVersionEdit {...commonProps} />
  ) : (
    <FullVersionEdit {...commonProps} {...fullEditProps} />
  );
};

const QuickVersionEdit: React.FC<CommonTimerEditProps> = function (props) {
  const { editing, setEditing } = props;
  return (
    <FormGroup>
      <EditPageButtons {...props} />
      <DescriptionItem label="Timer ID" value={editing.id} />
      <NormalComboBox
        text="Timer Type"
        value={editing.type}
        options={TimerType}
        onChange={x => setEditing({ ...editing, type: x })}
      />
      <NormalTextField
        text="Timer parameter"
        value={editing.para}
        onChange={x => setEditing({ ...editing, para: x })}
      />
    </FormGroup>
  );
};

const FullVersionEdit: React.FC<
  CommonTimerEditProps & {
    closeDialog?: () => void;
  }
> = function (props) {
  const { editing, setEditing } = props;
  return (
    <MGDDisplayPane>
      <FormGroup>
        <EditPageButtons {...props} />
        <NormalTextField
          text="Timer ID"
          value={editing.id}
          onChange={x => setEditing({ ...editing, id: removeSpace(x) })}
        />
        <NormalComboBox
          text="Timer Type"
          value={editing.type}
          options={TimerType}
          onChange={x => setEditing({ ...editing, type: x })}
        />
        <NormalTextField
          text="Timer parameter"
          value={editing.para}
          onChange={x => setEditing({ ...editing, para: x })}
        />
      </FormGroup>
    </MGDDisplayPane>
  );
};

function save(
  oldId: string,
  timer: EditorTimerEvent,
  pageid: string,
  model: EditorModel
): EditorModel | null {
  const page = model.pages[pageid];
  if (oldId !== timer.id) {
    if (checkId(timer.id, model.elements)) {
      delete model.elements[oldId];
      updatePageElement(page, oldId, timer);
      model.elements[timer.id] = timer;
    } else {
      return null;
    }
  } else {
    model.elements[oldId] = timer;
  }
  return model;
}

export default EditTimerPage;
