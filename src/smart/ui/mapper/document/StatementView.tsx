/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { Popover2 } from '@blueprintjs/popover2';
import { jsx } from '@emotion/react';
import { useState } from 'react';
import { DocStatement } from '../../../model/document';

const StatementView: React.FC<{
  statement: DocStatement;
  showSection?: string;
  first: boolean;
  setMapping: (from: string, to: string) => void;
  froms: string[];
  MappingList: React.FC<{ id: string }>;
}> = function ({
  statement,
  first,
  showSection,
  setMapping,
  froms,
  MappingList,
}) {
  const [hover, setHover] = useState<boolean>(false);
  const hasMap = froms.length > 0;

  function onDrop(e: React.DragEvent<unknown>) {
    const fromid = e.dataTransfer.getData('text');
    setMapping(fromid, statement.id);
  }

  return (
    <Popover2 content={<MappingList id={statement.id} />} disabled={!hasMap}>
      <span
        style={{
          marginLeft: first ? '0' : '3px',
          backgroundColor: hasMap
            ? 'lightgreen'
            : hover
            ? 'lightgray'
            : 'white',
        }}
        onDrop={onDrop}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onDragEnter={() => setHover(true)}
        onDragLeave={() => setHover(false)}
      >
        {(showSection !== undefined ? `${showSection}. ` : '') + statement.text}
      </span>
    </Popover2>
  );
};

export default StatementView;
