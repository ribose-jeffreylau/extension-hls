/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { FormGroup, IToaster, Toaster } from '@blueprintjs/core';
import { jsx } from '@emotion/react';
import { useState } from 'react';
import MGDButton from '../../MGDComponents/MGDButton';
import MGDButtonGroup from '../../MGDComponents/MGDButtonGroup';
import { MMELMetadata } from '../../serialize/interface/supportinterface';
import { NormalTextField } from '../common/fields';

const MetaEditPage: React.FC<{
  meta: MMELMetadata;
  setMetadata: (meta: MMELMetadata) => void;  
}> = ({ meta, setMetadata }) => {
  const [editing, setEditing] = useState<MMELMetadata>({...meta});
  const [toaster] = useState<IToaster>(Toaster.create());

  function save() {    
    setMetadata(editing);
    toaster.show({ 
      message: 'Save done',
      intent: 'success'
    });
  }

  function cancel() {
    setEditing({...meta});
    toaster.show({ 
      message: 'Reset metadata',
      intent: 'primary'
    });    
  }

  return (
    <FormGroup>
      <NormalTextField        
        text='Data Model Schema'
        value={editing.schema}
        onChange={x => {
          setEditing({ ...editing, schema: x });
        }}
      />
      <NormalTextField        
        text='Author'
        value={editing.author}
        onChange={(x: string) => {
          setEditing({ ...editing, author: x });
        }}
      />
      <NormalTextField        
        text='Title of the Data Model'
        value={editing.title}
        onChange={(x: string) => {
          setEditing({ ...editing, title: x });
        }}
      />
      <NormalTextField        
        text='Edition of the Data Model'
        value={editing.edition}
        onChange={(x: string) => {
          setEditing({ ...editing, edition: x });
        }}
      />
      <NormalTextField        
        text='Short name of the Data Model'
        value={editing.shortname}
        onChange={(x: string) => {
          setEditing({ ...editing, shortname: x });
        }}
      />
      <NormalTextField        
        text='Globally unique identifier of the Data Model (Namespace)'
        value={editing.namespace}
        onChange={(x: string) => {
          setEditing({ ...editing, namespace: x.replaceAll(/\s+/g, '') });
        }}
      />
      <MGDButtonGroup>
        <MGDButton icon='floppy-disk' onClick={save}>
          Save
        </MGDButton>
        <MGDButton icon="disable" onClick={cancel}>
          Cancel
        </MGDButton>
      </MGDButtonGroup>     
    </FormGroup>
  );
};

export default MetaEditPage;
